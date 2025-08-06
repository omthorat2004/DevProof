import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingSpinner from './components/LoadingSpinner'

const PrivateRoute = ({ isLoading }) => {
  const token = useSelector(state => state.auth.token)

  if (isLoading) {
    return (
      <div className='full-page-loading'>
        <LoadingSpinner />
      </div>
    )
  }

  if (!token) {
    toast.error('Please login to access this page')
    return <Navigate to='/login' replace />
  }

  return <Outlet />
}

export default PrivateRoute
