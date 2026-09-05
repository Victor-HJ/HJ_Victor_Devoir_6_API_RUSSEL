/** 
 * @fileoverview Security tokens middleware
 * @module middlewares/private
 */

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

/**
 * CHECKING USER <br><br>
 * 
 * - Check user token (401)
 * - Create new token
 * 
 * @param {Request} req Express request
 * @param {Response} res Express response
 * @param {NextFunction} next Callback to next function
 */

exports.checkJWT = async (req, res, next) => {

    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if(!!token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if(token) {

        jwt.verify(token, SECRET_KEY, (err, decoded) => {

            if(err) {
                
                return res.status(401).json('invalid_token');

            } else {

                req.decoded = decoded;

                const expiresIn = 24 * 60 * 60;
                const newToken = jwt.sign(
                    {user : decoded.user},
                    SECRET_KEY,
                    {expiresIn : expiresIn}
                );

                res.header('Authorization', 'Bearer ' + newToken);
                next ();

            }
        });

    } else {

        return res.status(401).json('token_required');

    }
}