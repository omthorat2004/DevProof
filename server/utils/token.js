const { sign } = require('jsonwebtoken')

const createToken = ({ id }) => {
  const token = sign({ id }, process.env.JWT_KEY, {
    expiresIn: '3d'
  })

  return token
}

module.exports = createToken
