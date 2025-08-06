const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const PortfolioPR = require('../models/pr.model')

router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/:username/pr', async (req, res) => {
  try {
    const { username } = req.params
    const { page = 1, per_page = 30 } = req.query

    const user = await User.findOne({ username })
    if (!user || !user.access_token) {
      return res.status(404).json({ error: 'User or access token not found' })
    }

    // Fetch PRs from GitHub API
    const githubResponse = await fetch(
      `https://api.github.com/search/issues?q=author:${username}+type:pr&page=${page}&per_page=${per_page}`,
      {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          'User-Agent': 'MyApp',
          Accept: 'application/vnd.github+json'
        }
      }
    )

    if (!githubResponse.ok) {
      const error = await githubResponse.json()
      return res.status(githubResponse.status).json({
        error: error.message || 'Failed to fetch PRs from GitHub'
      })
    }

    const data = await githubResponse.json()

    // Transform the GitHub API response to match your desired format
    const prs = data.items.map(pr => ({
      id: pr.id,
      html_url: pr.html_url,
      title: pr.title,
      state: pr.state,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      closed_at: pr.closed_at,
      user: {
        login: pr.user.login,
        html_url: pr.user.html_url,
        avatar_url: pr.user.avatar_url
      },
      repository_url: pr.repository_url,
      pull_request: {
        url: pr.pull_request.url,
        merged_at: pr.pull_request.merged_at
      }
    }))

    return res.status(200).json({
      prs,
      total_count: data.total_count,
      page: parseInt(page),
      per_page: parseInt(per_page)
    })
  } catch (err) {
    console.error('Server error:', err)
    return res.status(500).json({ error: 'Server Error' })
  }
})

router.post('/selectpr', async (req, res) => {
  try {
    const prData = req.body

    // Validate required fields
    if (!prData.prId || !prData.username || !prData.html_url || !prData.title) {
      return res.status(400).json({ error: 'Missing required PR fields' })
    }

    const prExist = await PortfolioPR.findOne({
      prId: prData.prId,
      username: prData.username
    })

    if (prExist) {
      return res.status(409).json({ error: 'PR already added to portfolio' })
    }

    const selectedPr = await PortfolioPR.create(prData)

    return res.status(201).json({
      message: 'PR successfully added to portfolio',
      pr: selectedPr
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server Error' })
  }
})

router.get('/selectpr/:username', async (req, res) => {
  try {
    const { username } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!username) {
      return res.status(400).json({ error: 'Username is required' })
    }

    const selectedPrs = await PortfolioPR.find({ username })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })

    const total = await PortfolioPR.countDocuments({ username })

    return res.status(200).json({
      selectedPrs,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    })
  } catch (err) {
    console.error('Error fetching selected PRs:', err)
    return res.status(500).json({ error: 'Server Error' })
  }
})

module.exports = router
