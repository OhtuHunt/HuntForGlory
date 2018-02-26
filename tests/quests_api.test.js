const Quest = require('../models/quest')
const supertest = require('supertest')
const { initialQuests, questsInTestDb } = require('./test_helper')
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

    test('quests are returned as json', async () => {
        await api
            .get('/api/quests')
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

describe.only('POST, adding a new quest to api/quests', async () => {
    
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



afterAll(() => {
    server.close()
})