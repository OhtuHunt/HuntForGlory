const Quest = require('../models/quest')
const User = require('../models/app_user')
const Course = require('../models/course')
const supertest = require('supertest')
const { initialQuests, questsInTestDb, initialUsers, usersInTestDb, thisUserIsInTestDb, coursesInTestDb } = require('./test_helper')
const { app, server } = require('../src/server/server')
const api = supertest(app)
jest.mock('../utils/tmcAuth')

beforeAll(async () => {
	// Be sure to use test database

	const initialCourse = new Course(
		{
			name: 'initialCourse',
			courseCode: 'INITC'
		}
	)
	
	const savedCourse = await initialCourse.save()

	await Quest.remove({})
	
	const questObjects = initialQuests.map(quest => new Quest({
		name: quest.name,
        description: quest.description,
        points: quest.points,
        type: quest.type,
        done: quest.done,
        started: quest.started,
        activationCode: quest.activationCode,
        usersStarted: quest.usersStarted,
        usersFinished: quest.usersFinished,
		deactivated: quest.deactivated,
		course: {
			_id: savedCourse._id,
			name: savedCourse.name
		}
	}))

	const promiseArray = questObjects.map(quest => quest.save())
	await Promise.all(promiseArray)
})

describe('API GET all from api/quests', async () => {

	describe('when user is admin', async () => {
		test('quests include activation code', async () => {
			const response = await api
				.get('/api/quests')
				.set('Authorization', `bearer admin`)
			const questActivationCodes = response.body.map(r => r.activationCode)

			expect(questActivationCodes).not.toContain(undefined)
		})

		test('all quests are returned', async () => {
			const questsInDb = await questsInTestDb()

			const response = await api
				.get('/api/quests')
				.set('Authorization', `bearer admin`)
				.expect(200)
				.expect('Content-Type', /application\/json/)

			expect(response.body.length).toBe(questsInDb.length)
		})

		test('a specific quest is within the returned quests', async () => {
			const response = await api
				.get('/api/quests')
				.set('Authorization', `bearer admin`)
			const questNames = response.body.map(r => r.name)

			expect(questNames).toContain('Fun with Done')
		})
	})

	describe('when user is not admin', async () => {
		test('quests do not include activation code', async () => {

			const response = await api
				.get('/api/quests')
				.set('Authorization', `bearer regularUser`)
			const questActivationCodes = response.body.map(r => r.activationCode)
			questActivationCodes.forEach(element => {
				expect(element).not.toBeDefined()
			})
		})
	})

	test('quests are returned as json', async () => {
		await api
			.get('/api/quests')
			.set('Authorization', `bearer moro`)
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})

	test('quest returns its courses name', async () => {

		const course = new Course({
			name: "testCourse",
			courseCode: "1123",
			quests: [],
			users: []
		})

		const quest = new Quest({
			name: "Käy jossain",
			description: "Käy jossakin OHPE:n pajoista ja tee siellä tehtävä.",
			points: 5,
			type: "Solo-location-quest",
			done: false,
			started: false,
			activationCode: "pajahdus",
			usersStarted: [],
			usersFinished: [],
			deactivated: false
		})

		quest.course = course
		course.quests.concat(quest)
		await course.save()
		await quest.save()

		const retQuest = await api
					.get(`/api/quests/${quest._id}`)

		expect(retQuest.body.course.name).toEqual(course.name)
	})

})

describe('API GET single quest from api/quests/:id', async () => {
	let quest
	beforeEach(async () => {
		const questsBefore = await questsInTestDb()
		quest = questsBefore[0]
	})

	describe('when user is admin', async () => {
		test('quest includes activation code', async () => {

			const response = await api
				.get(`/api/quests/${quest._id}`)
				.set('Authorization', `bearer admin`)
			const resQuest = response.body

			expect(resQuest.activationCode).not.toBe(undefined)
		})
	})

	describe('when user is not admin', async () => {
		test('quest does not include activation code', async () => {

			const response = await api
				.get(`/api/quests${quest._id}`)
				.set('Authorization', `bearer regularUser`)
			const resQuest = response.body

			expect(resQuest.activationCode).toBe(undefined)
		})
	})
})

describe('POST, adding a new quest to api/quests', async () => {
	let course

	beforeAll(async () => {
		const testCourse =
			{
				name: "Testikurssi",
				courseCode: "TKT007",
				quests: [],
				users: []
			}
		course = new Course(testCourse)
		await course.save()
	})

	describe('if user is admin', async () => {

		test('quest is added', async () => {

			const questsInDb = await questsInTestDb()

			const newQuest = {
				name: "a new quest",
				description: "Testing POST",
				points: 150,
				type: "Solo-quest",
				activationCode: "post",
				course: course._id
			}

			const createdQuest = await api
				.post('/api/quests')
				.set('Authorization', `bearer admin`)
				.send(newQuest)
				.expect(200)
				.expect('Content-Type', /application\/json/)

			const questsAfter = await questsInTestDb()

			const questNames = questsAfter.map(r => r.name)
			expect(questNames).toContain('a new quest')

			expect(questsAfter.length).toBe(questsInDb.length + 1)

			course = await Course.findById(course._id)
			expect(course.quests).toContain(createdQuest.body.id)
		})
	})

	describe('if user is not admin', async () => {

		test('quest is not added', async () => {

			jest.doMock('../utils/adminCheck')

			const api = supertest(app)

			const questsInDb = await questsInTestDb()

			const newQuest = {
				name: "a new quest",
				description: "Testing POST",
				points: 150,
				type: "Solo-quest",
				done: true,
				started: true,
				activationCode: "post"
			}

			await api
				.post('/api/quests')
				.set('Authorization', `bearer testitoken`)
				.send(newQuest)
				.expect(400)
		})
	})
})

describe('POST, user starting quest in api/quest/:id/start', async () => {
	let userStarting

	beforeEach(async () => {

		await Quest.remove({})
		await User.remove({})

		userStarting = new User(initialUsers[0])
		await userStarting.save()
		const questObjects = initialQuests.map(quest => new Quest(quest))
		const promiseArray = await questObjects.map(quest => quest.save())
		await Promise.all(promiseArray)

	})

	test('if user hasnt started quest, quest is started for user', async () => {
		const questsBefore = await questsInTestDb()
		const questToBeStarted = questsBefore[0]
		expect(questToBeStarted.usersStarted.length).toBe(0)

		const questStarted = await api
			.post(`/api/quests/${questToBeStarted._id}/start`)
			.set('Authorization', `bearer userWithId ${userStarting._id}`)
			.expect(200)

		const usersAfter = await usersInTestDb()
		const userStarted = usersAfter.find(u => u._id.toString() === userStarting._id.toString())

		expect(questStarted.body.usersStarted.map(q => q.user.toString())).toContainEqual(userStarting._id.toString())
		expect(userStarted.quests.map(q => q.quest.toString())).toContainEqual(questStarted.body.id.toString())
	})

	test('if user has started quest, user cant start it again', async () => {
		const quest = new Quest({
			name: "STARTED QUEST",
			description: "THIS QUEST HAS BEEN STARTED ALREADY",
			points: 5,
			type: "Timed solo quest",
			done: false,
			started: false,
			activationCode: "STARTED",
			usersStarted: [{ user: "5a85756ef41b1a447acce08a", startTime: Date.now(), finishTime: null }]
		})
		const savedQuest = await quest.save()
		const user = await api
			.post(`/api/quests/${savedQuest._id}/start`)
			.set('Authorization', 'bearer testitoken')
			.expect(400)
	})
})

describe('POST, user completing quest in api/quests/:id/finish', async () => {

	beforeEach(async () => {
		await Quest.remove({})
		await User.remove({})
		await Course.remove({})
	})

	test('if user has started quest, user can complete it', async () => {
		let testUser = new User({
			quests: [],
			username: "hunter",
			email: "hunter@helsinki.fi",
			tmc_id: 25000,
			admin: true,
			points: 0
		})

		await testUser.save()

		const course = new Course({
			name: "testCourse123",
			courseCode: "1123",
			quests: [],
			users: [{
				_id: "5a981abbabd1a43cd4055f7c",
				user: testUser._id,
				points: 0
			}]
		})
		await course.save()

		const quest = new Quest({
			name: "STARTED QUEST",
			description: "THIS QUEST HAS BEEN STARTED ALREADY",
			points: 5,
			type: "Timed solo quest",
			done: false,
			started: false,
			activationCode: "STARTED",
			usersStarted: [{
				_id: "5a981abbabd1a43cd4055f7c",
				user: testUser._id,
				startTime: "2018-03-01T15:22:35.445Z",
				finishTime: null
			}],
			course: course._id
		})
		await quest.save()

		testUser.quests = [{
			_id: "5a981abbabd1a43cd4055f7c",
			quest: quest._id,
			startTime: "2018-03-01T15:22:35.445Z",
			finishTime: null
		}]

		await testUser.save()

		const finishedQuest = await api
			.post(`/api/quests/${quest._id}/finish`)
			.set('Authorization', `bearer userWithId ${testUser._id}`)
			.send({ activationCode: "STARTED" })
			.expect(200)

		expect(finishedQuest.body.name).toEqual("STARTED QUEST")

		finQuestFromDB = await Quest.findById(finishedQuest.body.id)
		testUser = await User.findById(testUser._id)

		const finishTimeOfUser = testUser.quests.find(q => q.quest.toString() === finishedQuest.body.id.toString()).finishTime
		expect(finishTimeOfUser).not.toBeNull

		const finishTimeOfQuest = finQuestFromDB.usersStarted.find(u => u.user.toString() === testUser._id.toString()).finishTime
		expect(finishTimeOfQuest).toEqual(finishTimeOfUser)
	})

	test('if user has completed a quest, he cannot complete it again', async () => {
		const quest = new Quest({
			name: "FINISHED QUEST",
			description: "THIS QUEST HAS BEEN FINISHED ALREADY",
			points: 5,
			type: "Timed solo quest",
			done: false,
			started: false,
			activationCode: "FINISHED",
			usersStarted: [{
				_id: "5a981abbabd1a43cd4055f7c",
				user: "5a85756ef41b1a447acce08a",
				startTime: "2018-03-01T15:22:35.445Z",
				finishTime: "2018-03-01T16:24:37.445Z"
			}]
		})
		const savedQuest = await quest.save()

		const response = await api
			.post(`/api/quests/${savedQuest._id}/finish`)
			.set('Authorization', `bearer hasQuestFinished ${savedQuest._id}`)
			.send({ activationCode: "FINISHED" })
			.expect(400)

		expect(response.body.error).toEqual("User has already finished this quest")
	})

	test('quest cannot be completed with wrong activation code', async () => {
		const quest = new Quest({
			name: "STARTED QUEST",
			description: "THIS QUEST HAS BEEN STARTED ALREADY",
			points: 5,
			type: "Timed solo quest",
			done: false,
			started: false,
			activationCode: "STARTED",
			usersStarted: [{
				_id: "5a981abbabd1a43cd4055f7c",
				user: "5a85756ef41b1a447acce08a",
				startTime: "2018-03-01T15:22:35.445Z",
				finishTime: null
			}]
		})
		const savedQuest = await quest.save()

		const response = await api
			.post(`/api/quests/${savedQuest._id}/finish`)
			.set('Authorization', `bearer hasQuestStarted ${savedQuest._id}`)
			.send({ activationCode: "TRIED" })
			.expect(400)

		expect(response.body.error).toEqual("Wrong activationcode")
	})

	test('if user hasnt started quest, quest cannot be finished', async () => {
		const quest = new Quest({
			name: "STARTED QUEST",
			description: "THIS QUEST HAS BEEN STARTED ALREADY",
			points: 5,
			type: "Timed solo quest",
			done: false,
			started: false,
			activationCode: "STARTED",
			usersStarted: []
		})
		const savedQuest = await quest.save()

		const response = await api
			.post(`/api/quests/${savedQuest._id}/finish`)
			.set('Authorization', `bearer regularUser`)
			.send({ activationCode: "STARTED" })
			.expect(400)

		expect(response.body.error).toEqual("User has not started this quest")
	})
})

describe('Quest deactivation', async () => {

	let activeQuest
	let notActiveQuest
	let testUser
	let testCourse

	beforeEach(async () => {
		await Quest.remove({})
		await User.remove({})
		await Course.remove({})

		activeQuest = new Quest({
			name: "ACTIVE QUEST",
			description: "THIS QUEST IS ACTIVE",
			points: 5,
			type: "Timed solo quest",
			done: false,
			started: false,
			activationCode: "STARTED",
			deactivated: false
		})

		notActiveQuest = new Quest({
			name: "NOT ACTIVE QUEST",
			description: "THIS QUEST IS NOT ACTIVE",
			points: 5,
			type: "Timed solo quest",
			done: false,
			started: false,
			activationCode: "STARTED",
			deactivated: true
		})

		testUser = new User({
			quests: [],
			username: "hunter",
			email: "hunter@helsinki.fi",
			tmc_id: 25000,
			admin: true,
			points: 0
		})

		testCourse = new Course({
			name: "testCourse123",
			courseCode: "1123",
			quests: [],
			users: [{
				_id: "5a981abbabd1a43cd4055f7c",
				user: testUser._id,
				points: 0
			}]
		})

	})

	test('GET /api/quests to quests returns only acive quests for normal user', async () => {

		await activeQuest.save()
		await notActiveQuest.save()

		const response = await api
			.get('/api/quests')
			.set('Authorization', 'bearer regularUser')
			.expect(200)

		expect(response.body.map(q => q.deactivated))
			.not
			.toContain(true)
	})

	test('GET /api/quests returns both active and not active quests for admin user', async () => {

		await activeQuest.save()
		await notActiveQuest.save()

		const response = await api
			.get('/api/quests')
			.set('Authorization', 'bearer admin')
			.expect(200)

		const activeList = response.body.map(q => q.deactivated)
		expect(activeList)
			.toContain(true)
		expect(activeList)
			.toContain(false)
	})

	test('POST /api/quests/:id/deactivated deactivates quest if user is admin', async () => {

		const questBefore = await activeQuest.save()

		expect(questBefore.deactivated).toBe(false)

		await api
			.post(`/api/quests/${questBefore.id}/deactivated`)
			.set('Authorization', 'bearer admin')
			.expect(200)

		const questAfter = await api
			.get(`/api/quests/${questBefore.id}`)
			.set('Authorization', 'bearer admin')
			.expect(200)

		expect(questAfter.body.deactivated).toBe(true)
	})

	test('POST /api/quests/:id/deactivated doesnt deactivate the quest if user is not admin', async () => {
		const questBefore = await activeQuest.save()

		expect(questBefore.deactivated).toBe(false)

		const questAfter = await api
			.get(`/api/quests/${questBefore.id}`)
			.set('Authorization', 'bearer regularUser')
			.expect(200)

		expect(questAfter.body.deactivated).toBe(false)
	})

	test('POST /api/quest/:id/start starts a quest for user if the quest is active', async () => {
		const questBefore = await activeQuest.save()
		await testUser.save()

		const questStarted = await api
			.post(`/api/quests/${questBefore._id}/start`)
			.set('Authorization', `bearer userWithId ${testUser._id}`)
			.expect(200)

		const usersAfter = await usersInTestDb()
		const userStarted = usersAfter.find(u => u._id.toString() === testUser._id.toString())

		expect(userStarted.quests.map(q => q.quest.toString())).toContainEqual(questStarted.body.id.toString())
		expect(questStarted.body.usersStarted.map(q => q.user.toString())).toContainEqual(testUser._id.toString())
	})

	test('POST /api/quest/:id/start doesnt start a quest for user if the quest is deactived', async () => {
		const questBefore = await notActiveQuest.save()

		const response = await api
			.post(`/api/quests/${questBefore._id}/start`)
			.set('Authorization', 'bearer testitoken')
			.expect(400)
		expect(response.body.error).toEqual('This quest is deactivated')
	})

	test('POST /api/quest/:id/finish marks the active quest as finished if user gives the correct activation code and has started the quest', async () => {
		await testCourse.save()

		const quest = new Quest({
			name: "STARTED QUEST",
			description: "THIS QUEST HAS BEEN STARTED ALREADY",
			points: 5,
			type: "Timed solo quest",
			done: false,
			started: false,
			activationCode: "STARTED",
			deactivated: false,
			usersStarted: [{
				_id: "5a981abbabd1a43cd4055f7c",
				user: "5a85756ef41b1a447acce08a",
				startTime: "2018-03-01T15:22:35.445Z",
				finishTime: null
			}],
			course: testCourse._id
		})
		const savedQuest = await quest.save()

		testUser.quests = [{
			_id: "5a981abbabd1a43cd4055f7c",
			quest: savedQuest._id,
			startTime: "2018-03-01T15:22:35.445Z",
			finishTime: null
		}]
		await testUser.save()

		const response = await api
			.post(`/api/quests/${savedQuest._id}/finish`)
			.set('Authorization', `bearer userIdAndQuestId ${testUser._id},${savedQuest._id}`)
			.send({ activationCode: "STARTED" })
			.expect(200)
	})

	test('POST /api/quest/:id/finish doesnt mark the inactive quest as finished if user gives the correct activation code and has started the quest', async () => {
		const quest = new Quest({
			name: "STARTED QUEST",
			description: "THIS QUEST HAS BEEN STARTED ALREADY",
			points: 5,
			type: "Timed solo quest",
			done: false,
			started: false,
			activationCode: "STARTED",
			deactivated: true,
			usersStarted: [{
				_id: "5a981abbabd1a43cd4055f7c",
				user: "5a85756ef41b1a447acce08a",
				startTime: "2018-03-01T15:22:35.445Z",
				finishTime: null
			}]
		})
		const savedQuest = await quest.save()

		const response = await api
			.post(`/api/quests/${savedQuest._id}/finish`)
			.set('Authorization', `bearer hasQuestStarted ${savedQuest._id}`)
			.send({ activationCode: "STARTED" })
			.expect(400)
		expect(response.body.error).toEqual('This quest is deactivated')
	})
})

afterAll(() => {
	server.close()
}) 