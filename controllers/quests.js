const questsRouter = require('express').Router()
const Quest = require('../models/quest')
const AppUser = require('../models/app_user')
const axios = require('axios')
const tmcAuth = require('../utils/tmcAuth')
const adminCheck = require('../utils/adminCheck')

const parseToken = (request) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

questsRouter.get('/', async (request, response) => {
    //Does not require logged in user
    try {
        const quests = await Quest.find({}).populate('usersStarted', { username: 1 })

        if (await adminCheck.check(request) === true) {
            return response.status(200).send(quests.map(Quest.format))
        } else {
            return response.status(200).send(quests.map(Quest.formatNonAdmin))
        }

    } catch (error) {
        console.log(error)
        response.status(500).send({ error: 'something went wrong' })
    }
})

questsRouter.get('/:id', async (request, response) => {
    //Does not require logged in user
    try {
        const quest = await Quest.findById(request.params.id)

        if (await adminCheck.check(request) === true) {
            return response.status(200).send(Quest.format(quest))
        } else {
            return response.status(200).send(Quest.formatNonAdmin(quest))
        }
        
        
    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'malformatted id' })
    }
})


questsRouter.post('/', async (request, response) => {
    try {
        //let token = parseToken(request)
        //let user = await tmcAuth.authenticate(token)
        if (await adminCheck.check(request) === false) {
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

        if (await adminCheck.check(request) === false) {
            return response.status(400).send({ error: 'Admin priviledges needed' })
        }
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

        const updatedQuest = await Quest.findByIdAndUpdate(request.params.id, quest, { new: true })
        response.status(200).send(Quest.format(updatedQuest))

    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'malformatted id' })
    }
})

questsRouter.delete('/:id', async (request, response) => {
    try {
        if (await adminCheck.check(request) === false) {
            return response.status(400).send({ error: 'Admin priviledges needed' })
        }
        const questToBeDeleted = await Quest.findById(request.params.id)

        if (!questToBeDeleted) {
            return response.status(404).send({error: 'quest not found'})
        }

        const user = await tmcAuth.authenticate(parseToken(request))

        const userQuests = user.quests.filter(q => q.quest.toString() !== questToBeDeleted._id.toString())

        user.quests = userQuests

        await user.save()
        await Quest.findByIdAndRemove(request.params.id)
        response.status(200).end()
    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'malformatted id' })
    }
})

questsRouter.put('/:id/start', async (request, response) => {
    //This one starts the quest
    //Requires logged in user
    //If quest id is not found, return error status
    //If user has this quest, return error status
    //Add quest and starttime to user.quests: quest ref and starttime=timestamp
    //Also add user to quest.usersStarted and starttime
    try {

        let user = await tmcAuth.authenticate(parseToken(request))
        console.log(user)
        const dateNow = Date.now()

        let startedQuest = await Quest.findById(request.params.id)

        const userQuestIds = user.quests.map(q => q.quest.toString())
        const questUserIds = startedQuest.usersStarted.map(u => u.user.toString())
        
        if (userQuestIds.includes(startedQuest._id.toString()) || questUserIds.includes(user.id.toString())) {

            return response.status(400).send({ error: 'Quest already started' })
        }

        user.quests = user.quests.concat([{ quest: startedQuest._id, startTime: dateNow, finishTime: null }])

        startedQuest.usersStarted = startedQuest.usersStarted.concat([{ user: user.id, startTime: dateNow, finishTime: null }])
        await user.save()
        await startedQuest.save()

        response.status(200).send(AppUser.format(user))

    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'Oops... something went wrong. :(' })
    }
})


questsRouter.put('/:id/finish', async (request, response) => {
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
    //MAKE MONGO SAVE ATOMIC?
    //Edit finishTime = dateNow user.quests where quest id matches 
    //Also add user's finishTime to quest.usersStarted
    try {
        // request.body.activationCode
        
        let user = await tmcAuth.authenticate(parseToken(request))
        const dateNow = Date.now()
        
        //First add quest to user
        let finishedQuests = user.quests.filter(questItem => questItem.quest.toString() === request.params.id.toString())
        let finishedQuestItem = finishedQuests[0]
        
        if (!finishedQuestItem) {
            return response.status(400).send({ error: 'User has not started this quest' })
        }

        const questToCheck = await Quest.findById(finishedQuestItem.quest)

        if (questToCheck.activationCode !== request.body.activationCode) {
            return response.status(400).send({ error: 'Wrong activationcode' })
        }

        if (finishedQuestItem.finishTime !== null) {
            return response.status(400).send({ error: 'User has already finished this quest' })
        }

        finishedQuestItem.finishTime = dateNow

        user.quests = user.quests.filter(questItem => questItem.quest.toString() !== request.params.id.toString())
        user.quests = user.quests.concat(finishedQuestItem)


        //Then add user to quest
        let finishedQuest = await Quest.findById(request.params.id)

        //Add points to user here
        user.points = user.points + finishedQuest.points

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