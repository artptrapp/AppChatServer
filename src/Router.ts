import { Express } from 'express-serve-static-core'
import BaseController from './controllers/BaseController'
import RoomController from './controllers/RoomController'

export default class Router {

    private controllers: BaseController[] = []
    private serverInstance: Express

    constructor(server: Express) {
        this.serverInstance = server
        this.initializeControllers()
    }

    private initializeControllers() {
        this.controllers.push(new RoomController(this.serverInstance))
    }

}