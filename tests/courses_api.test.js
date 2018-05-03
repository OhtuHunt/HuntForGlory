
const Quest = require('../models/quest')
const User = require('../models/app_user')
const Course = require('../models/course')
const supertest = require('supertest')
const { initialQuests, questsInTestDb, initialUsers, usersInTestDb, thisUserIsInTestDb, coursesInTestDb } = require('./test_helper')
const { app, server } = require('../src/server/server')
const api = supertest(app)
jest.mock('../utils/tmcAuth')


describe('api/courses: ', async () => {
	describe('test POST when user is admin, ', async () => {
		beforeAll(async () => {
			await Course.remove({})
		})

		// TODO Add test: fails with nonAdmin user
		test('new course is added when user is admin.', async () => {

			const coursesInDb = await coursesInTestDb()

			const newCourse = {
				name: 'testCourse',
				courseCode: 'TKT007'
			}

			await api
				.post('/api/courses')
				.set('Authorization', `bearer admin`)
				.send(newCourse)
				.expect(200)
				.expect('Content-Type', /application\/json/)

			const response = await api
				.get('/api/courses')

			const courseNames = response.body.map(r => r.name)
			expect(courseNames).toContain('testCourse')
			expect(response.body.length).toBe(coursesInDb.length + 1)
		})

		test('NonAdmin cant create a new course', async () => {

			const coursesBefore = await coursesInTestDb()

			const newCourse = {
				name: 'testCourse',
				courseCode: 'TKT007'
			}

			const response = await api
				.post('/api/courses')
				.set('Authorization', `bearer eiadmin`)
				.send(newCourse)
				.expect(400)

			expect(response.body.error).toBe('Admin priviledges needed')

			const coursesAfter = await coursesInTestDb()
			expect(coursesBefore.length).toBe(coursesAfter.length)
		})
	})
	describe('POST :id/join', async () => {

		let testCourse
		let testUser

		beforeAll(async () => {
			await Course.remove({})
			await User.remove({})
			const newCourse = new Course({
				name: 'testCourse',
				courseCode: 'TKT007'
			})
			testCourse = await newCourse.save()

			const newUser = new User({
				quests: [],
				username: "hunter",
				email: "hunter@helsinki.fi",
				tmc_id: 25000,
				admin: true,
				points: 0
			})
			testUser = await newUser.save()
		})

		test('user that hasnt already joined course, joins course', async () => {
			const response = await api
				.post(`/api/courses/${testCourse._id}/join`)
				.set('Authorization', `bearer userWithId ${testUser._id}`)
				.expect(200)

			const course = await Course.findById(testCourse._id)
			const courseUserIds = course.users.map(u => u.user.toString())
			expect(courseUserIds).toContainEqual(testUser._id.toString())
		})

		test('user that has already joined course, cant join again', async () => {
			const response = await api
				.post(`/api/courses/${testCourse._id}/join`)
				.set('Authorization', `bearer hasJoinedCourse ${testCourse._id}`)
				.expect(400)
			expect(response.body.error).toEqual('Course already joined')

		})
	})

	describe('DELETE api/courses/:id', async () => {

		let courseToBeDeleted
		let testUser

		beforeEach(async () => {
			await Course.remove({})
			await User.remove({})
			const newCourse = new Course({
				name: 'deletedCourse',
				courseCode: 'TKT007'
			})
			courseToBeDeleted = await newCourse.save()

			const newUser = new User({
				quests: [],
				username: "hunter",
				email: "hunter@helsinki.fi",
				tmc_id: 25000,
				admin: true,
				points: 0
			})
			testUser = await newUser.save()
		})

		test('when course is deleted, it is also deleted from user', async () => {
			await api
				.post(`/api/courses/${courseToBeDeleted._id}/join`)
				.set('Authorization', `bearer userWithId ${testUser._id}`)

			courseToBeDeleted = await Course.findById(courseToBeDeleted._id)
			testUser = await User.findById(testUser._id)

			expect(courseToBeDeleted.users[0].user.toString()).toEqual(testUser._id.toString())
			expect(testUser.courses[0].course.toString()).toEqual(courseToBeDeleted._id.toString())
			const response = await api
				.delete(`/api/courses/${courseToBeDeleted._id}`)
				.set('Authorization', `bearer admin`)
				.expect(200)

			const refreshedUser = await User.findById(testUser._id)
			expect(refreshedUser.courses[0]).toEqual(undefined)
		})
	})
})


afterAll(() => {
	server.close()
})
