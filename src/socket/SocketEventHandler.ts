import { Socket } from "socket.io";

export default interface SocketEventHandler {
    /**
     * Destroys the socket event handler instance, and detach all events from it
     */
    destroy(): void

    /**
     * Every socket handler should handle a client disconnection
     */
    handleClientDisconnection(client: Socket): void

    /**
    * Every socket handler should handle a client connection
    */
    handleClientConnection(client: Socket): void
}
