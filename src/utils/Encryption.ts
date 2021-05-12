import * as crypto from 'crypto'

const algorithm = 'aes-256-ctr';
const secretWord = "banana"
const secretKey = crypto.createHash('sha256').update(String(secretWord)).digest('base64').substr(0, 32)
const iv = crypto.randomBytes(16);

export default function encryptString(value: string) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
    const encrypted = Buffer.concat([cipher.update(value), cipher.final()])

    return encrypted.toString('hex')
}