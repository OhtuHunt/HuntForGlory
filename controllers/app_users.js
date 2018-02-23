const usersRouter = require('express').Router()
const AppUser = require('../models/app_user')

const formatUser = (user) => {
    return {

    }
}

usersRouter.get('/', async (request, response) => {
    //Should this be possible only for admin?
    const users = await AppUser
        .find({})
        .populate('quests.quest', { name: 1, type: 1, points: 1 } ) //what do we want here?
    try {
        response.json(users)
        console.log(users)

    } catch (error) {
        console.log(error)
        response.status(400).end()
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