import User from "../models/User"
import { ConnectedClients } from "../socket/ConnectionHandler"

class UserSocketPool {
    private users: ConnectedClients = {}

    // adds an user to the pool
    public addUser(socketId: string, user: User): boolean {
        if (this.users[socketId] && this.users[socketId].socket.connected) {
            return false
        }

        this.users[socketId] = user
        return true;
    }

    public removeUser(socketId: string): boolean {
        delete this.users[socketId]
        return true;
    }

    public editUserInformation(socketId: string, username: string): boolean {
        if (!this.users[socketId] || !this.users[socketId].socket.connected) {
            return false
        }

        this.users[socketId].username = username
        return true
    }

    public addUserToRoom(socketId: string, roomId: string): boolean {
        const existingUser = this.users[socketId]
        if (!existingUser || !existingUser.socket.connected) {
            return false
        }

        if (existingUser.currentRoom) {
            return false
        }

        existingUser.setRoom(roomId)
        return true
    }

    public getUser(socketId: string): User {
        return this.users[socketId]
    }

    public isConnected(socketId: string): boolean {
        return this.users[socketId] && this.users[socketId].socket.connected
    }
}

const userPool = new UserSocketPool()
export default userPool