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
    //Should this be possible only for admin?
    const users = await AppUser
        .find({})
        .populate('quests.quest', { name: 1, type: 1, points: 1 } ) //what do we want here?
    try {
        if (await adminCheck.check(request) === true) {
            return response.status(200).send(users.map(AppUser.format))
        } else {
            return response.status(200).send(users.map(AppUser.formatNonAdmin))
        }
        //response.json(users)

    } catch (error) {
        console.log(error)
        response.status(400).end()
    }
})

usersRouter.delete('/:id', async (request, response) => {
    try {
		//Check if admin OR if user himself DONE
		const user = await tmcAuth.authenticate(tokenParser.parseToken(request))

        if (await adminCheck.check(request) === false && user._id.toString() !== request.params.id.toString()) {
			console.log(user._id)
			console.log(request.params.id)
            return response.status(400).send({ error: 'You are not authorized to do this' })
		}
		
		//Get the user from database DONE
        const userToBeDeleted = await AppUser.findById(request.params.id)

		//Check that user actually exists DONE
        if (!userToBeDeleted) {
            return response.status(404).send({error: 'user not found'})
        }

		//Remove user from all the quests he has DONE
		userToBeDeleted.quests.forEach( questObj => {
			findQuestAndRemoveUser(questObj.quest, userToBeDeleted)
		})

		//Remove user from database based on the id DONE
        await AppUser.findByIdAndRemove(request.params.id)
        response.status(200).end()
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