const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const Quest = require('./quest')
const AppUser = require('./app_user')
const axios = require('axios')

require('dotenv').config()
require('es6-promise').polyfill();
const fetch = require('isomorphic-fetch');

const loginRouter = require('express').Router()
const tmc = require('tmc-client-js')
const tmcClient = new tmc(process.env.CLIENT_ID, process.env.CLIENT_SECRET)

app.use(cors())

app.use(bodyParser.json())

app.use(express.static('build'))

const formatQuest = (quest) => {
  return {
    name: quest.name,
    description: quest.description,
    points: quest.points,
    done: quest.done,
    type: quest.type,
    id: quest._id,
    activationCode: quest.activationCode
  }
}

app.get('/api/quests', (request, response) => {
  Quest
    .find({})
    .then(quests => {
      response.json(quests.map(formatQuest))
      console.log(quests)
    })
    .catch(error => {
      console.log(error)
      response.status(400).end()
    })
})

app.get('/api/quests/:id', (request, response) => {
  Quest
    .findById(request.params.id)
    .then(quest => {
      if (quest) {
        response.json(formatQuest(quest))
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' })
    })
})

app.get('/api/users/tmc/:id', (request, response) => {
  AppUser
    .findOne({"tmc_id": request.params.id})
    .then(user => {
      if (user) {
        response.json(user)
      } else {
        response.status(404).send({ error: 'malformatted id'})
      }
    })
})

app.post('/api/quests', (request, response) => {
  console.log("abc")
  const body = request.body
  if (body.name === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const quest = new Quest({
    name: body.name,
    description: body.description,
    points: body.points,
    type: body.type,
    done: body.done,
    activationCode: body.activationCode
  })

  quest
    .save()
    .then(formatQuest)
    .then(savedAndFormattedQuest => {
      response.json(savedAndFormattedQuest)
    })
})

app.put('/api/quests/:id', (request, response) => {
  const body = request.body

  const quest = {
    name: body.name,
    description: body.description,
    points: body.points,
    type: body.type,
    done: body.done,
    activationCode: body.activationCode
  }

  Quest
    .findByIdAndUpdate(request.params.id, quest, { new: true })
    .then(updatedQuest => {
      response.json(formatQuest(updatedQuest))
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' })
    })
})

app.delete('/api/quests/:id', (request, response) => {
  Quest
    .findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({error: 'malformatted id'})
    })
})

app.post('/api/login', async (request, response) => {
  const body = request.body
  const param = {
    username: body.username,
    password: body.password
  }
  try {
    const res = await tmcClient.authenticate(param)
    const config = {
      headers: {
        "Authorization": `Bearer ${res.accessToken}`,
        "Content-Type": "application/json"
      }
    }

    const user = await axios.get('https://tmc.mooc.fi/api/v8/users/current', config)
    /* HEROKU LINKKI TÄHÄN */
    const response = await axios.get(`http://localhost:3001/api/users/tmc/${user.data.id}`)
    /* ----------------- */
    /*if (response.data.id) {
      response.json(response.data)
    } else {
      const appUser = new AppUser({
        username: user.data.username,
        email: user.data.email,
        tmc_id: user.data.id,
        admin: user.data.administrator,
        points: 0
      })

      appUser
      .save()
      .then(savedUser => {
        response.json(savedUser)
      })
    } */


  } catch (e) {
    console.error(e);
  } finally {

  }
})

const error = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(error)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
