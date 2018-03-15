const http = require('http')
const mongoose = require('mongoose')
const config = require('../../utils/config')
const questsRouter = require('../../controllers/quests')
const usersRouter = require('../../controllers/app_users')
const loginRouter = require('../../controllers/login')
const sslRedirect = require('heroku-ssl-redirect')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

require('dotenv').config()

mongoose
  .connect(config.mongoUrl)
  .then(() => {
    console.log('connected to database', config.mongoUrl)
  })
  .catch(err => {
    console.log(err)
  })

mongoose.Promise = global.Promise

const server = http.createServer(app)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

server.on('close', () => {
  mongoose.connection.close()
})

app.use(cors())
app.use(sslRedirect())
app.use(bodyParser.json())

if (process.env.NODE_ENV === 'development') {
  if (process.env.REACT_APP_LOCAL === 'true') {
    app.use(express.static('./builds/buildLocal'))
  } else {
    app.use(express.static('./builds/buildDev'))
  }
} else {
  app.use(express.static('./builds/build'))
}

app.use('/api/quests', questsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

const error = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(error)

module.exports = {
  app, server
}
