const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const Quest = require('./quest')
require('dotenv').config()

require('es6-promise').polyfill();
require('isomorphic-fetch');

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
  console.log("1")
  const body = request.body
  const param = {
    username: body.username,
    password: body.password
  }
  console.log(tmcClient.authenticate)
  try {
    const res = await tmcClient.authenticate(param)
    console.log(res)
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
