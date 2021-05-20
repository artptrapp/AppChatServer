import { Server, Socket } from "socket.io"
import SocketEventHandler from "./SocketEventHandler"
import logger from '../utils/logger'
import userPool from '../utils/UserSocketPool'
import { newGuid } from '../utils/Guid'
import { Room } from "../models/Room"
import roomBLO from "../blo/RoomBLO"

type CreateRoomArguments = {
    roomName: string
    capacity: number
}

type JoinRoomArguments = {
    roomName: string
}

type ChatMessage = {
    content: string
}

class RoomEventsHandler implements SocketEventHandler {

    private serverInstance: Server
    private createdRooms: Room[] = []

    private intervalId: NodeJS.Timeout;

    constructor(serverInstance: Server) {
        this.serverInstance = serverInstance;
        this.intervalId = setInterval(this.checkRoomActivity.bind(this), 10000)
        this.loadDefaultRooms()
    }

    private async loadDefaultRooms() {
        const defaultRooms = await roomBLO.getDefaultRooms()
        this.createdRooms = this.createdRooms.concat(defaultRooms)

        logger.logMessage(JSON.stringify(this.createdRooms))
    }

    attachClientRoomEvents(client: Socket) {
        client.on('join-room', (args, callback) => this.handleRoomJoining(client, args, callback))
        client.on('create-room', (args, callback) => this.handleRoomCreation(client, args, callback))
        client.on('leave-room', (_) => this.handleRoomLeaving(client))
        client.on('get-rooms', (_, callback) => this.handleGetRooms(client, callback))
        client.on('chat-message', (args: ChatMessage, callback: Function) => this.handleMessage(client, args, callback))
    }

    handleMessage(client: Socket, args: ChatMessage, callback: Function): void {
        const senderData = userPool.getUser(client.id)
        if (!senderData || !senderData.currentRoom) {
            return callback({ success: false, reason: 'Invalid sender or room requested' })
        }

        this.serverInstance.to(senderData.currentRoom).emit('chat-message', args)
        return callback({ success: true, reason: 'Message sent successfully' })
    }

    handleClientConnection(client: Socket): void {
        this.attachClientRoomEvents(client)
    }

    handleClientDisconnection(client: Socket): void {
        client.removeAllListeners()
        this.handleRoomLeaving(client)
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

    handleRoomLeaving(roomJoiner: Socket) {
        const currentUser = userPool.getUser(roomJoiner.id)

        logger.logMessage(`Will remove user ${currentUser.username} from the room`)

        // do not check for currentUser.socket.disconnected here because
        // we still need to remove him from the room in case his internet
        // went out or something
        if (!currentUser || !currentUser.currentRoom) {
            return
        }

        currentUser.socket.leave(currentUser.currentRoom)

        // removes user from the room
        const room = this.createdRooms.find(room => room.id === currentUser.currentRoom)
        const userIndexOnRoom = room?.users.findIndex(user => user === roomJoiner.id);
        if (userIndexOnRoom !== undefined) {
            room?.users.splice(userIndexOnRoom, 1);
        }

        logger.logMessage(JSON.stringify(room))

        currentUser.setRoom("")
    }

    handleRoomJoining(roomJoiner: Socket, args: JoinRoomArguments, callback: Function) {
        logger.logMessage(JSON.stringify(this.createdRooms))
        const existingRoom = this.createdRooms.find(room => room.roomName === args.roomName || room.id === args.roomName)
        if (!existingRoom) {
            return callback({ success: false, reason: `There is no room named ${args.roomName}` })
        }

        if (existingRoom.users.length === (existingRoom.capacity)) {
            return callback({ success: false, reason: `The room named ${args.roomName} is full.` })
        }

        roomJoiner.join(existingRoom.id)
        existingRoom.users = [...existingRoom.users, roomJoiner.id]

        userPool.getUser(roomJoiner.id).setRoom(existingRoom.id)

        return callback({ success: true, reason: `Room with name ${args.roomName} joined successfully.` })
    }

    handleRoomCreation(roomCreator: Socket, args: CreateRoomArguments, callback: Function) {
        if (!args.roomName || (args.roomName.length > 10)) {
            return callback({ success: false, reason: 'Room name should be not empty and less than 10 characters in length.' })
        }

        if (!args.capacity || isNaN(args.capacity) || args.capacity < 0) {
            return callback({ success: false, reason: 'Capacity should be a number bigger than 0' })
        }

        const roomExists = this.createdRooms.some(room => room.roomName === args.roomName || room.id === args.roomName)
        if (roomExists) {
            return callback({ success: false, reason: 'Room with this name already exists' })
        }

        const room: Room = {
            id: newGuid(),
            roomName: args.roomName,
            capacity: +args.capacity,
            users: [roomCreator.id],
            backgroundImage: null,
            isDefault: false
        }

        this.createdRooms.push(room)

        roomCreator.join(room.id)
        userPool.getUser(roomCreator.id).setRoom(room.id)

        return callback({ success: true, reason: `Room with name ${args.roomName} created successfully.` })
    }

    private checkRoomActivity() {
        const activeRooms = []
        for (let i = 0; i < this.createdRooms.length; i++) {
            const room = this.createdRooms[i]
            // we should not delete default rooms
            if (room.isDefault) {
                logger.warnMessage(`There is no one at room ${room.roomName}, but it will not be deleted as it is a default room`)
                activeRooms.push(room)
                continue
            }
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