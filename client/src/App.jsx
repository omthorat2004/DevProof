// src/App.js
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import './App.css'
import LoadingSpinner from './components/LoadingSpinner'
import Navbar from './components/Navbar'
import Snowfall from './components/Snowfall'
import { logOutUser } from './features/authentication/authenticationSlice'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import UserPortfolio from './pages/UserPortfolio'

function App () {
  const token = useSelector(state => state.auth.token)
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(!!token)
  const [isAuthenticating, setIsAuthenticating] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsAuthenticating(false)
        return
      }

      try {
        setIsLoading(true)

        const response = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/auth/user`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        console.log(import.meta.env.VITE_APP_BACKEND_URL)

        if (!response.ok) {
          throw new Error('Invalid Token')
        }

        const data = await response.json()
        const { user } = data

        localStorage.setItem('user', JSON.stringify(user))
        toast.success('Logged in successfully')
      } catch (err) {
        console.error(err)
        toast.error('Session expired, please login again')
        dispatch(logOutUser())
      } finally {
        setIsLoading(false)
        setIsAuthenticating(false)
      }
    }

    verifyToken()
  }, [token, dispatch])

  if (isAuthenticating) {
    return (
      <div className='app-loading'>
        <LoadingSpinner />
        <p>Checking authentication...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {isLoading && (
        <div className='global-loading'>
          <LoadingSpinner />
        </div>
      )}
      <Snowfall />
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />

        <Route path='/profile' element={<Profile />} />
        <Route path='/portfolio/:username' element={<UserPortfolio />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
