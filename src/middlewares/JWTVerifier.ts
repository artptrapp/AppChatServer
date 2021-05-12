import expressJwt from 'express-jwt';

const JWTSECRET = "this-is-my-secret-information"

export default function jwt() {
    return expressJwt(
        {
            secret: JWTSECRET,
            algorithms: ['RS256']
        }).unless({
            path: [
                // paths that do not need jwt
                '/health-check',
                '/rooms/default',
                '/auth/register'
            ]
        })
}