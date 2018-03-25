
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
	})
})

afterAll(() => {
	server.close()
})
