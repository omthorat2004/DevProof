const mongoose = require('mongoose')

const portfolioPrSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    prId: {
      type: Number,
      required: true,
      unique: true // Prevent duplicate PR additions across users (optional)
    },
    title: {
      type: String,
      required: true
    },
    html_url: {
      type: String,
      required: true
    },
    repository: {
      type: String,
      required: true // e.g., "octocat/Hello-World"
    },
    state: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    },
    created_at: {
      type: Date
    },
    merged_at: {
      type: Date
    },
    username: {
      type: String
    },
    avatar_url: {
      type: String
    },
    description: {
      type: String // user-defined
    },
    impact: {
      type: String // user-defined
    }
  },
  {
    timestamps: true
  }
)
const PortfolioPR = mongoose.model('PortfolioPR', portfolioPrSchema)
module.exports = PortfolioPR
