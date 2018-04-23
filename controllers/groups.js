const axios = require('axios')
const adminCheck = require('../utils/adminCheck')
const tmcAuth = require('../utils/tmcAuth')
const tokenParser = require('../utils/tokenParser')
const groupRouter = require('express').Router()
const Group = require('../models/group')
const User = require('../models/app_user')
const Course = require('../models/course')
const mongoose = require('mongoose')


groupRouter.get('/', async (request, response) => {
	try {
		const groups = await Group.find({})
			.populate('users.user', { username: 1 })
		return response.status(200).send(groups.map(Group.format))

	} catch (error) {
		console.log(error)
		return response.status(400).send({ error: 'Something went wrong...' })
	}
})

groupRouter.put('/:id', async (request, response) => {
	//Requires course id and list of user ids in users: [ {user: id}, {user: id} ] format
	try {
		if (await adminCheck.check(request) === false) {
			return response.status(400).send({ error: 'You must be an admin to do this' })
		}

		const body = request.body

		const group = {
			course: body.course,
			users: body.users
		}

		const updatedGroup = await Group.findByIdAndUpdate(request.params.id, group, { new: true })
		response.status(200).send(Group.format(updatedGroup))

	} catch (error) {
		console.log(error)
		return response.status(400).send({ error: 'Something went wrong...' })
	}
})

groupRouter.post('/move_user', async (request, response) => {
	//Requires three ids: Group where user is moved from, group where user is moved to, and user id
	try {
		if (await adminCheck.check(request) === false) {
			return response.status(400).send({ error: 'You must be an admin to do this' })
		}

		const body = request.body

		let groupFrom = await Group.findById(body.groupFromId)
		let groupTo = await Group.findById(body.groupToId)
		const userId = body.userId

		//Remove user from groupFrom
		groupFromUsersAfter = groupFrom.users.filter(userItem => userItem.user.toString() !== userId.toString())
		groupFrom.users = groupFromUsersAfter
		await groupFrom.save()

		//Add user to groupTo
		groupToUsersAfter = groupTo.users.concat({ user: userId })
		groupTo.users = groupToUsersAfter
		await groupTo.save()

		response.status(200).send(Group.format(groupTo))
	} catch (error) {
		console.log(error)
		return response.status(400).send({ error: 'Something went wrong...' })
	}
})

groupRouter.delete('/:id', async (request, response) => {
	/** Mainly good if group is emptied from users (they are moved to another group) */
	try {
		if (await adminCheck.check(request) === false) {
			return response.status(400).send({ error: 'You must be an admin to do this' })
		}

		let groupToDelete = await Group.findByIdAndRemove(request.params.id)

		if (!groupToDelete) {
			return response.status(404).end()
		}

		return response.status(200).end()

	} catch (error) {
		console.log(error)
		return response.status(400).send({ error: 'Something went wrong...' })
	}
})

module.exports = groupRouter