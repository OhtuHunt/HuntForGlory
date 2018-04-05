const Quest = require('../models/quest')
const User = require('../models/app_user')
const Course = require('../models/course')
const supertest = require('supertest')
const { initialQuests, questsInTestDb, initialUsers, usersInTestDb, thisUserIsInTestDb, coursesInTestDb } = require('./test_helper')
const { app, server } = require('../src/server/server')
const api = supertest(app)
jest.mock('../utils/tmcAuth')

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

describe('API DELETE user from api/user/:id', async () => {
    let userToBeDeleted

    beforeEach(async () => {
        await User.remove({})

        let userObjects = initialUsers.map(user => new User(user))

        userToBeDeleted = new User({
            "quests": [],
            "username": "toBeDeleted",
            "email": "deletingUser@helsinki.fi",
            "tmc_id": 99998,
            "admin": false,
            "points": 0
        })
        userObjects.push(userToBeDeleted)

        const promiseArray = userObjects.map(user => user.save())
        await Promise.all(promiseArray)
    })

    describe('when user is authorized user', async () => {

        test('another user is deleted', async () => {
            const usersBefore = await usersInTestDb()
            const response = await api
                .delete(`/api/users/${userToBeDeleted._id}`)
                .set('Authorization', `bearer admin`)
                .expect(200)

            const usersAfter = await usersInTestDb()
            expect(usersBefore.length).toBe(usersAfter.length + 1)
        })

        test('users information is removed from a quest user had started', async () => {
            const quests = await questsInTestDb()
            let quest = quests[0]

            await Quest.findByIdAndUpdate(quest._id,
                {
                    usersStarted: [{
                        _id: '5a981abbabd1a43cd4055f7c',
                        user: userToBeDeleted._id,
                        startTime: '2018-03-01T15:22:35.445Z',
                        finishTime: null
                    }]
                })

            await User.findByIdAndUpdate(userToBeDeleted._id,
                {
                    quests: [{
                        _id: quest._id,
                        quest: quest._id,
                        startTime: '2018-03-01T15:22:35.445Z',
                        finishTime: null
                    }]
                })

            userToBeDeleted = await User.findById(userToBeDeleted._id)
            quest = await Quest.findById(quest._id)

            expect(quest.usersStarted[0].user.toString()).toEqual(userToBeDeleted._id.toString())
            const response = await api
                .delete(`/api/users/${userToBeDeleted._id}`)
                .set('Authorization', `bearer admin`)
                .expect(200)

            const refreshedQuest = await Quest.findById(quest._id)

            await expect(refreshedQuest.usersStarted[0]).toEqual(undefined)
        })

        test('if id is wrong, return malformatted id error', async () => {
            const response = await api
                .delete('/api/users/007')
                .set('Authorization', `bearer admin`)
                .expect(400)
            expect(response.body.error).toEqual('malformatted id')
        })
    })

    describe('when user is a regular user', async () => {

        test('own account is deleted', async () => {
            const usersBefore = await usersInTestDb()
            expect(await thisUserIsInTestDb(userToBeDeleted._id)).toBe(true)

            const response = await api
                .delete(`/api/users/${userToBeDeleted._id}`)
                .set('Authorization', `bearer userWithId ${userToBeDeleted._id}`)
                .expect(200)

            const usersAfter = await usersInTestDb()
            expect(usersBefore.length).toBe(usersAfter.length + 1)
            expect(await thisUserIsInTestDb(userToBeDeleted._id)).toBe(false)
        })

        test('cannot delete another user', async () => {
            const usersBefore = await usersInTestDb()
            const response = await api
                .delete(`/api/users/${userToBeDeleted._id}`)
                .set('Authorization', `bearer notAnAdmin`)
                .expect(400)

            const usersAfter = await usersInTestDb()
            expect(usersBefore.length).toBe(usersAfter.length)
        })
    })

    describe('Regular user editing', async () => {
        let editorUser

        beforeEach(async () => {
            await User.remove({})

            let userObjects = initialUsers.map(user => new User(user))

            editorUser = new User({
                "quests": [],
                "username": "editor",
                "email": "editor@helsinki.fi",
                "tmc_id": 25000,
                "admin": false,
                "points": 0
            })

            userObjects.push(editorUser)

            wrongUser = new User({
                "quests": [],
                "username": "wrong",
                "email": "wrong@helsinki.fi",
                "tmc_id": 99000,
                "admin": false,
                "points": 0
            })

            userObjects.push(wrongUser)
            const promiseArray = userObjects.map(user => user.save())
            await Promise.all(promiseArray)
        })

        test('is okey with own account and only correct fields are edited', async () => {
            const usersBefore = await usersInTestDb()

            editedBody = {
                "quests": [],
                "username": "changed",
                "email": "changed@helsinki.fi",
                "tmc_id": 99999,
                "admin": true,
                "points": 999
            }

            const response = await api
                .put(`/api/users/${editorUser._id}`)
                .send(editedBody)
                .set('Authorization', `bearer userWithId ${editorUser._id}`)
                .expect(200)

            expect(response.body.username).toBe('changed')
            expect(response.body.email).toBe('changed@helsinki.fi')
            expect(response.body.tmc_id).toBe(25000) // wont change
            expect(response.body.admin).toBe(false) // wont change
            expect(response.body.points).toBe(0) // wont change

            const usersAfter = await usersInTestDb()
            expect(usersBefore.length).toBe(usersAfter.length) // no new user added
        })

        test('is not okey with other users account', async () => {

            editedBody = {
                "quests": [],
                "username": "changed",
                "email": "changed@helsinki.fi",
                "tmc_id": 99999,
                "admin": true,
                "points": 999
            }

            const response = await api
                .put(`/api/users/${editorUser._id}`)
                .send(editedBody)
                .set('Authorization', `bearer userWithId ${wrongUser._id}`)
                .expect(400)

            expect(response.body.error).toBe('You are not authorized to do this')
            // correct error msg given
        })
    })
})

afterAll(() => {
    server.close()
})