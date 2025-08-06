import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { toast } from 'react-toastify'

export const addPR = createAsyncThunk('pr/addPR', async (body, thunkApi) => {
  try {
    // alert(import.meta.env.VITE_APP_BACKEND_URL)

    const response = await fetch(
      `${import.meta.env.VITE_APP_BACKEND_URL}/user/selectpr`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    )
    if (!response.ok) {
      const { error } = await response.json()
      //   console.log(error)
      throw new Error(error)
    }
    const data = await response.json()
    return data
  } catch (err) {
    return thunkApi.rejectWithValue(err.message)
  }
})

export const fetchPR = createAsyncThunk(
  'pr/fetchPR',
  async (username, thunkApi) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/user/selectpr/${username}`
      )

      if (!response.ok) {
        const { error } = await response.json()
        console.log(error)

        throw new Error(error)
      }
      const data = await response.json()
      return data
    } catch (err) {
      return thunkApi.rejectWithValue(err.message)
    }
  }
)

const prSlice = createSlice({
  name: 'pr',
  initialState: {
    userPrs: [],
    loading: false,
    selectivePrs: []
  },
  reducers: {
    showPrError: (state, action) => {
      toast.error(action.payload.message)
    }
  },
  extraReducers: builder => {
    builder
      .addCase(addPR.pending, (state, action) => {
        state.loading = true
      })
      .addCase(addPR.fulfilled, (state, action) => {
        state.loading = false
        const { message } = action.payload
        toast.success(message)
        const pr = action.payload.pr
        state.selectivePrs = [...state.selectivePrs, pr]
        toast.success('PR successfully added')
      })
      .addCase(addPR.rejected, (state, action) => {
        state.loading = false

        toast.error(action.payload)
      })
      .addCase(fetchPR.pending, (state, action) => {
        state.loading = true
      })
      .addCase(fetchPR.fulfilled, (state, action) => {
        state.loading = false
        state.selectivePrs = action.payload.selectedPrs
      })
      .addCase(fetchPR.rejected, (state, action) => {
        state.loading = false
        toast.error(action.error.message)
      })
  }
})

export default prSlice.reducer
