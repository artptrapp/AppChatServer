import { DynamoDB } from "aws-sdk"
import { PutItemInput, QueryInput } from "aws-sdk/clients/dynamodb"
import { RegisterPayload, RegisterPayloadResult } from "../models/User"
import encryptString from "../utils/Encryption"

class AuthBLO {

    private readonly TABLE_NAME = "Users"
    private dbClient = new DynamoDB.DocumentClient({ region: 'us-east-1' })

    public async register(payload: RegisterPayload): Promise<RegisterPayloadResult> {
        if (!payload.username || !payload.password || !payload.passwordConfirmation) {
            return {
                reason: 'Missing information',
                success: false
            }
        }

        if (payload.passwordConfirmation !== payload.password) {
            return {
                reason: 'Passwords do not match',
                success: false
            }
        }

        if (payload.password.length < 5) {
            return {
                reason: 'Password too short',
                success: false
            }
        }

        if (payload.username.length < 5 || payload.username.length > 15 || payload.username.indexOf(' ') > -1) {
            return {
                reason: 'Username needs to be between 5 and 15 characters and should not contains spaces',
                success: false
            }
        }

        const queryParameters = {
            TableName: this.TABLE_NAME,
            KeyConditionExpression: 'username = :username',
            ExpressionAttributeValues: {
                ":username": payload.username
            }
        }

        const results = await this.dbClient.query(queryParameters).promise()

        if (results.Count) {
            return {
                reason: 'Username already exists',
                success: false
            }
        }

        const newUserPayload = {
            username: payload.username,
            encryptedPassword: encryptString(payload.password)
        }

        const putItemPayload = {
            TableName: this.TABLE_NAME,
            Item: newUserPayload
        }

        await this.dbClient.put(putItemPayload).promise()
        return {
            reason: 'Registered succesfully',
            success: true
        }
    }

}

const authBlo = new AuthBLO()
export default authBlo