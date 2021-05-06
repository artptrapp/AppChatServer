import expressJwt from 'express-jwt';

export default function jwt() {
    return expressJwt(
        {
            // paths that need jwt
            secret: "my-secret"
        }).unless({
            path: [
                // paths that do not need jwt
                '/health-check'
            ]
        })
}