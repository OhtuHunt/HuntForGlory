const questsRouter = require('express').Router()
const Quest = require('../models/quest')
const AppUser = require('../models/app_user')
const Course = require('../models/course')
const axios = require('axios')
const tmcAuth = require('../utils/tmcAuth')
const adminCheck = require('../utils/adminCheck')
const tokenParser = require('../utils/tokenParser')
const geodist = require('geodist')

const findUserAndRemoveQuest = async (userId, questToBeRemoved) => {
	const user = await AppUser.findById(userId)
	const userQuests = user.quests.filter(q => q.quest.toString() !== questToBeRemoved._id.toString())
	user.quests = userQuests
	await user.save()
}

questsRouter.get('/', async (request, response) => {
	//Does not require logged in user
	//But we need to filter quests from courses where user attends
    try {
        const quests = await Quest.find({}).populate('usersStarted', { username: 1 }).populate('course', { name: 1 })
        
        if (await adminCheck.check(request) === true) {
            return response.status(200).send(quests.map(Quest.format))
        } else {
            return response.status(200).send(quests.map(Quest.formatNonAdmin).filter(q => q.deactivated === false))
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
            activationCode: body.activationCode,
			deactivated: false,
			course: body.course
        })

		let questCourse = await Course.findById(body.course)
		
		const savedQuest = await quest.save()

		questCourse.quests = questCourse.quests.concat(savedQuest._id)
		await questCourse.save()

        response.status(200).send(Quest.format(savedQuest))

    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'something went wrong...' })
    }
})

questsRouter.put('/:id', async (request, response) => {
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
            activationCode: body.activationCode,
			deactivated: body.deactivated,
			course: body.course
        }

        const updatedQuest = await Quest.findByIdAndUpdate(request.params.id, quest, { new: true })
        response.status(200).send(Quest.format(updatedQuest))

    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'malformatted id' })
    }
})

questsRouter.post('/:id/deactivated', async (request, response) => {
	// changes quest's deactivated boolean based on the previous value. If course is deactivated then this post changes it to activated
    try {
        if (await adminCheck.check(request) === false) {
            return response.status(400).send({error: 'Admin priviledges needed'})
        }

        const oldQuest = await Quest.findById(request.params.id)
		const deactivatedNew = oldQuest.deactivated === true ? false : true

        const quest = {
            name: oldQuest.name,
            description: oldQuest.description,
            points: oldQuest.points,
            type: oldQuest.type,
            done: oldQuest.done,
            started: oldQuest.started,
            activationCode: oldQuest.activationCode,
			deactivated: deactivatedNew,
			course: oldQuest.course
        }

		const updatedQuest = await Quest.findByIdAndUpdate(request.params.id, quest, {new: true})

        response.status(200).send(Quest.format(updatedQuest))

    } catch (error) {
        console.log(error)
        response.status(400).send({error: 'malformatted id'})
    }
})

questsRouter.delete('/:id', async (request, response) => {
	//This does not reduce points from users
    try {
        if (await adminCheck.check(request) === false) {
            return response.status(400).send({ error: 'Admin priviledges needed' })
        }
        const questToBeDeleted = await Quest.findById(request.params.id)

        if (!questToBeDeleted) {
            return response.status(404).send({error: 'quest not found'})
        }

		await Promise.all(questToBeDeleted.usersStarted.map(async (userObj) => {
			await findUserAndRemoveQuest(userObj.user, questToBeDeleted)
		}))

		await Quest.findByIdAndRemove(request.params.id)
		
		let questCourse = await Course.findById(questToBeDeleted.course)
		questCourse.quests = questCourse.quests.filter(q => q.toString() !== questToBeDeleted._id.toString())
		await questCourse.save()

        response.status(200).end()
    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'malformatted id' })
    }
})

questsRouter.post('/:id/start', async (request, response) => {
    //This one starts the quest
    //Requires logged in user
    //If quest id is not found, return error status
    //If user has this quest, return error status
    //Add quest and starttime to user.quests: quest ref and starttime=timestamp
    //Also add user to quest.usersStarted and starttime
    try {

        let user = await tmcAuth.authenticate(tokenParser.parseToken(request))
        const dateNow = Date.now()

        let startedQuest = await Quest.findById(request.params.id)

        if (startedQuest.deactivated === true) {
            return response.status(400).send({error: 'This quest is deactivated'})
        }

        const userQuestIds = user.quests.map(q => q.quest.toString())
        const questUserIds = startedQuest.usersStarted.map(u => u.user.toString())
        
        if (userQuestIds.includes(startedQuest._id.toString()) || questUserIds.includes(user.id.toString())) {

            return response.status(400).send({ error: 'Quest already started' })
        }

        user.quests = user.quests.concat([{ quest: startedQuest._id, startTime: dateNow, finishTime: null }])

        startedQuest.usersStarted = startedQuest.usersStarted.concat([{ user: user.id, startTime: dateNow, finishTime: null }])
        await user.save()
        await startedQuest.save()

        response.status(200).send(Quest.formatNonAdmin(startedQuest))

    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'Oops... something went wrong. :(' })
    }
})


questsRouter.post('/:id/finish', async (request, response) => {
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
    //MAKE MONGO SAVE ATOMIC? Cannot right now
    //Edit finishTime = dateNow user.quests where quest id matches 
    //Also add user's finishTime to quest.usersStarted
    try {
        
        let user = await tmcAuth.authenticate(tokenParser.parseToken(request))
        const dateNow = Date.now()
        
        //First add quest to user
        let finishedQuests = user.quests.filter(questItem => questItem.quest.toString() === request.params.id.toString())
        let finishedQuestItem = finishedQuests[0]
        
        if (!finishedQuestItem) {
            return response.status(400).send({ error: 'User has not started this quest' })
        }

        const questToCheck = await Quest.findById(finishedQuestItem.quest)
        if (questToCheck.deactivated === true) {
            return response.status(400).send({error: 'This quest is deactivated'})
        }

		//Check if quest type is location and check activationCode accordingly
		if (questToCheck.type === 'location') {
			const userLocation = request.body.activationCode
			const correctLocation = questToCheck.activationCode.coords
			const radius = questToCheck.activationCode.radius

			if (!geodist(userLocation, correctLocation, {limit: radius, unit: 'meters'})) {
				return response.status(400).send({ error: 'Wrong location' })
			}
		} else if (questToCheck.activationCode !== request.body.activationCode) {
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

        response.status(200).send(Quest.formatNonAdmin(finishedQuest))
    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'Oooooops... something went wrong. :(' })
    }
})

module.exports = questsRouter