const axios = require('axios')
const adminCheck = require('../utils/adminCheck')
const tmcAuth = require('../utils/tmcAuth')
const tokenParser = require('../utils/tokenParser')
const feedbackRouter = require('express').Router()
const Feedback = require('../models/feedback')

feedbackRouter.get('/', async (request, response) => {
    // if decided to make feedback non anonym then create admin checks etc
    try {
        const feedbacks = await Feedback.find({})
        return response.status(200).send(feedbacks.map(Feedback.format))
    } catch (error) {
        console.log(error)
        return response.status(400).send({error: 'Something went wrong...'})
    }
})

feedbackRouter.post('/', async (request, response) => {
    try {

        // throws error if not user
        const user = await tmcAuth.authenticate(tokenParser.parseToken(request))

        if (!user.id) {
            return response.status(400).send({error: "You must be logged in"})
        }

        const body = request.body
        const feedbackObject = new Feedback({
            title: body.title,
            content: body.content,
            read: false
        })

        const savedFeedback = await feedbackObject.save()

        return response.status(200).send(Feedback.format(savedFeedback))

    } catch (error) {
        console.log(error)
        return response.status(400).send({error: 'Something went wrong...'})
    }
})

// mark quest as read

feedbackRouter.post('/:id/read', async (request, response) => {
    try {
        if (await adminCheck.check(request) === false) {
            return response.status(400).send({error: 'You must be admin to do this'})
        }

        let feedback = await Feedback.findById(request.params.id)

        if (!feedback) {
            return response.status(400).send({error: 'No matching feedback with this id'})
        }

        feedback.read = true
        const savedFeedback = await feedback.save()

        return response.status(200).send(savedFeedback)

    } catch (error) {
        console.log(error)
        return response.status(400).send({error: 'Something went wrong...'})
    }
})

feedbackRouter.delete('/:id', async (request, response) => {
    try {
        if (await adminCheck.check(request) === false) {
            return response.status(400).send({error: 'You must be admin to do this'})
        }

        let feedback = await Feedback.findByIdAndRemove(request.params.id)
        
        if (!feedback) {
            return response.status(400).send({error: 'No matching feedback with this id'})
        }

        return response.status(200).end()

    } catch (error) {
        console.log(error)
        return response.status(400).send({error: 'Something went wrong...'})
    }
})

module.exports = feedbackRouter