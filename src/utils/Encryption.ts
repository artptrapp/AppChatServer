import * as crypto from 'crypto'

const algorithm = 'sha256';

export default function encryptString(value: string) {
    return crypto.createHash(algorithm).update(value).digest('hex');
}