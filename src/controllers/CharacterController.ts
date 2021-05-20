import { Express, Request, Response } from 'express-serve-static-core'
import BaseController from "./BaseController";
import characterBlo from '../blo/characterBLO';
import { decodeJwt, extractTokenFromHeader } from '../utils/Jwt';

export default class CharacterController extends BaseController {
    private serverInstance: Express

    constructor(server: Express) {
        super()
        this.serverInstance = server;
        this.buildRoutes()
    }

    private buildRoutes() {
        this.serverInstance.post('/user/:userId/character', this.createCharacter.bind(this))
        this.serverInstance.get('/character/:characterId', this.getCharacter.bind(this))
        this.serverInstance.get('/user/:userId/character', this.getUserCharacters.bind(this))
    }

    private async createCharacter(req: Request, res: Response) {
        const body = req.body
        try {
            const user = decodeJwt(extractTokenFromHeader(req.headers.authorization));

            if (user.username !== req.params.userId) {
                return res.status(401).send('You cannot create a character for this user.')
            }

            const creationResult = await characterBlo.createCharacter({
                user: user.username,
                data: body
            })
            if (creationResult.success) {
                return res.status(201).json(creationResult)
            } else {
                return res.status(400).json(creationResult)
            }
        } catch (e) {
            return res.status(500).send(e.message)
        }
    }

    private async getCharacter(req: Request, res: Response) {
        const { characterId } = req.params

        try {
            const character = await characterBlo.getCharacter(characterId)
            if (!character) {
                return res.status(404).send(`Character with id ${characterId} does not exist`)
            }

            return res.status(200).json(character)
        } catch (e) {
            return res.status(500).send(e.message)
        }
    }

    private async getUserCharacters(req: Request, res: Response) {
        const { userId } = req.params

        try {
            const characters = await characterBlo.getByUser(userId)

            return res.status(200).json(characters)
        } catch (e) {
            return res.status(500).send(e.message)
        }
    }
}