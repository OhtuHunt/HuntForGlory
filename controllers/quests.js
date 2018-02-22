const questsRouter = require('express').Router()
const Quest = require('../models/quest')
const AppUser = require('../models/app_user')
const axios = require('axios')

//Not used anymore..?
/*const formatQuest = (quest) => {
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
  }*/

questsRouter.get('/', (request, response) => {
    Quest
        .find({})
        .populate('usersStarted', { username: 1, type: 1, tmc_id: 1 }) //what do we want here???
        .then(quests => {
            response.json(quests.map(Quest.format))
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
                response.json(Quest.format(quest))
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
        .then(Quest.format)
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
            response.json(Quest.format(updatedQuest))
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

questsRouter.put('/start/:id', async (request, response) => {
    //This one starts the quest
    //Requires logged in user
    //If quest id is not found, return error status
    //If user has this quest, return error status
    //Add quest and false to user.quests: quest ref and finished=false
    //Also add user to quest.usersStarted
    const config = {
        headers: {
            "Authorization": `bearer ${request.body.token}`,
            "Content-Type": "application/json"
        }
    }

    const userFromTMC = await axios.get('https://tmc.mooc.fi/api/v8/users/current', config)
    let user = await AppUser.findOne({ "tmc_id": userFromTMC.data.id })

    let startedQuest = await Quest.findById(request.params.id)

    user.quests = user.quests.concat([{ quest: startedQuest._id, startTime: request.body.startTime, finishTime: null }])
    await user.save()

    startedQuest.usersStarted = startedQuest.usersStarted.concat([{ user: user.id, startTime: request.body.startTime, finishTime: null }])
    await startedQuest.save()
})


questsRouter.put('/finish/:id', async (request, response) => {
    /* Currently works but I don't know why (array mutation)
        no restrictions yet
        TMC authentication should be cleaner (own module) */

    //This one starts the quest
    //Requires logged in user
    //If quest id is not found, return error status
    //If user does not have this quest, return error status
    //If user has this quest already finished, don't do anything(?)
    //Edit finished=true user.quests where quest id matches 
    //Also add user to quest.usersFinished -- Keep usersStarted ?

    const config = {
        headers: {
            "Authorization": `bearer ${request.body.token}`,
            "Content-Type": "application/json"
        }
    }

    const userFromTMC = await axios.get('https://tmc.mooc.fi/api/v8/users/current', config)
    let user = await AppUser.findOne({ "tmc_id": userFromTMC.data.id })

    let finishedQuests = user.quests
    
    finishedQuests = await finishedQuests.filter(questItem => questItem.quest.toString() === request.params.id.toString())
        .map(quest => {
            const newQuest = quest
            newQuest.finished = true
            return newQuest
        })

    await user.save()

    let finishedQuest = await Quest.findById(request.params.id) 
    finishedQuest.usersFinished = await finishedQuest.usersFinished.concat(user.id)
    await finishedQuest.save()
})

module.exports = questsRouter