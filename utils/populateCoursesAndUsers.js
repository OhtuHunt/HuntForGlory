const Quest = require('../models/quest')
const AppUser = require('../models/app_user')
const Course = require('../models/course')
const mongoose = require('mongoose')
const config = require('./config')

const initialCourse = {
    name: 'OTM',
    courseCode: 'TKT20002',
    users: []
}

const testUsers = [
    {
        quests: [],
        courses: [],
        username: "testUser1",
        email: "testUser1@gmail.com",
        tmc_id: 1,
        admin: false
    },
    {
        quests: [],
        courses: [],
        username: "testUser2",
        email: "testUser2@gmail.com",
        tmc_id: 2,
        admin: false
    },
    {
        quests: [],
        courses: [],
        username: "testUser3",
        email: "testUser3@gmail.com",
        tmc_id: 3,
        admin: false
    },
    {
        quests: [],
        courses: [],
        username: "testUser4",
        email: "testUser4@gmail.com",
        tmc_id: 4,
        admin: false
    },
    {
        quests: [],
        courses: [],
        username: "testUser5",
        email: "testUser5@gmail.com",
        tmc_id: 5,
        admin: false
    },
    {
        quests: [],
        courses: [],
        username: "testUser6",
        email: "testUser6@gmail.com",
        tmc_id: 6,
        admin: false
    },
    {
        quests: [],
        courses: [],
        username: "adminhunter",
        email: "pellervohunter@gmail.com",
        tmc_id: 27282,
        admin: true,
        points: 0
    }
]

const userObjects = testUsers.map(user => new AppUser(user))
const courseObject = new Course(initialCourse)

userObjects.forEach(user => {
    courseObject.users = courseObject.users.concat([{ user: user._id, points: 0 }])
	user.courses = user.courses.concat([{ course: courseObject._id }])
})

const removeCoursesAndUsersAndAddNew = async () => {
    try {
        await AppUser.remove({})
        await Course.remove({})

        let course = await courseObject.save()

        await Promise.all(userObjects.map(async (user) => {
            await user.save()
            console.log(`${user.username} saved`)
        }))
        await course.save()

        mongoose.connection.close()
    } catch (error) {
        console.log(error)
    }
}

mongoose.connect(process.env.DEV_MONGODB_URI)
removeCoursesAndUsersAndAddNew()