const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

const Quest = require('./quest')
app.use(cors())

app.use(bodyParser.json())

app.use(express.static('build'))

const formatQuest = (quest) => {
  return {
    name: quest.name,
    description: quest.description,
    points: quest.points,
    done: quest.done,
    id: quest._id
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
    done: body.done
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
    done: body.done
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

const error = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(error)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
