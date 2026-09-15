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
    console.log(req.cookies);
    const token = req.cookies.token;
    console.log(token);

    if(!token) {
        console.log('no token');
        return res.redirect('/');

    }

    try {

        const authorized = jwt.verify(token, process.env.SECRET_KEY);

        req.user = authorized.user;

        next();

    } catch (error) {

        return res.redirect('/');
        
    }
};