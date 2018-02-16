const questsRouter = require('express').Router()
const Quest = require('../models/quest')
const AppUser = require('../models/app_user')

const formatQuest = (quest) => {
    return {
      name: quest.name,
      description: quest.description,
      points: quest.points,
      done: quest.done,
      started: quest.started,
      type: quest.type,
      id: quest._id,
      activationCode: quest.activationCode
    }
  }

questsRouter.get('/', (request, response) => {
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

questsRouter.get('/:id', (request, response) => {
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


questsRouter.post('/', (request, response) => {
    const body = request.body
    if (body === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }
    const quest = new Quest({
        name: body.name,
        description: body.description,
        points: body.points,
        type: body.type,
        done: body.done,
        started: body.started,
        activationCode: body.activationCode
    })

    quest
        .save()
        .then(formatQuest)
        .then(savedAndFormattedQuest => {
            response.json(savedAndFormattedQuest)
        })
})

questsRouter.put('/:id', (request, response) => {
    const body = request.body

    const quest = {
        name: body.name,
        description: body.description,
        points: body.points,
        type: body.type,
        done: body.done,
        started: body.started,
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

questsRouter.delete('/:id', (request, response) => {
    Quest
        .findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => {
            console.log(error)
            response.status(400).send({ error: 'malformatted id' })
        })
})

module.exports = questsRouter