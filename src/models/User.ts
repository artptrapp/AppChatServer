import { Socket } from "socket.io"

export interface RegisterPayload {
    username: string,
    password: string,
    passwordConfirmation: string
}

export interface RegisterPayloadResult {
    success: boolean,
    reason: string
}

class User {
    public username: string
    public socket: Socket;
    public currentRoom: string | null = null

    constructor(username: string, socket: Socket) {
        this.username = username;
        this.socket = socket;
    }

    public setRoom(roomId: string) {
        this.currentRoom = roomId
    }
}

export default User