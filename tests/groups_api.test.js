
const User = require('../models/app_user')
const Course = require('../models/course')
const Group = require('../models/group')
const supertest = require('supertest')
const { initialUsers, coursesInTestDb, usersInTestDb, giveCourseFromDb } = require('./test_helper')
const { app, server } = require('../src/server/server')
const api = supertest(app)
jest.mock('../utils/tmcAuth')


describe('api/groups/ ', async () => {
	describe('test GET , ', async () => {
		beforeAll(async () => {
            await Group.remove({})
            await User.remove({})
			await Course.remove({})
			
			const userObjects = initialUsers.map(user => new User(user))
			const promiseArray = userObjects.map(user => user.save())
			await Promise.all(promiseArray)

			const newCourse = new Course({
				name: 'testCourse',
				courseCode: 'TKT007'
			})
			const testCourse = await newCourse.save()
			const testUsers = await usersInTestDb()

			const testUsersIds = testUsers.map(u => u.id)
			let usersAsIds = []
			testUsersIds.map(user => usersAsIds.push({user}))
			const newGroup = new Group({
				course: testCourse.id,
				users: usersAsIds
			})
			const testGroup = await newGroup.save()
		})

		test('that response is correct', async () => {
			const response = await api
				.get('/api/groups')
				.expect(200)
			
			// Check that first group's course is right
			const courseId = response.body[0].course
			const testCourse = await giveCourseFromDb()

			expect(courseId.toString()).toBe(testCourse._id.toString())
		})

		test('for skipping this until ready', async () => {
			expect('a').toBe('a')
		})

		// TODO Add test: fails with nonAdmin user
		test('new group is added when user is admin.', async () => {

            let userObjects = initialUsers.map(user => new User(user))         
			let courseObject = new Course({
				name: 'testCourse',
				courseCode: 'TKT007',
				users: []
            })

            userObjects.map(user => {
                courseObject.users.push({ user: user._id, points: 0 })
            	user.courses.push({ course: courseObject._id })
				user.save()
			})

            let course = await courseObject.save()

            // etsii kurssin id:llä
            
			const response = await api
				.post(`/api/groups/course/${course._id}/generate`)
				.set('Authorization', `bearer admin`)
				.send( {groupAmount: 2} )
				.expect(200)
				.expect('Content-Type', /application\/json/)

			expect(response.body.length).toBe(2)
		})
		
	})	
})

afterAll(() => {
	server.close()
})

