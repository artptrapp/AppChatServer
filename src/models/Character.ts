export type House = 'HUFFLEPUFF' | 'GRYFFINDOR' | 'SLYTHERIN' | 'RAVENCLAW'

export type Role = 'ALUMNI' | 'TEACHER' | 'OTHER'

export interface CreateCharacterResult {
    success: boolean,
    resourceUrl?: string,
    reason: string
}

export interface CreateCharacterPayload {
    user: string,
    data: CharacterData
}

export interface CharacterData {
    characterName: string
    currentYear: number
    role: Role
    roleDescription: string
    house: House
    backgroundStory: string
    photoUrl: string
}