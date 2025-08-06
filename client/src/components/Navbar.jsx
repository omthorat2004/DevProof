import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logOutUser } from '../features/authentication/authenticationSlice'
import '../styles/navbar.css'

const Navbar = () => {
  const token = useSelector(state => state.auth.token)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  console.log(token)

  const handleLogIn = () => {
    navigate('/login')
  }

  const handleLogOut = () => {
    dispatch(logOutUser())
    navigate('/login')
  }

  return (
    <header className='navbar-container'>
      <div className='navbar-content flex items-center justify-between'>
        <div className='nav-brand'>
          <Link to='/' className='brand-link'>
            DevProof
          </Link>
        </div>
        <div className='navbar-menu'>
          {token ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className='navbar-btn'
              >
                Profile
              </button>
              <button onClick={handleLogOut} className='navbar-btn'>
                Logout
              </button>
            </>
          ) : (
            <button onClick={handleLogIn} className='navbar-btn'>
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
