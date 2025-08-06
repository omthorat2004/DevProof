import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/authentication/authenticationSlice'
import prReducer from '../features/pr/prSlice'
const store = configureStore({
  reducer: {
    auth: authReducer,
    pr: prReducer
  }
})

export default store
