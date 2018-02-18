const usersRouter = require('express').Router()
const AppUser = require('../models/app_user')

const formatUser = (user) => {
    return {

    }
}

usersRouter.get('/', async (request, response) => {
    const users = await AppUser
        .find({})
        .populate('quests.quest', { name: 1, type: 1, points: 1 } )
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