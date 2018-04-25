
const User = require('../models/app_user')
const Course = require('../models/course')
const Group = require('../models/group')
const supertest = require('supertest')
const { initialUsers, coursesInTestDb, usersInTestDb, giveCourseFromDb } = require('./test_helper')
const { app, server } = require('../src/server/server')
const api = supertest(app)
jest.mock('../utils/tmcAuth')

describe('asd', async() => {
	test('asdasd' , async() => {
		expect(1).toBe(1)
	})
})

/*
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

			const testUsersIds = testUsers.map(User.formatOnlyId)

			const newGroup = new Group({
				course: testCourse.id,
				users: testUsersIds
			})
			const testGroup = await newGroup.save()
		})

		test('that response is correct', async () => {
			const response = await api
			.get('/api/groups')

			expect(200)
			const courseId = response.body.course
			const testCourse = await giveCourseFromDb()

			expect(courseId.toString()).toBe(testCourse.id.toString())
		})

		test('for skipping this until ready', async () => {
			expect('a').toBe('a')
		})

		// TODO Add test: fails with nonAdmin user
		test('new group is added when user is admin.', async () => {

            const userObjects = initialUsers.map(user => new User(user))         
			const courseObject = new Course({
				name: 'testCourse',
                courseCode: 'TKT007',
            })

            

            userObjects.forEach(user => {
                courseObject.users = courseObject.users.concat([{ user: user._id, points: 0 }])
                user.courses = user.courses.concat([{ course: courseObject._id }])
            })

            let course = await courseObject.save()

            // etsii kurssin id:llä
            
			await api
				.post('/api/groups')
				.set('Authorization', `bearer admin`)
				.send(course.id, 1)
				.expect(200)
				.expect('Content-Type', /application\/json/)

			const response = await api
                .get('/api/groups/abc')
                console.log(response.body)

			const group = response.body.map(r => r.name)
			expect(courseNames).toContain('testCourse')
			expect(response.body.length).toBe(coursesInDb.length + 1)
		})
		
	})	
})
*/


afterAll(() => {
	server.close()
})

