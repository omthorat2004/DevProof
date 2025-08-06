import { createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    loading: false,
    token: localStorage.getItem('token'),
    currentUser: {}
  },
  reducers: {
    showError: (state, action) => {
      toast.error(action.payload.message)
    },
    showSuccess: (state, action) => {
      toast.success(action.payload.message)
    },
    setToken: (state, action) => {
      state.token = action.payload.token
      console.log(action.payload)
      localStorage.setItem('token', action.payload.token)
    },
    logOutUser: (state, action) => {
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
  extraReducers: builder => {}
})

export const { showSuccess, showError, setToken, logOutUser } =
  authSlice.actions

export default authSlice.reducer
