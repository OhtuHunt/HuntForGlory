const axios = require('axios')
const adminCheck = require('../utils/adminCheck')
const tmcAuth = require('../utils/tmcAuth')
const tokenParser = require('../utils/tokenParser')
const subsRouter = require('express').Router()
const PushSubscription = require('../models/push_sub')
const webpush = require('web-push')
const config = require('../utils/config') // is needed?

require('dotenv').config()

subsRouter.delete('/delete', async (request, response) => {
	try {
		const body = request.body

		await PushSubscription.findByIdAndRemove(request.params.id)
		response.status(200).end()

	} catch (error) {
		console.log(error)
		response.status(400).send({ error: 'something went wrong' })
	}
})

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
		response.status(400).send({ error: 'something went wrong' })
	}
})

// check the error handling
const triggerPushMessages = (subscription, dataToSend) => {
	try {
		webpush.sendNotification(subscription, dataToSend)

	} catch (error) {
		console.log(error)
		response.status(400).send({ error: 'something went wrong' })
	}
}

/* Malli
const triggerPushMsg = function (subscription, dataToSend) {
	return webpush.sendNotification(subscription, dataToSend)
		.catch((err) => {
			if (err.statusCode === 410) {
				return deleteSubscriptionFromDatabase(subscription._id);
			} else {
				console.log('Subscription is no longer valid: ', err);
			}
		});
};*/

// ADD REMOVE FOR SUBS!!!!
subsRouter.post('/send-push', async (request, response) => {
	try {
		const dataToSend = request.body.dataToSend
		// you need to have the keys in your personal .env file
		const vapidKeys = {
			publicKey: process.env.PUBLIC_PUSHKEY,
			privateKey: process.env.PRIVATE_PUSHKEY
		}

		webpush.setVapidDetails(
			'mailto:https://huntforglory.herokuapp.com/#/', // remember to config this email
			vapidKeys.publicKey,
			vapidKeys.privateKey
		)

		// need to check which course, other validations?
		const subscriptions = await PushSubscription.find({})
		for (let i = 0; i < subscriptions.length; i++) {
					const subscription = subscriptions[i];
					 await triggerPushMsg(subscription, dataToSend);
					 
				}

		

		//items.forEach(({word, count}) => console.log(word+' '+count));

		/* malli
		return getSubscriptionsFromDatabase()
			.then(function (subscriptions) {
				let promiseChain = Promise.resolve();

				for (let i = 0; i < subscriptions.length; i++) {
					const subscription = subscriptions[i];
					promiseChain = promiseChain.then(() => {
						return triggerPushMsg(subscription, dataToSend);
					});
				}

				return promiseChain;
			})*/

		response.status(200).end()
	} catch (error) {
		console.log(error)
		response.status(400).send({ error: 'something went wrong' })
	}
})


module.exports = subsRouter