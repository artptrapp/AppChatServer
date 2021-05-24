import { DynamoDB } from "aws-sdk";
import { GetItemInput, QueryInput } from "aws-sdk/clients/dynamodb";
import { CharacterData, CreateCharacterPayload, CreateCharacterResult } from '../models/Character'
import { newGuid } from "../utils/Guid";

class CharacterBLO {
    private readonly TABLE_NAME = "Character"
    private dbClient = new DynamoDB.DocumentClient({ region: 'us-east-1' })

    public async createCharacter(payload: CreateCharacterPayload): Promise<CreateCharacterResult> {
        if (!payload.data.characterName || !payload.data.house) {
            return {
                reason: 'Character name and house are mandatory',
                success: false
            }
        }

        if (!(['RAVENCLAW', 'SLYTHERIN', 'HUFFLEPUFF', 'GRYFFINDOR'].includes(payload.data.house))) {
            return {
                reason: 'Invalid house',
                success: false
            }
        }

        const newCharacter = {
            id: newGuid(),
            characterName: payload.data.characterName,
            backgroundStory: payload.data.backgroundStory,
            role: 'ALUMNI',
            currentYear: 1,
            roleDescription: 'A regular student in the school.',
            photoUrl: null,
            house: payload.data.house,
            owner: payload.user
        }

        const putItemPayload = {
            TableName: this.TABLE_NAME,
            Item: newCharacter
        }

        await this.dbClient.put(putItemPayload).promise()

        return {
            reason: 'Created successfully',
            success: true,
            resourceUrl: `/character/${newCharacter.id}`
        }
    }


    public async getCharacter(id: string): Promise<CharacterData | null> {
        if (!id) {
            return null
        }

        const queryParameters = {
            TableName: this.TABLE_NAME,
            Key: {
                "id": id
            }
        }

        const item = await this.dbClient.get(queryParameters).promise()
        return item.Item as CharacterData
    }

    public async getByUser(id: string): Promise<CharacterData[]> {
        if (!id) {
            return []
        }

        const queryParameters = {
            TableName: this.TABLE_NAME,
            FilterExpression: '#owner = :user',
            ExpressionAttributeNames: {
                '#owner': 'owner'
            },
            ExpressionAttributeValues: {
                ':user': id
            }
        }

        const result = await this.dbClient.scan(queryParameters).promise();
        return result.Items as CharacterData[]
    }
}

const characterBlo = new CharacterBLO();
export default characterBlo