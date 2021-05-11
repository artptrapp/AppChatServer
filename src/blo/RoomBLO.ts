import { Room } from "../models/Room"
import { DynamoDB } from 'aws-sdk'
import userPool from "../utils/UserSocketPool"

class RoomBLO {

    private readonly TABLE_NAME = "Rooms"
    private dbClient = new DynamoDB.DocumentClient()

    public async getDefaultRooms(): Promise<Room[]> {
        const queryParameters = {
            TableName: this.TABLE_NAME,
            FilterExpression: "isDefault = :default",
            ExpressionAttributeValues: {
                ":default": true
            }
        }

        const results = await this.dbClient.scan(queryParameters).promise()
        const returnValue: Room[] = []
        results.Items?.forEach(item => {
            returnValue.push({
                id: item["id"],
                capacity: item["capacity"],
                isDefault: item["isDefault"],
                roomName: item["roomName"],
                users: userPool.getByRoom(item["id"]).map(x => x.username),
                backgroundImage: item["backgroundImage"]
            })
        })

        return returnValue
    }

}

const roomBLO = new RoomBLO()
export default roomBLO