const questsRouter = require('express').Router()
const Quest = require('../models/quest')
const AppUser = require('../models/app_user')
const axios = require('axios')
const tmcAuth = require('../utils/tmcAuth')

const parseToken = (request) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

questsRouter.get('/', async (request, response) => {
    try {
        const quests = await Quest.find({}).populate('usersStarted', { username: 1, type: 1, tmc_id: 1 })
        response.status(200).send(quests.map(Quest.format))

    } catch (error) {
        console.log(error)
        response.status(500).send({error: 'something went wrong'})
    }
})

questsRouter.get('/:id', async (request, response) => {
    try {
        const quest = await Quest.findById(request.params.id)
        response.status(200).send(Quest.format(quest))
    } catch (error) {
        console.log(error)
        response.status(400).send({error: 'malformatted id'})
    }
})


questsRouter.post('/', async (request, response) => {
    try {
        let token = parseToken(request)
        let user = await tmcAuth.authenticate(token)

        if (!user.admin) {
            return response.status(400).send({ error: 'Admin priviledges needed' })
        }

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

        const savedQuest = await quest.save()
        response.status(200).send(Quest.format(savedQuest))

    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'something went wrong...' })
    }
})

questsRouter.put('/:id', async (request, response) => {
    //Add admin restriction
    try {
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

    const updatedQuest = await Quest.findByIdAndUpdate(request.params.id, quest, {new: true})
    response.status(200).send(Quest.format(updatedQuest))

    } catch (error) {
        console.log(error)
        response.status(400).send({error: 'malformatted id'})
    }
})

questsRouter.delete('/:id', async (request, response) => {
    //Add admin restriction
    try {
        await Quest.findByIdAndRemove(request.params.id)
        response.status(200).end()
    } catch (error) {
        console.log(error)
        response.status(400).send({error: 'malformatted id'})
    }
})

questsRouter.put('/start/:id', async (request, response) => {
    //This one starts the quest
    //Requires logged in user
    //If quest id is not found, return error status
    //If user has this quest, return error status
    //Add quest and starttime to user.quests: quest ref and starttime=timestamp
    //Also add user to quest.usersStarted and starttime
    try {

        let user = await tmcAuth.authenticate(request.body.token)
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
        console.log(error)
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

        let user = await tmcAuth.authenticate(request.body.token)
        const dateNow = Date.now()

        //First add quest to user
        let finishedQuests = user.quests.filter(questItem => questItem.quest.toString() === request.params.id.toString())
        let finishedQuestItem = finishedQuests[0]

        if (!finishedQuestItem) {
            return response.status(400).send({ error: 'User has not started this quest' })
        }

        if (finishedQuestItem.finishTime !== null) {
            return response.status(400).send({ error: 'User has already finished this quest' })
        }

        finishedQuestItem.finishTime = dateNow

        user.quests = user.quests.filter(questItem => questItem.quest.toString() !== request.params.id.toString())
        user.quests = user.quests.concat(finishedQuestItem)

        //Add points to user here
        user.points = user.points + finishedQuest.points

        //Then add user to quest
        let finishedQuest = await Quest.findById(request.params.id)
        let usersCompleted = finishedQuest.usersStarted.filter(userItem => userItem.user.toString() === user.id.toString())
        let userCompletedItem = usersCompleted[0]

        userCompletedItem.finishTime = dateNow

        finishedQuest.usersStarted = finishedQuest.usersStarted.filter(userItem => userItem.user.toString() !== user.id.toString())
        finishedQuest.usersStarted = finishedQuest.usersStarted.concat(userCompletedItem)

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