export interface Room {
    id: string
    roomName: string
    users: string[]
    capacity: number
    backgroundImage: string | null
    isDefault: boolean | null
}