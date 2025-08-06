const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const githubRoutes = require('./routes/github')

const app = express()
connectDB()

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

app.use('/auth', authRoutes)

app.use('/user', userRoutes)

app.use('/github', githubRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Server listening at ${process.env.PORT}`)
})
