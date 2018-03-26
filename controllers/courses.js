const coursesRouter = require('express').Router()
const Course = require('../models/course')
const Quest = require('../models/quest')
const AppUser = require('../models/app_user')
const axios = require('axios')
const adminCheck = require('../utils/adminCheck')
const tmcAuth = require('../utils/tmcAuth')
const tokenParser = require('../utils/tokenParser')

/*
   BASEURL FOR THIS ROUTER IS /api/courses
*/

const findQuestAndEdit = async (questId, courseToBeDeleted) => {
	const quest = await Quest.findByIdAndUpdate(userId, {quest: courseToBeDeleted.name}, {deactivated: true})
}

coursesRouter.get('/', async (request, response) => {
    // TODO refactor to populate when joined
    try {
        const courses = await Course.find({})
        if (await adminCheck.check(request) === true) {
            return response.status(200).send(courses.map(Course.formatAdmin))
        } else {
            return response.status(200).send(courses.map(Course.format))
        }      

    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'something went wrong...' })
    }
})

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

coursesRouter.post('/:id/join', async (request, response) => {
	try {
		//Check user token tmcAuth
		let user = await tmcAuth.authenticate(tokenParser.parseToken(request))

		//Check that course is in db
		let joinedCourse = await Course.findById(request.params.id)

		//Check that user cannot join course if he has already joined
		const userCourseIds = user.courses.map(c => c.course.toString())
		const courseUserIds = joinedCourse.users.map(u => u.user.toString())

		if (userCourseIds.includes(joinedCourse._id.toString()) || courseUserIds.includes(user.id.toString())) {
            return response.status(400).send({ error: 'Course already joined' })
        }

		//Add user to course
		joinedCourse.users = joinedCourse.users.concat([{ user: user.id }])

		//Add course to user
		user.courses = user.courses.concat([{ course: joinedCourse._id }])

		joinedCourse.save()
		user.save()

		response.status(200).send(Course.format(joinedCourse))

	} catch (error) {
		console.log(error)
		response.status(400).send({ error: 'something went wrong...' })
	}
})

coursesRouter.delete('/:id', async (request, response) => {
	//This does not reduce points from users
    try {
		//Check admin
        if (await adminCheck.check(request) === false) {
            return response.status(400).send({ error: 'Admin priviledges needed' })
        }
        const courseToBeDeleted = await Course.findById(request.params.id)
		//Check that the course is found
        if (!courseToBeDeleted) {
            return response.status(404).send({error: 'course not found'})
        }
		//Deactivate all quests related to course and change their course to be the course name as a reference
		await Promise.all(courseToBeDeleted.quests.map(async quest => {
			await Quest.findByIdAndUpdate(quest, {deactivated: true})
			//await findQuestAndEdit(quest, courseToBeDeleted)
		}))

		//Remove course from db
		await Course.findByIdAndRemove(request.params.id)
		
        response.status(200).end()
    } catch (error) {
        console.log(error)
        response.status(400).send({ error: 'malformatted id' })
    }
})

module.exports = coursesRouter