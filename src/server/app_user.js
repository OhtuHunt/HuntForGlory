const mongoose = require('mongoose')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const url = 'mongodb://sambo1111:hunt123@ds211588.mlab.com:11588/hunt_db'

mongoose.connect(url)
mongoose.Promise = global.Promise

const AppUser = mongoose.model('AppUser', {
  username: String,
  points: Number,
  email: String,
  admin: Boolean
})

module.exports = AppUser
