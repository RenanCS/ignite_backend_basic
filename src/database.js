require('dotenv').config();

const { v4: uuid } = require('uuid');

const users = new Map()

const tokens = new Map()

const seedUserStore = () => {
  users.set(process.env.NODE_EMAIL_ADMIN, {
    password: process.env.NODE_PASSWORD_ADMIN,
    permissions: ['users.list', 'users.create', 'metrics.list'],
    roles: ['administrator']
  })

  users.set('teste@gmail.team', {
    password: '123456',
    permissions: ['users.list', 'metrics.list'],
    roles: ['editor']
  })

}

const createRefreshToken = (email) => {
  const currentUserTokens = tokens.get(email) ?? []
  const refreshToken = uuid()

  tokens.set(email, [...currentUserTokens, refreshToken])

  return refreshToken;
}

const checkRefreshTokenIsValid = (email, refreshToken) => {
  const storedRefreshTokens = tokens.get(email) ?? []

  return storedRefreshTokens.some(token => token === refreshToken)
}

const invalidateRefreshToken = (email, refreshToken) => {
  const storedRefreshTokens = tokens.get(email) ?? []

  tokens.set(email, storedRefreshTokens.filter(token => token !== refreshToken));
}

module.exports = { invalidateRefreshToken, checkRefreshTokenIsValid, createRefreshToken, seedUserStore, tokens, users }