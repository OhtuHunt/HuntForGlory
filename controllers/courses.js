const coursesRouter = require('express').Router()
const Course = require('../models/course')
const Quest = require('../models/quest')
const AppUser = require('../models/app_user')
const axios = require('axios')
const adminCheck = require('../utils/adminCheck')

/*
   BASEURL FOR THIS ROUTER IS /api/courses
*/

coursesRouter.post('/', async (request, response) => {
    try {
        /*
        Old comments from questRouter
        //let token = parseToken(request)
        //let user = await tmcAuth.authenticate(token)
        */

        if (await adminCheck.check(request) === false) {
            return response.status(400).send({ error: 'Admin priviledges needed' })
        }

        const body = request.body
        if (body === undefined) {
            return response.status(400).json({ error: 'content missing' })
        }

        // add unique admin to course?
        const course = new Course({
            name: body.name,
            courseCode: body.courseCode
        })

        const savedCourse = await course.save()
        response.status(200).send(Course.format(savedCourse))

    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'something went wrong...' })
    }
})

module.exports = coursesRouter