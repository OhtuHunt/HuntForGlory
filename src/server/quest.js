
const mongoose = require('mongoose')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const url = process.env.MONGODB_URI

mongoose.connect(url)
mongoose.Promise = global.Promise

const Quest = mongoose.model('Quest', {
  name: String,
  description: String,
  points: Number,
  type: String,
  done: Boolean,
  started: Boolean,
  activationCode: String
})

module.exports = Quest