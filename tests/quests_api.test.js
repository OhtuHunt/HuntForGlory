const Quest = require('../models/quest')
const User = require('../models/app_user')
const supertest = require('supertest')
const { initialQuests, questsInTestDb, initialUsers, usersInTestDb } = require('./test_helper')
const { app, server } = require('../src/server/server')
const api = supertest(app)
jest.mock('../utils/tmcAuth')

beforeAll(async () => {

    // Be sure to use test database
    await Quest.remove({})

    const questObjects = initialQuests.map(quest => new Quest(quest))
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

    test('all quests are returned', async () => {
        const questsInDb = await questsInTestDb()

        const response = await api
            .get('/api/quests')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.length).toBe(questsInDb.length)

    })

    test('a specific quest is within the returned quests', async () => {
        const response = await api
            .get('/api/quests')
        const questNames = response.body.map(r => r.name)

        expect(questNames).toContain('Fun with Done')
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

    describe('if user is admin', async () => {

        test('quest is added', async () => {

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
                .set('Authorization', `bearer admin`)
                .send(newQuest)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const response = await api
                .get('/api/quests')

            const questNames = response.body.map(r => r.name)
            expect(questNames).toContain('a new quest')

            expect(response.body.length).toBe(questsInDb.length + 1)
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

    beforeEach(async () => {

        await Quest.remove({})
        await User.remove({})

        const questObjects = initialQuests.map(quest => new Quest(quest))
        const promiseArray = await questObjects.map(quest => quest.save())
        await Promise.all(promiseArray)

    })

    test('if user hasnt started quest, quest is started for user', async () => {
        const questsBefore = await questsInTestDb()
        const questToBeStarted = questsBefore[0]
        expect(questToBeStarted.usersStarted.length).toBe(0)

        const user = await api
            .post(`/api/quests/${questToBeStarted._id}/start`)
            .set('Authorization', 'bearer testitoken')
            .expect(200)

        const questsAfter = await questsInTestDb()
        const questStarted = questsAfter.find(q => q._id.toString() === questToBeStarted._id.toString())

        expect(questStarted.usersStarted.map(q => q.user.toString())).toContainEqual(user.body.id.toString())
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

    })

    test('if user has started quest, user can complete it', async () => {
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

        await api
            .post(`/api/quests/${savedQuest._id}/finish`)
            .set('Authorization', `bearer hasQuestStarted ${savedQuest._id}`)
            .send({ activationCode: "STARTED" })
            .expect(200)
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

describe.only('Quest deactivation', async () => {

    let activeQuest = null
    let notActiveQuest = null

    beforeEach(async () => {
        await Quest.remove({})
        await User.remove({})

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

        const questjee = await api
            .post(`/api/quests/${questBefore.id}/deactivated`)
            .set('Authorization', 'bearer regularUser')
            .expect(400)

        const questAfter = await api
            .get(`/api/quests/${questBefore.id}`)
            .set('Authorization', 'bearer regularUser')
            .expect(200)

        expect(questAfter.body.deactivated).toBe(false)
    })

    test('POST /api/quest/:id/start starts a quest for user if the quest is active', async () => {
        const questBefore = await activeQuest.save()

        const user = await api
            .post(`/api/quests/${questBefore._id}/start`)
            .set('Authorization', 'bearer testitoken')
            .expect(200)

        const questsAfter = await questsInTestDb()
        const questStarted = questsAfter.find(q => q._id.toString() === questBefore._id.toString())

        expect(questStarted.usersStarted.map(q => q.user.toString())).toContainEqual(user.body.id.toString())
    })

    test('POST /api/quest/:id/start doesnt start a quest for user if the quest is deactived', async () => {
        const questBefore = await notActiveQuest.save()

        const user = await api
            .post(`/api/quests/${questBefore._id}/start`)
            .set('Authorization', 'bearer testitoken')
            .expect(400)
        expect(user.body.error).toEqual('This quest is deactivated')
    })
})

/* 
------------------------------------------------------------------------------------------------------------------
    HERE ARE TESTS FOR API/USERS, BECAUSE JEST RAN INTO PORT IN USE ERROR
------------------------------------------------------------------------------------------------------------------
*/

describe('API GET all from api/users', async () => {

    beforeEach(async () => {

        // Be sure to use test database
        await User.remove({})

        const userObjects = initialUsers.map(user => new User(user))
        const promiseArray = userObjects.map(user => user.save())
        await Promise.all(promiseArray)
    })

    describe('when user is admin', async () => {
        test('users include email', async () => {

            const response = await api
                .get('/api/users')
                .set('Authorization', `bearer admin`)
            const userEmails = response.body.map(r => r.email)

            expect(userEmails).not.toContain(undefined)
        })

        test('users include tmc id', async () => {

            const response = await api
                .get('/api/users')
                .set('Authorization', `bearer admin`)
            const userTmcIds = response.body.map(r => r.tmc_id)

            expect(userTmcIds).not.toContain(undefined)
        })
    })

    describe('when user is not admin', async () => {
        test('users do not include email', async () => {

            const response = await api
                .get('/api/users')
                .set('Authorization', `bearer regularUser`)
            const userEmails = response.body.map(r => r.email)
            userEmails.forEach(element => {
                expect(element).not.toBeDefined()
            })
        })

        test('users do not include tmc id', async () => {

            const response = await api
                .get('/api/users')
                .set('Authorization', `bearer regularUser`)
            const userTmcIds = response.body.map(r => r.tmc_id)
            userTmcIds.forEach(element => {
                expect(element).not.toBeDefined()
            })
        })
    })

    test('users are returned as json', async () => {
        await api
            .get('/api/users')
            .set('Authorization', `bearer regularUser`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all users are returned', async () => {
        const usersInDb = await usersInTestDb()

        const response = await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.length).toBe(usersInDb.length)

    })

    test('a specific user is within the returned users', async () => {
        const response = await api
            .get('/api/users')
        const usernames = response.body.map(r => r.username)

        expect(usernames).toContain('hunter')
    })

})

afterAll(() => {
    server.close()
})