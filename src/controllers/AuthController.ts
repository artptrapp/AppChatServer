import { Express, Request, Response } from 'express-serve-static-core'
import authBlo from '../blo/AuthBLO';
import BaseController from "./BaseController";

export default class AuthController extends BaseController {
    private serverInstance: Express

    constructor(server: Express) {
        super()
        this.serverInstance = server;
        this.buildRoutes()
    }

    private buildRoutes() {
        this.serverInstance.post('/auth/register', this.register.bind(this))
        this.serverInstance.post('/auth/login', this.login.bind(this))
    }

    private async register(req: Request, res: Response) {
        const body = req.body
        try {
            const registerResult = await authBlo.register(body)
            if (registerResult.success) {
                return res.status(201).json(registerResult)
            } else {
                return res.status(400).json(registerResult)
            }
        } catch (e) {
            return res.status(500).send(e.message)
        }
    }

    private async login(req: Request, res: Response) {
        const body = req.body
        try {
            const loginResult = await authBlo.login(body)
            if (loginResult.success) {
                return res.status(200).json(loginResult)
            } else {
                return res.status(400).json(loginResult)
            }
        } catch (e) {
            return res.status(500).send(e.message)
        }
    }
}