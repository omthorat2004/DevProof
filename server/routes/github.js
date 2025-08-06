const PortfolioPR = require('../models/pr.model')
const User = require('../models/user.model')
const axios = require('axios')
const router = require('express').Router()

// Get user's portfolio PRs
router.get('/:username/portfolio', async (req, res) => {
  try {
    const { username } = req.params
    const portfolioPrs = await PortfolioPR.find({ username })
      .sort({ created_at: -1 }) // Sort by newest first
      .lean()

    res.status(200).json({ portfolioPrs })
  } catch (err) {
    console.error('Error fetching portfolio PRs:', err)
    return res.status(500).json({ error: 'Server Error' })
  }
})

// Get user profile data
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params

    // 1. Check our database first
    const user = await User.findOne({ username }).lean()

    if (user) {
      // 2. If we have an access token, fetch fresh GitHub data
      if (user.access_token) {
        try {
          const githubResponse = await axios.get(
            'https://api.github.com/user',
            {
              headers: {
                Authorization: `token ${user.access_token}`
              }
            }
          )

          const githubData = githubResponse.data

          // Merge database and GitHub data
          const mergedData = {
            ...user,
            name: githubData.name || user.name,
            bio: githubData.bio || user.bio,
            avatar_url: githubData.avatar_url || user.avatar_url,
            html_url: githubData.html_url || user.html_url,
            public_repos: githubData.public_repos,
            followers: githubData.followers,
            following: githubData.following,
            blog: githubData.blog,
            company: githubData.company,
            location: githubData.location,
            twitter_username: githubData.twitter_username,
            updated_at: githubData.updated_at
          }

          return res.status(200).json({ user: mergedData })
        } catch (githubError) {
          console.error('GitHub API error:', githubError.message)
          // Fall through to return database user if GitHub fetch fails
        }
      }

      // Return database user if no token or GitHub fetch failed
      return res.status(200).json({ user })
    }

    // 3. If user not in our database, try public GitHub API
    try {
      const githubResponse = await axios.get(
        `https://api.github.com/users/${username}`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json'
          }
        }
      )

      const githubUser = githubResponse.data
      res.status(200).json({
        user: {
          username,
          name: githubUser.name,
          bio: githubUser.bio,
          avatar_url: githubUser.avatar_url,
          html_url: githubUser.html_url,
          public_repos: githubUser.public_repos,
          followers: githubUser.followers,
          following: githubUser.following,
          blog: githubUser.blog,
          company: githubUser.company,
          location: githubUser.location,
          twitter_username: githubUser.twitter_username
        }
      })
    } catch (githubError) {
      if (githubError.response?.status === 404) {
        return res.status(404).json({ error: 'User not found' })
      }
      throw githubError
    }
  } catch (err) {
    console.error('Error fetching user data:', err)
    return res.status(500).json({ error: 'Server Error' })
  }
})

// Get user's repositories for tech stack analysis
router.get('/:username/repos', async (req, res) => {
  try {
    const { username } = req.params

    // 1. Check if we have the user with access token in our DB
    const user = await User.findOne({ username })

    let repos = []

    if (user?.access_token) {
      // Use authenticated request for private repos if available
      const response = await axios.get('https://api.github.com/user/repos', {
        headers: {
          Authorization: `token ${user.access_token}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          per_page: 100,
          sort: 'updated',
          direction: 'desc'
        }
      })
      repos = response.data
    } else {
      // Fall back to public API
      const response = await axios.get(
        `https://api.github.com/users/${username}/repos`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json'
          },
          params: {
            per_page: 100,
            sort: 'updated',
            direction: 'desc'
          }
        }
      )
      repos = response.data
    }

    // Filter out forks and analyze languages
    const languages = {}
    const filteredRepos = repos.filter(repo => !repo.fork)

    filteredRepos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    })

    const techStack = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang)
      .slice(0, 8) // Top 8 languages

    // Get top 6 starred repositories
    const topRepos = filteredRepos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .map(repo => ({
        id: repo.id,
        name: repo.name,
        html_url: repo.html_url,
        description: repo.description,
        stargazers_count: repo.stargazers_count,
        language: repo.language,
        forks_count: repo.forks_count
      }))

    res.status(200).json({
      techStack,
      topRepos,
      totalRepos: filteredRepos.length
    })
  } catch (err) {
    console.error('Error fetching repositories:', err)
    return res.status(500).json({ error: 'Server Error' })
  }
})

module.exports = router
