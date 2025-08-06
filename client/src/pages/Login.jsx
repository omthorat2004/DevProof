import '../styles/login.css'
const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/github'
  }

  return (
    <div className='login-container flex h-full justify-center items-center'>
      {/* <Snowfall /> */}
      <button className='login-btn' onClick={handleLogin}>
        Login with GitHub
      </button>
    </div>
  )
}

export default Login
