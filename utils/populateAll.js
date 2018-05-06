const Quest = require('../models/quest')
const AppUser = require('../models/app_user')
const Course = require('../models/course')
const mongoose = require('mongoose')
const config = require('./config')

const initialCourse = 	{
	name: 'OTM',
	courseCode: 'TKT20002',
	users: []
}

const initialQuests = [
	{
        name: "Aloitusluennolle",
        description: "Osallistu kurssin OTM aloitusluennolle",
        points: 10,
        type: "activation code",
		activationCode: "code",
		usersStarted: [],
		deactivated: false
    },
    {
        name: "Käy pajassa",
        description: "Käy missä tahansa kurssin pajassa",
        points: 10,
        type: "activation code",
        activationCode: "code",
		usersStarted: [],
		deactivated: false
    },
    {
        name: "Pidä lukupiiri",
        description: "Järjestäkää kurssin aikana lukupiiri noin 4-10 opiskelijan kanssa ja kertokaa assarille",
        points: 10,
        type: "activation code",
        activationCode: "code",
		usersStarted: [],
		deactivated: false
	},
	{
        name: "Osallistu demoon",
        description: "Osallistu kurssin loppudemoon.",
        points: 10,
        type: "activation code",
        activationCode: "code",
		usersStarted: [],
		deactivated: false
	},
	{
        name: "Palauta viikko1",
        description: "Palauta viikon 1 tehtävät jossakin laskarissa assarille.",
        points: 10,
        type: "activation code",
        activationCode: "code",
		usersStarted: [],
		deactivated: false
	},
	{
        name: "Tee vertaisarvio",
        description: "Täytä vertaisarviolomake jonka saat sähköpostiisi.",
        points: 10,
        type: "activation code",
        activationCode: "code",
		usersStarted: [],
		deactivated: false
	},
	{
        name: "Kurssipalaute",
        description: "Anna kurssipalaute täyttämällä palautelomake.",
        points: 10,
        type: "activation code",
        activationCode: "code",
		usersStarted: [],
		deactivated: false
	},
	{
		name: "Paikka-quest",
    	description: "Sijainti on luentosalin B123 läheisyydessä",
    	points: 150,
    	type: "location",
		activationCode: {"lat": 60.20473525458362,"lng": 24.96184882436853, "radius": 6.727390544005631},
		usersStarted: [],
		deactivated: false
	}
]


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

const questObjects = initialQuests.map(quest => new Quest(quest))

const removeOldAndAddNew = async () => {
	try {
		await AppUser.remove({})
		await Course.remove({})
		await Quest.remove({})
		let course = await courseObject.save() 

        await Promise.all(userObjects.map(async (user) => {
            await user.save()
            console.log(`${user.username} saved`)
        }))
        await course.save()

		await Promise.all(questObjects.map(async (quest) => {
			quest.course = course._id.toString()
			await quest.save()
			course.quests = course.quests.concat(quest._id.toString())
			console.log(`${quest.name} saved`)
		}))
		await course.save()

		mongoose.connection.close()
	} catch (error) {
		console.log(error)
	}
}

mongoose.connect(process.env.DEV_MONGODB_URI)
removeOldAndAddNew()
