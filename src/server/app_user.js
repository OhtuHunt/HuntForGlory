const mongoose = require('mongoose')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const url = process.env.MONGODB_URI

mongoose.connect(url)
mongoose.Promise = global.Promise

const AppUser = mongoose.model('AppUser', {
  tmc_id: Number,
  username: String,
  points: Number,
  email: String,
  admin: Boolean
})

const closeConnection = () => {
  mongoose.connection.close()
}

module.exports = { AppUser, closeConnection }
