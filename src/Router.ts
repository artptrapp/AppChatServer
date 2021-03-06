import { Express } from 'express-serve-static-core'
import AuthController from './controllers/AuthController'
import BaseController from './controllers/BaseController'
import CharacterController from './controllers/CharacterController'
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
        this.controllers.push(new AuthController(this.serverInstance))
        this.controllers.push(new CharacterController(this.serverInstance));
    }

}