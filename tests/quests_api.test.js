const Quest = require('../models/quest')
const supertest = require('supertest')
const { initialQuests, questsInTestDb } = require('./test_helper')

/*
beforeAll(async () => {

    // Be sure to use test database
    await Quest.remove({})

    const questObjects = initialQuests.map(quest => new Quest(quest))
    const promiseArray = questObjects.map(quest => quest.save())
    await Promise.all(promiseArray)
})*/