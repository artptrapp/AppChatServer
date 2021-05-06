import { Server, Socket } from "socket.io"
import User from "../models/User"
import SocketEventHandler from "./SocketEventHandler"
import logger from '../utils/logger'
import userPool from '../utils/UserSocketPool'
import { newGuid } from '../utils/Guid'

type CreateRoomArguments = {
    roomName: string
    capacity: number
}

type JoinRoomArguments = {
    roomName: string
}

export type Room = {
    id: string
    roomName: string
    users: string[]
    capacity: number
}

class RoomEventsHandler implements SocketEventHandler {

    private serverInstance: Server
    private createdRooms: Room[] = []

    private intervalId: NodeJS.Timeout;

    constructor(serverInstance: Server) {
        this.serverInstance = serverInstance;
        this.intervalId = setInterval(this.checkRoomActivity.bind(this), 10000)
    }

    attachClientRoomEvents(client: Socket) {
        client.on('join-room', (args, callback) => this.handleRoomJoining(client, args, callback))
        client.on('create-room', (args, callback) => this.handleRoomCreation(client, args, callback))
        client.on('leave-room', (_, callback) => this.handleRoomLeaving(client, callback))
        client.on('get-rooms', (_, callback) => this.handleGetRooms(client, callback))
    }

    handleClientConnection(client: Socket): void {
        this.attachClientRoomEvents(client)
    }

    handleClientDisconnection(client: Socket): void {
        client.removeAllListeners()
    }

    handleGetRooms(roomAsker: Socket, callback: Function) {
        const friendlyRooms = []
        for (let room of this.createdRooms) {
            friendlyRooms.push({
                id: room.id,
                capacity: room.capacity,
                name: room.roomName,
                userCount: room.users.length,
                users: room.users.map(user => userPool.getUser(user).username)
            })
        }

        callback(friendlyRooms)
    }

    handleRoomLeaving(roomJoiner: Socket, callback: Function) {
        const currentUser = userPool.getUser(roomJoiner.id)
        if (!currentUser || !currentUser.currentRoom || !currentUser.socket.connected) {
            return
        }

        currentUser.socket.leave(currentUser.currentRoom)
    }

    handleRoomJoining(roomJoiner: Socket, args: JoinRoomArguments, callback: Function) {
        const existingRoom = this.createdRooms.find(room => room.roomName === args.roomName)
        if (!existingRoom) {
            return callback({ success: false, reason: `There is no room named ${args.roomName}` })
        }

        if (existingRoom.users.length === (existingRoom.capacity)) {
            return callback({ success: false, reason: `The room named ${args.roomName} is full.` })
        }

        roomJoiner.join(existingRoom.id)
        existingRoom.users = [...existingRoom.users, roomJoiner.id]

        return callback({ success: true, reason: `Room with name ${args.roomName} joined successfully.` })
    }

    handleRoomCreation(roomCreator: Socket, args: CreateRoomArguments, callback: Function) {
        if (!args.roomName || (args.roomName.length > 10)) {
            return callback({ success: false, reason: 'Room name should be not empty and less than 10 characters in length.' })
        }

        if (!args.capacity || isNaN(args.capacity) || args.capacity < 0) {
            return callback({ success: false, reason: 'Capacity should be a number bigger than 0' })
        }

        const roomExists = this.createdRooms.some(room => room.roomName === args.roomName)
        if (roomExists) {
            return callback({ success: false, reason: 'Room with this name already exists' })
        }

        const room: Room = {
            id: newGuid(),
            roomName: args.roomName,
            capacity: +args.capacity,
            users: [roomCreator.id]
        }

        this.createdRooms.push(room)

        return callback({ success: true, reason: `Room with name ${args.roomName} created successfully.` })
    }

    private checkRoomActivity() {
        const activeRooms = []
        for (let i = 0; i < this.createdRooms.length; i++) {
            const room = this.createdRooms[i]
            const isEveryoneDisconnected = room.users.every(user => !userPool.isConnected(user))
            if (!isEveryoneDisconnected) {
                activeRooms.push(room)
            } else {
                logger.warnMessage(`Room with name ${room.roomName} will be cleaned up because nobody is connected`)
            }
        }

        this.createdRooms = activeRooms;
    }

    destroy() {
        clearInterval(this.intervalId)
    }

}

export default RoomEventsHandler