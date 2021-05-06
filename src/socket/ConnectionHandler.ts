import { Server, Socket } from "socket.io";
import User from "../models/User";
import logger from '../utils/logger'
import RoomEventsHandler from "./RoomEventHandler";
import SocketEventHandler from "./SocketEventHandler";
import UserSocketPool from '../utils/UserSocketPool';
import UserEventsHandler from "./UserEventsHandler";

export interface ConnectedClients {
    [key: string]: User
}

export type SocketEvents = string

class SocketConnectionHandler {
    private serverInstance: Server;
    private clientCount = 0;
    private eventHandlers: SocketEventHandler[] = []

    constructor(socketServer: Server) {
        this.serverInstance = socketServer;
        this.initializeSocketEventHandlers()
        this.attachBasicEvents()
    }

    private initializeSocketEventHandlers() {
        this.eventHandlers.push(new RoomEventsHandler(this.serverInstance))
        this.eventHandlers.push(new UserEventsHandler())
    }

    // Start accepting connections from client sockets.
    private attachBasicEvents() {
        this.serverInstance.on('connection', this.handleClientConnection.bind(this));
    }

    // handles a client connection.
    private handleClientConnection(client: Socket) {
        UserSocketPool.addUser(client.id, new User("", client));
        this.clientCount++;

        logger.logMessage(`There are ${this.clientCount} clients connected.`)
        logger.warnMessage(`Client with id ${client.id} connected.`)

        // tells every connected client that someone new has arrived
        this.serverInstance.emit('user-connected', {
            message: `User with id ${client.id} has connected.`,
            totalConnectedClients: this.clientCount
        })

        // tells every handler that cares that a new client connected
        this.eventHandlers.forEach(eventHandler => eventHandler.handleClientConnection(client))

        client.on('disconnect', this.handleClientDisconnection.bind(this, client));
    }

    // handles a client disconnection
    private handleClientDisconnection(client: Socket) {
        UserSocketPool.removeUser(client.id)
        this.clientCount--;
        logger.warnMessage(`Client with id ${client.id} disconnected.`)
        logger.logMessage(`There are ${this.clientCount} clients connected.`)

        // tells every connected client that someone has left
        this.serverInstance.emit('user-disconnected', {
            message: `User with id ${client.id} has disconnected.`,
            totalConnectedClients: this.clientCount
        })

        // tells every handler that cares that a client disconnected
        this.eventHandlers.forEach(eventHandler => eventHandler.handleClientDisconnection(client))
    }
}

export default SocketConnectionHandler
