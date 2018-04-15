const axios = require('axios')
const adminCheck = require('../utils/adminCheck')
const tmcAuth = require('../utils/tmcAuth')
const tokenParser = require('../utils/tokenParser')
const groupRouter = require('express').Router()
const Group = require('../models/group')
const User = require('../models/app_user')
const Course = require('../models/course')
const mongoose = require('mongoose')
const divideIntoGroups = require('../utils/divideIntoGroups')


groupRouter.get('/', async (request, response) => {
    try {
        const groups = await Group.find({})
        return response.status(200).send(groups.map(Group.format))

    } catch (error) {
        console.log(error)
        return response.status(400).send({ error: 'Something went wrong...' })
    }
})

groupRouter.post('/', async (request, response) => {
    try {
        if (await adminCheck.check(request) === false) {
            return response.status(400).send({ error: 'You must be an admin to do this' })
        }

        const body = request.body

        const groupAmount = body.groupAmount
        const course = await Course.findById(body.course)

        const courseUsers = course.users.map(u => u.user)
        const listOfGroups = divideIntoGroups(groupAmount, courseUsers)

        await Promise.all(listOfGroups.map(async (group) => {
            const groupObject = new Group({
                course: body.course,
                users: group
            })
            await groupObject.save()
        }))
        return response.status(200).end()

    } catch (error) {
        console.log(error)
        return response.status(400).send({ error: 'Something went wrong...' })
    }
})

// THIS IS ONLY FOR TESTING GROUP DIVISION TEMPORARILY
groupRouter.get('/abc', async (request, response) => {
    try {

        const courseUsers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        const body = request.body
        const groupAmount = 3

        //const course = await Course.findById(body.course)
        //const courseUsers = course.users.map(u => u.user)

        const listOfGroups = divideIntoGroups(groupAmount, courseUsers)

        return response.status(200).send({ gruops: listOfGroups })

    } catch (error) {
        console.log(error)
        return response.status(400).send({ error: 'Something went wrong...' })
    }
})


groupRouter.put('/:id', async (request, response) => {

    try {
        if (await adminCheck.check(request) === false) {
            return response.status(400).send({ error: 'You must be an admin to do this' })
        }

        const body = request.body
        console.log(body)

        // NEED TO FIX USERS UPDATE, error here
        let usersIds = body.users.map(mongoose.Types.ObjectId(User.formatOnlyId))
        console.log(usersIds)

        const group = {
            course: mongoose.Types.ObjectId(body.course),
            users: usersIds
        }

        const updatedGroup = await Group.findByIdAndUpdate(request.params.id, group, { new: true })
        response.status(200).send(Group.format(updatedGroup))

    } catch (error) {
        console.log(error)
        return response.status(400).send({ error: 'Something went wrong...' })
    }
})

groupRouter.delete('/:id', async (request, response) => {

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