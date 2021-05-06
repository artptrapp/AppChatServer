import { Socket } from "socket.io"

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