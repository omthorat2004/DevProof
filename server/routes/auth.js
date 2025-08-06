const express = require('express')
const axios = require('axios')
const User = require('../models/user.model')
const createToken = require('../utils/token')
const router = express.Router()
const { verify } = require('jsonwebtoken')

router.get('/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user:email`
  res.redirect(githubAuthUrl)
})

router.get('/github/callback', async (req, res) => {
  const code = req.query.code

  if (!code) {
    return res.status(400).json({ error: 'Authorization code missing' })
  }

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    )

    const accessToken = tokenRes.data.access_token
    if (!accessToken) {
      throw new Error('No access token returned')
    }

    const userRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    const { login, name, avatar_url, html_url, bio } = userRes.data

    const emailRes = await axios.get('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    const primaryEmail = emailRes.data.find(
      email => email.primary && email.verified
    )?.email

    const user = await User.findOneAndUpdate(
      { username: login },
      {
        name,
        username: login,
        avatar_url,
        html_url,
        email: primaryEmail || '',
        bio,
        access_token: accessToken
      },
      { upsert: true, new: true }
    )

    const token = createToken({ id: user._id })
    res.redirect(
      `${process.env.FRONTEND_URL}/profile?username=${login}&token=${token}`
    )
  } catch (err) {
    console.error('GitHub OAuth error:', err.message)
    res.status(500).json({ error: 'GitHub login failed' })
  }
})

// adjust the path if needed

router.get('/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' })
    }

    const token = authHeader.split(' ')[1]

    let decoded
    try {
      decoded = verify(token, process.env.JWT_KEY)
    } catch (err) {
      console.log(err)
      return res.status(401).json({ error: 'Invalid token.' })
    }

    const user = await User.findById(decoded.id).select('-password') // exclude password

    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    res.status(200).json({ user })
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

module.exports = router
