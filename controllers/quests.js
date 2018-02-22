const questsRouter = require('express').Router()
const Quest = require('../models/quest')
const AppUser = require('../models/app_user')
const axios = require('axios')

questsRouter.get('/', (request, response) => {
    Quest
        .find({})
        .populate('usersStarted', { username: 1, type: 1, tmc_id: 1 }) //what do we want here???
        .then(quests => {
            response.json(quests.map(Quest.format))
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
    //Add quest and starttime to user.quests: quest ref and starttime=timestamp
    //Also add user to quest.usersStarted and starttime
    try {
        const config = {
            headers: {
                "Authorization": `bearer ${request.body.token}`,
                "Content-Type": "application/json"
            }
        }
        let userFromTMC = await axios.get('https://tmc.mooc.fi/api/v8/users/current', config)
        let user = await AppUser.findOne({ "tmc_id": userFromTMC.data.id })

        const dateNow = Date.now()

        let startedQuest = await Quest.findById(request.params.id)

        const userQuestIds = user.quests.map(q => q.quest.toString())

        if (userQuestIds.includes(startedQuest._id.toString())) {

            return response.status(400).send({ error: 'Quest already started' })
        }

        user.quests = user.quests.concat([{ quest: startedQuest._id, startTime: dateNow, finishTime: null }])

        startedQuest.usersStarted = startedQuest.usersStarted.concat([{ user: user.id, startTime: dateNow, finishTime: null }])
        
        await user.save()
        await startedQuest.save()

        response.status(200).send(user)

    } catch (error) {
        response.status(400).send({ error: 'Oops... something went wrong. :(' })
    }
})


questsRouter.put('/finish/:id', async (request, response) => {
    /* TMC authentication should be cleaner (own module) */
    /*finishedQuests = finishedQuests.filter(questItem => questItem.quest.toString() === request.params.id.toString())
        .map(quest => {
            const newQuest = quest
            newQuest.finishTime = Date.now()
            return newQuest
        }) */

    //This one starts the quest
    //Requires logged in user
    //If quest id is not found, return error status x
    //If user does not have this quest, return error status x
    //If user has this quest already finished, return error status x
    //MAKE MONGO SAVE ATOMIC
    //Edit finishTime = dateNow user.quests where quest id matches 
    //Also add user's finishTime to quest.usersStarted
    try {

        const config = {
            headers: {
                "Authorization": `bearer ${request.body.token}`,
                "Content-Type": "application/json"
            }
        }

        const userFromTMC = await axios.get('https://tmc.mooc.fi/api/v8/users/current', config)
        let user = await AppUser.findOne({ "tmc_id": userFromTMC.data.id })
        
        const dateNow = Date.now()

        //First add quest to user
        let finishedQuests = user.quests.filter(questItem => questItem.quest.toString() === request.params.id.toString())
        let finishedQuestItem = finishedQuests[0]

        if (!finishedQuestItem) {
            return response.status(400).send({error: 'User has not started this quest'})
        }

        if (finishedQuestItem.finishTime !== null) {
            return response.status(400).send({error: 'User has already finished this quest'})
        }

        finishedQuestItem.finishTime = dateNow

        user.quests = user.quests.filter(questItem => questItem.quest.toString() !== request.params.id.toString())
        user.quests = user.quests.concat(finishedQuestItem)

        //Then add user to quest
        let finishedQuest = await Quest.findById(request.params.id)
        let usersCompleted = finishedQuest.usersStarted.filter(userItem => userItem.user.toString() === user.id.toString())
        let userCompletedItem = usersCompleted[0]

        userCompletedItem.finishTime = dateNow
        
        finishedQuest.usersStarted = finishedQuest.usersStarted.filter(userItem => userItem.user.toString() !== user.id.toString())
        finishedQuest.usersStarted = finishedQuest.usersStarted.concat(userCompletedItem)
        
        user.points = user.points + finishedQuest.points
        //Finally save to database and send response
        await user.save()
        await finishedQuest.save()
        
        response.status(200).send(user)
    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'Oooooops... something went wrong. :(' })
    }
})

module.exports = questsRouter