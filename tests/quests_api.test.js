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

describe('PUT, user starting quest in api/quest/start/:id', async () => {

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
            .put(`/api/quests/start/${questToBeStarted._id}`)
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
            usersStarted: [{user: "5a85756ef41b1a447acce08a", startTime: Date.now(), finishTime: null}]
        })
        const savedQuest = await quest.save()
        const user = await api
            .put(`/api/quests/start/${savedQuest._id}`)
            .set('Authorization', 'bearer testitoken')
            .expect(400)
    })
})

describe('PUT, user completing quest in api/quests/finish/:id', async () => {

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
            usersStarted: [{ _id: "5a981abbabd1a43cd4055f7c",
                user: "5a85756ef41b1a447acce08a",
                startTime: "2018-03-01T15:22:35.445Z",
                finishTime: null }]
        })
        const savedQuest = await quest.save()

        await api
            .put(`/api/quests/finish/${savedQuest._id}`)
            .set('Authorization', `bearer hasQuestStarted ${savedQuest._id}`)
            .send({activationCode: "STARTED"})
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
            usersStarted: [{ _id: "5a981abbabd1a43cd4055f7c",
                user: "5a85756ef41b1a447acce08a",
                startTime: "2018-03-01T15:22:35.445Z",
                finishTime: "2018-03-01T16:24:37.445Z" }]
        })
        const savedQuest = await quest.save()

        const response = await api
            .put(`/api/quests/finish/${savedQuest._id}`)
            .set('Authorization', `bearer hasQuestFinished ${savedQuest._id}`)
            .send({activationCode: "FINISHED"})
            .expect(400)
        
        expect(response.body.error).toEqual("User has already finished this quest")
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