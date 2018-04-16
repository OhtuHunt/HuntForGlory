const axios = require('axios')
const adminCheck = require('../utils/adminCheck')
const tmcAuth = require('../utils/tmcAuth')
const tokenParser = require('../utils/tokenParser')
const subsRouter = require('express').Router()
const PushSubscription = require('../models/push_sub')

subsRouter.post('/save', async (request, response) => {
	try {
		if (!request.body || !request.body.endpoint) {
			return response.status(500).send({ error: 'Subscription must have an endpoint' })
		}

		const user = await tmcAuth.authenticate(tokenParser.parseToken(request))
		if (!user) {
			return response.status(400).send({ error: 'You have to be logged in' })
		}
		
		const subscription = new PushSubscription({
			user: user._id,
			subscription: request.body
		})

		await subscription.save()

		response.status(200).end()	
	} catch (error) {
		console.log(error)
		response.status(400).send({ error: 'something went wrong'})
	}
})


module.exports = subsRouter