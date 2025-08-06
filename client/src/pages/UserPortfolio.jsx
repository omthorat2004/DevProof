import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import '../styles/portfolio.css'

const UserPortfolio = () => {
  const { username } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userData, setUserData] = useState(null)
  const [portfolioPRs, setPortfolioPRs] = useState([])
  const [repos, setRepos] = useState([])
  const [techStack, setTechStack] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch user data from our backend
        const userResponse = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/github/user/${username}`
        )
        if (!userResponse.ok) throw new Error('Failed to fetch user data')
        const userData = await userResponse.json()
        setUserData(userData.user)

        // Fetch portfolio PRs
        const prsResponse = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/github/${username}/portfolio`
        )
        if (!prsResponse.ok) throw new Error('Failed to fetch portfolio PRs')
        const prsData = await prsResponse.json()
        setPortfolioPRs(prsData.portfolioPrs)

        // Fetch repositories and tech stack
        const reposResponse = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/github/${username}/repos`
        )
        if (!reposResponse.ok) throw new Error('Failed to fetch repositories')
        const reposData = await reposResponse.json()
        setRepos(reposData.topRepos)
        setTechStack(reposData.techStack)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [username])

  if (loading) {
    return (
      <div className='portfolio-loading'>
        <div className='loading-spinner'></div>
        <p>Loading portfolio...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='portfolio-error'>
        <p>Error: {error}</p>
        <p>Could not load portfolio for @{username}</p>
      </div>
    )
  }

  return (
    <div className='portfolio-container'>
      {/* User Profile Header */}
      <header className='portfolio-header'>
        <div className='user-profile'>
          <img
            src={userData?.avatar_url}
            alt={`${username}'s avatar`}
            className='user-avatar'
          />
          <div className='user-info'>
            <h1 className='user-name'>{userData?.name || username}</h1>
            <p className='user-username'>@{username}</p>

            {userData?.bio && <p className='user-bio'>{userData.bio}</p>}

            <div className='user-stats'>
              {userData?.public_repos && (
                <div className='stat'>
                  <span className='stat-number'>{userData.public_repos}</span>
                  <span className='stat-label'>Repositories</span>
                </div>
              )}
              {userData?.followers && (
                <div className='stat'>
                  <span className='stat-number'>{userData.followers}</span>
                  <span className='stat-label'>Followers</span>
                </div>
              )}
              {userData?.following && (
                <div className='stat'>
                  <span className='stat-number'>{userData.following}</span>
                  <span className='stat-label'>Following</span>
                </div>
              )}
            </div>

            <div className='user-links'>
              <a
                href={userData?.html_url}
                target='_blank'
                rel='noopener noreferrer'
                className='github-link'
              >
                View on GitHub
              </a>
              {userData?.blog && (
                <a
                  href={
                    userData.blog.startsWith('http')
                      ? userData.blog
                      : `https://${userData.blog}`
                  }
                  target='_blank'
                  rel='noopener noreferrer'
                  className='external-link'
                >
                  Personal Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        {techStack.length > 0 && (
          <div className='tech-stack'>
            <h3>Tech Stack</h3>
            <div className='tech-tags'>
              {techStack.map(tech => (
                <span key={tech} className='tech-tag'>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className='portfolio-content'>
        {/* Featured Repositories Section */}
        {repos.length > 0 && (
          <section className='featured-section'>
            <h2 className='section-title'>Featured Repositories</h2>
            <div className='repos-grid'>
              {repos.map(repo => (
                <div key={repo.id} className='repo-card'>
                  <div className='repo-header'>
                    <h3>
                      <a
                        href={repo.html_url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {repo.name}
                      </a>
                    </h3>
                    <span className='repo-stars'>
                      ★ {repo.stargazers_count}
                    </span>
                  </div>
                  {repo.description && (
                    <p className='repo-description'>{repo.description}</p>
                  )}
                  {repo.language && (
                    <div className='repo-language'>
                      <span className='language-dot'></span>
                      {repo.language}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Portfolio PRs Section */}
        <section className='portfolio-prs'>
          <h2 className='section-title'>Featured Pull Requests</h2>

          {portfolioPRs.length === 0 ? (
            <p className='empty-message'>No featured pull requests yet</p>
          ) : (
            <div className='pr-grid'>
              {portfolioPRs.map(pr => (
                <div key={pr.prId} className='pr-card'>
                  <div className='pr-header'>
                    <h3 className='pr-title'>
                      <a
                        href={pr.html_url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {pr.title}
                      </a>
                    </h3>
                    <span className={`pr-status ${pr.state}`}>
                      {pr.state.toUpperCase()}
                    </span>
                  </div>

                  <p className='pr-repo'>
                    <span className='label'>Repository:</span> {pr.repository}
                  </p>

                  {pr.description && (
                    <div className='pr-description'>
                      <h4>Description</h4>
                      <p>{pr.description}</p>
                    </div>
                  )}

                  {pr.impact && (
                    <div className='pr-impact'>
                      <h4>Impact</h4>
                      <p>{pr.impact}</p>
                    </div>
                  )}

                  <div className='pr-meta'>
                    <span className='pr-date'>
                      Created: {new Date(pr.created_at).toLocaleDateString()}
                    </span>
                    {pr.merged_at && (
                      <span className='pr-merged'>
                        Merged: {new Date(pr.merged_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default UserPortfolio
