const axios = require('axios')
const adminCheck = require('../utils/adminCheck')
const tmcAuth = require('../utils/tmcAuth')
const tokenParser = require('../utils/tokenParser')
const subsRouter = require('express').Router()
const PushSubscription = require('../models/push_sub')
const Course = require('../models/course')
const AppUser = require('../models/app_user')
const webpush = require('web-push')
const config = require('../utils/config') // is needed?
require('dotenv').config()

// check the error handling
const triggerPushMessages = async (subObj, dataToSend) => {
	try {
		await webpush.sendNotification(subObj.pushSub.subscription, dataToSend)

	} catch (error) {
		if (error.statusCode === 410) {
			console.log('Handling 410')
			await deleteSubscriptionFromDatabase(subObj.pushSub)
		} else {
			console.log(error)
		}
	}
}

const deleteSubscriptionFromDatabase = async (pushSub) => {
	//Delete subscription from database and user
	try {
		await PushSubscription.findByIdAndRemove(pushSub._id)
		const userId = pushSub.user
		await AppUser.findByIdAndUpdate(userId, 
			{ $pull: { subscriptions : { pushSub: pushSub._id } } }, { new: true })
	} catch (error) {
		console.log(error)
	}
}

subsRouter.post('/save', async (request, response) => {
	try {
		if (!request.body || !request.body.endpoint) {
			return response.status(500).send({ error: 'Subscription must have an endpoint' })
		}

		let user = await tmcAuth.authenticate(tokenParser.parseToken(request))
		if (!user) {
			return response.status(400).send({ error: 'You have to be logged in' })
		}

		const subscription = new PushSubscription({
			user: user._id,
			subscription: request.body
		})

		await subscription.save()
		await AppUser.findByIdAndUpdate(user._id, 
			{ $push: { subscriptions: { pushSub: subscription }}}, { new: true })
		response.status(200).end()
	} catch (error) {
		console.log(error)
		response.status(400).send({ error: 'something went wrong' })
	}
})

subsRouter.post('/send-push', async (request, response) => {
	/* Sends push notifications to users in a course that have a subscription
	 * Requires admin token; course id and notification message in body
	 * vapidKeys in .env **/
	try {
		if (await adminCheck.check(request) === false) {
			return response.status(400).send({ error: 'Admin priviledges needed' })
		}

		const dataToSend = request.body.dataToSend

		// you need to have the keys in your personal .env file
		const vapidKeys = {
			publicKey: process.env.PUBLIC_PUSHKEY,
			privateKey: process.env.PRIVATE_PUSHKEY
		}

		webpush.setVapidDetails(
			//This one to .env?
			'mailto:https://huntforglory.herokuapp.com/#/',
			vapidKeys.publicKey,
			vapidKeys.privateKey
		)

		// need to check which course, other validations?
		// Send course id in POST body
		const course = await Course.findById(request.body.course)
			.populate({
				path: 'users.user',
				populate: {
					path: 'subscriptions.pushSub',
				}
			})

		if (!course) {
			return response.status(404).send({ error: 'course not found' })
		}

		const courseUsers = course.users
		const subsArrays = courseUsers.map(u => u.user.subscriptions)
		const subsObjs = [].concat.apply([], subsArrays)
		
		if (typeof subsObjs === 'undefined' || subsObjs.length === 0) {
			return response.status(418).send({ error: 'there are no subscriptions for this course' })
		}
		
		await Promise.all(subsObjs.map(async subObj => {
			await triggerPushMessages(subObj, dataToSend)
		}))

		response.status(200).end()
	} catch (error) {
		console.log(error)
		response.status(400).send({ error: 'something went wrong' })
	}
})

module.exports = subsRouter