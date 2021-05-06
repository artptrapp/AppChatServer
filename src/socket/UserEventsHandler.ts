import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import SocketEventHandler from "./SocketEventHandler";
import userPool from "../utils/UserSocketPool";

type SetUsernameArgs = {
    username: string
}

class UserEventsHandler implements SocketEventHandler {

    attachClientEvents(client: Socket) {
        client.on('set-username', (args: SetUsernameArgs) => {
            userPool.editUserInformation(client.id, args.username)
        })
    }

    destroy(): void {
        throw new Error("Method not implemented.");
    }

    handleClientDisconnection(client: Socket<DefaultEventsMap, DefaultEventsMap>): void {
        client.removeAllListeners('set-username')
    }

    handleClientConnection(client: Socket<DefaultEventsMap, DefaultEventsMap>): void {
        this.attachClientEvents(client)
    }

}

export default UserEventsHandler