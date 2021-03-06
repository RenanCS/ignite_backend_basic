
const cors = require('cors');
const express = require('express');

const { checkRefreshTokenIsValid, users, seedUserStore, invalidateRefreshToken } = require('./database');
const { generateJwtAndRefreshToken } = require('./auth');
const { auth } = require('./config');

const jwt = require('jsonwebtoken');
const decode = require('jwt-decode');

const port = process.env.PORT || 3333;

const app = express();
app.use(express.json());
app.use(cors());

seedUserStore();

function checkAuthMiddleware(request, response, next) {
    const { authorization } = request.headers;

    if (!authorization) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Token not present.' })
    }

    const [, token] = authorization?.split(' ');

    if (!token) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Token not present.' })
    }

    try {

        const decoded = jwt.verify(String(token), auth.secret);
        request.user = decoded.sub;

        return next();
    } catch (err) {

        return response
            .status(401)
            .json({ error: true, code: 'token.expired', message: 'Token invalid.' })
    }
}

function addUserInformationToRequest(request, response, next) {

    const { authorization } = request.headers;

    if (!authorization) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Token not present.' })
    }

    const [, token] = authorization?.split(' ');

    if (!token) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Token not present.' })
    }

    try {
        const decoded = decode(String(token));

        request.user = decoded.sub;

        return next();
    } catch (err) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Invalid token format.' })
    }
}



app.get('/', (request, response) => {
    return response.send("Backend rodando");
});

app.post('/sessions', (request, response) => {

    const { email, password } = request.body;

    const user = users.get(email);

    if (!user || password !== user.password) {
        return response
            .status(401)
            .json({
                error: true,
                message: 'E-mail or password incorrect.'
            });
    }

    const { token, refreshToken } = generateJwtAndRefreshToken(email, {
        permissions: user.permissions,
        roles: user.roles,
    })

    return response.json({
        token,
        refreshToken,
        permissions: user.permissions,
        roles: user.roles,
    });
});


app.post('/refresh', addUserInformationToRequest, (request, response) => {

    const email = request.user;
    const { refreshToken } = request.body;

    const user = users.get(email);

    if (!user) {
        return response
            .status(401)
            .json({
                error: true,
                message: 'User not found.'
            });
    }

    if (!refreshToken) {
        return response
            .status(401)
            .json({ error: true, message: 'Refresh token is required.' });
    }

    const isValidRefreshToken = checkRefreshTokenIsValid(email, refreshToken)

    if (!isValidRefreshToken) {
        return response
            .status(401)
            .json({ error: true, message: 'Refresh token is invalid.' });
    }

    invalidateRefreshToken(email, refreshToken)

    const { token, refreshToken: newRefreshToken } = generateJwtAndRefreshToken(email, {
        permissions: user.permissions,
        roles: user.roles,
    })

    return response.json({
        token,
        refreshToken: newRefreshToken,
        permissions: user.permissions,
        roles: user.roles,
    });
});


app.get('/me', checkAuthMiddleware, (request, response) => {

    const email = request.user;

    const user = users.get(email);

    if (!user) {
        return response
            .status(400)
            .json({ error: true, message: 'User not found.' });
    }

    return response.json({
        email,
        permissions: user.permissions,
        roles: user.roles,
    })
});

app.listen(process.env.PORT || 3333);