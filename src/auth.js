const jwt = require('jsonwebtoken');
const { auth } = require('./config');
const { createRefreshToken } = require('./database');

export function generateJwtAndRefreshToken(email, payload = {}) {
  const token = jwt.sign(payload, auth.secret ?? "", {
    subject: email,
    expiresIn: 5, // 15 minutes
  });

  const refreshToken = createRefreshToken(email)

  return {
    token,
    refreshToken,
  }
}
