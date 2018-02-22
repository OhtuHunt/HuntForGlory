const Quest = require('../models/quest')
const supertest = require('supertest')
const { initialQuests, questsInTestDb } = require('./test_helper')
const { app, server } = require('../src/server/server')
const api = supertest(app)

beforeAll(() => {

    // Be sure to use test database
    Quest.remove({})

    const questObjects = initialQuests.map(quest => new Quest(quest))
    const promiseArray = questObjects.map(quest => quest.save())
    Promise.all(promiseArray)
})

test('quests are returned as json', () => {
    api
      .get('/api/quests')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  afterAll(() => {
    server.close()
  })