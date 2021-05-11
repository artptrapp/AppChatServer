import { Express, Request, Response } from "express-serve-static-core";
import roomBLO from '../blo/RoomBLO'
import BaseController from "./BaseController";
import logger from '../utils/logger'

export default class RoomController extends BaseController {
    private serverInstance: Express

    constructor(server: Express) {
        super()
        this.serverInstance = server;
        this.buildRoutes()
    }

    private buildRoutes() {
        logger.logMessage('I was here')
        this.serverInstance.get('/rooms/default', this.getDefaultRooms.bind(this))
        this.serverInstance.get('/rooms/all', this.getAllRooms.bind(this))
    }

    private async getDefaultRooms(req: Request, res: Response): Promise<Response> {
        try {
            const rooms = await roomBLO.getDefaultRooms()
            return res.status(200).json(rooms)
        } catch (e) {
            return res.status(500).send('An error ocurred.' + e.message)
        }
    }

    private async getAllRooms(req: Request, res: Response): Promise<Response> {
        try {
            const rooms = await roomBLO.getDefaultRooms()
            return res.status(200).json(rooms)
        } catch (e) {
            return res.status(500).send('An error ocurred.' + e.message)
        }
    }
}