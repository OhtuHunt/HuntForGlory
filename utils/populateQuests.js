const Quest = require('../models/quest')
const AppUser = require('../models/app_user')
const Course = require('../models/course')
const mongoose = require('mongoose')
const config = require('./config')

const initialCourse = 	{
	name: 'OTM',
	courseCode: 'OTM'
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

const questObjects = initialQuests.map(quest => new Quest(quest))
const courseObject = new Course(initialCourse)

const removeOldQuestsAndAddNew = async () => {
	try {
		const users = await AppUser.find({})
		await Promise.all(users.map(async (user) => {
			await AppUser.findByIdAndUpdate(user._id, { quests: [], points: 0, courses: [] }, { new: true })
			console.log(`Quests and courses deleted from ${user.username}`)
		}))
		await Course.remove({})
		await Quest.remove({})
		let course = await courseObject.save() 

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
removeOldQuestsAndAddNew()
