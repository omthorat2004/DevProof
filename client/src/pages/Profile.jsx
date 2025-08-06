import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { setToken } from '../features/authentication/authenticationSlice'
import { addPR, fetchPR } from '../features/pr/prSlice'
import '../styles/profile.css'

const ProfilePage = () => {
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isLoadingPRs, setIsLoadingPRs] = useState(false)
  const [allPullRequests, setAllPullRequests] = useState([])
  const selectedPullRequests = useSelector(state => state.pr.selectivePrs)
  const [shouldShowForm, setShouldShowForm] = useState(false)

  const [formData, setFormData] = useState({
    description: '',
    impact: '',
    pullRequest: null
  })

  const dispatch = useDispatch()
  const token = searchParams.get('token') || localStorage.getItem('token')

  useEffect(() => {
    if (token) {
      const isNewLogin =
        !localStorage.getItem('token') && searchParams.get('token')

      fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch user')
          return response.json()
        })
        .then(data => {
          if (isNewLogin) {
            // dispatch(showSuccess({ message: 'Login Successful' }))
          }
          dispatch(setToken({ token }))
          setUser(data?.user)
          setIsLoadingUser(false)
        })
        .catch(error => {
          console.error('Error:', error)
          setIsLoadingUser(false)
        })
    } else {
      setIsLoadingUser(false)
    }
  }, [token, dispatch, searchParams])

  useEffect(() => {
    if (user?.username) {
      setIsLoadingPRs(true)
      Promise.all([
        fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/user/${user.username}/pr`
        )
          .then(response => response.json())
          .then(data => setAllPullRequests(data.prs)),
        dispatch(fetchPR(user.username))
      ])
        .catch(error => console.error('PR fetch error:', error))
        .finally(() => setIsLoadingPRs(false))
    }
  }, [user, dispatch])

  const handleAddToPortfolio = pullRequest => {
    setFormData({
      pullRequest,
      description: '',
      impact: ''
    })
    setShouldShowForm(true)
  }

  const handleFormSubmit = () => {
    const pr = formData.pullRequest

    const formattedPR = {
      prId: pr.id,
      title: pr.title,
      html_url: pr.html_url,
      repository: pr.repository_url.split('/').slice(-2).join('/'),
      state: pr.state,
      created_at: pr.created_at,
      merged_at: pr.pull_request?.merged_at || null,
      username: pr.user?.login,
      avatar_url: pr.user?.avatar_url,
      description: formData.description,
      impact: formData.impact
    }

    if (user.username) {
      dispatch(addPR({ ...formattedPR, userId: user._id }))
    }

    setFormData({ description: '', impact: '', pullRequest: null })
    setShouldShowForm(false)
  }

  if (isLoadingUser) {
    return (
      <div className='profile-page__loading-message'>Loading profile...</div>
    )
  }

  if (!user) {
    return (
      <div className='profile-page__error-message'>
        User not found or invalid token
      </div>
    )
  }

  return (
    <div className='profile-page__container'>
      {/* User Profile Section */}
      <section className='profile-page__user-section'>
        <div className='profile-page__user-profile'>
          <img
            src={user.avatar_url}
            alt='User Avatar'
            className='profile-page__user-avatar'
          />
          <h1 className='profile-page__user-name'>{user.name || user.login}</h1>
          <p className='profile-page__user-username'>@{user.username}</p>
          {user.bio && <p className='profile-page__user-bio'>{user.bio}</p>}
          <a
            href={user.html_url}
            target='_blank'
            rel='noreferrer'
            className='profile-page__github-link'
          >
            View GitHub Profile
          </a>
        </div>
      </section>

      {/* All Pull Requests Section */}
      <section className='profile-page__pull-requests-section'>
        <h2 className='profile-page__section-heading'>All Pull Requests</h2>
        {isLoadingPRs ? (
          <div className='profile-page__loading-message'>
            Loading pull requests...
          </div>
        ) : (
          <div className='profile-page__grid profile-page__grid--two-columns'>
            {allPullRequests.length > 0 ? (
              allPullRequests.map(pullRequest => (
                <div
                  key={pullRequest.id}
                  className='profile-page__pull-request-card'
                >
                  <h3 className='profile-page__pull-request-title'>
                    {pullRequest.title}
                  </h3>
                  <p className='profile-page__pull-request-repo'>
                    <strong>Repo:</strong>{' '}
                    {pullRequest.repository_url.split('/').slice(-2).join('/')}
                  </p>
                  <p className='profile-page__pull-request-status'>
                    <strong>Status:</strong> {pullRequest.state.toUpperCase()}
                  </p>
                  <a
                    href={pullRequest.html_url}
                    target='_blank'
                    rel='noreferrer'
                    className='profile-page__pull-request-link'
                  >
                    View PR
                  </a>
                  <button
                    onClick={() => handleAddToPortfolio(pullRequest)}
                    className='profile-page__add-button'
                  >
                    Add to Portfolio
                  </button>
                </div>
              ))
            ) : (
              <p className='profile-page__no-prs-message'>
                No pull requests found
              </p>
            )}
          </div>
        )}
      </section>

      {/* Add Details Form */}
      {shouldShowForm && (
        <section className='profile-page__form-section'>
          <div className='profile-page__form-container'>
            <h3 className='profile-page__form-heading'>Add PR to Portfolio</h3>
            <p className='profile-page__form-pr-info'>
              PR:{' '}
              <a
                href={formData.pullRequest.html_url}
                className='profile-page__form-pr-link'
              >
                {formData.pullRequest.title}
              </a>
            </p>
            <textarea
              placeholder='Describe what you did...'
              className='profile-page__description-textarea'
              rows='3'
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <textarea
              placeholder='Describe the impact...'
              className='profile-page__impact-textarea'
              rows='2'
              value={formData.impact}
              onChange={e =>
                setFormData({ ...formData, impact: e.target.value })
              }
            />
            <button
              onClick={handleFormSubmit}
              className='profile-page__submit-button'
            >
              Save to Portfolio
            </button>
          </div>
        </section>
      )}

      {/* Selected Pull Requests Section */}
      <section className='profile-page__selected-prs-section'>
        <h2 className='profile-page__section-heading'>Selected PRs</h2>
        {isLoadingPRs ? (
          <div className='profile-page__loading-message'>
            Loading selected PRs...
          </div>
        ) : (
          <div className='profile-page__selected-prs-list'>
            {selectedPullRequests.length > 0 ? (
              selectedPullRequests.map(pullRequest => (
                <div
                  key={pullRequest.id}
                  className='profile-page__selected-pr-card'
                >
                  <h4 className='profile-page__selected-pr-title'>
                    {pullRequest.title}
                  </h4>
                  <p className='profile-page__selected-pr-description'>
                    Added Description: {pullRequest.description}
                  </p>
                  <p className='profile-page__selected-pr-impact'>
                    Impact: {pullRequest.impact}
                  </p>
                  <a
                    href={pullRequest.html_url}
                    target='_blank'
                    className='profile-page__selected-pr-link'
                  >
                    View on GitHub
                  </a>
                </div>
              ))
            ) : (
              <p className='profile-page__no-prs-message'>
                No PRs selected yet
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default ProfilePage
