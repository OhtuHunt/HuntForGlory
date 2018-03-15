const usersRouter = require('express').Router()
const AppUser = require('../models/app_user')
const Quest = require('../models/quest')
const tmcAuth = require('../utils/tmcAuth')
const adminCheck = require('../utils/adminCheck')
const tokenParser = require('../utils/tokenParser')

const findQuestAndRemoveUser = async (questId, userToBeRemoved) => {
	const quest = await Quest.findById(questId)
	const questUsers = quest.usersStarted.filter(u => u.user.toString() !== userToBeRemoved._id.toString())
	quest.usersStarted = questUsers
	await quest.save()
}

usersRouter.get('/', async (request, response) => {
	const users = await AppUser
		.find({})
		.populate('quests.quest', { name: 1, type: 1, points: 1 }) //what do we want here?
	try {
		if (await adminCheck.check(request) === true) {
			return response.status(200).send(users.map(AppUser.format))
		} else {
			return response.status(200).send(users.map(AppUser.formatNonAdmin))
		}

	} catch (error) {
		console.log(error)
		response.status(400).end()
	}
})

usersRouter.delete('/:id', async (request, response) => {
	/* Check if admin or user himself is requesting delete
		Get the user from database
		Check that the user actually exists
		Remove user from all the quests in database
		- Promise.all because we want this to be coherent and pass our tests
		Remove user from database based on id
	 */
	try {
		const user = await tmcAuth.authenticate(tokenParser.parseToken(request))

		if (await adminCheck.check(request) === false &&  user._id.toString() !== request.params.id.toString()) {
			return response.status(400).send({ error: 'You are not authorized to do this' })
		}

		const userToBeDeleted = await AppUser.findById(request.params.id)

		if (!userToBeDeleted) {
			return response.status(404).send({ error: 'user not found' })
		}

		await Promise.all(userToBeDeleted.quests.map(async (questObj) => {
			await findQuestAndRemoveUser(questObj.quest, userToBeDeleted)
		}))

		await AppUser.findByIdAndRemove(request.params.id)
		response.status(200).end()
	} catch (error) {
		response.status(400).send({ error: 'malformatted id' })
	}
})

usersRouter.put('/:id', async (request, response) => {
	try {
		const requestingUser = await tmcAuth.authenticate(tokenParser.parseToken(request))
		//Check if user himself
		if (requestingUser._id.toString() !== request.params.id.toString()) {
			return response.status(400).send({ error: 'You are not authorized to do this' })
		}

		const body = request.body

		const user = {
			username: body.username,
			email: body.email
		}
		
		const updatedUser = await AppUser.findByIdAndUpdate(request.params.id, user, { new: true })
		
		response.status(200).send(AppUser.format(updatedUser))

	} catch (error) {
		console.log(error)
		response.status(400).send({ error: 'malformatted id' })
	}
})

//   usersRouter.get('/api/users/tmc/:id', (request, response) => {
//     AppUser
//       .findOne({"tmc_id": request.params.id})
//       .then(user => {
//         if (user) {
//           response.json(user)
//         } else {
//           response.status(404).send({ error: 'malformatted id'})
//         }
//       })
//   })

module.exports = usersRouter