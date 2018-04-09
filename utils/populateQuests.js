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
        name: "Osallistu aloitusluennolle",
        description: "Osallistu kurssin OTM aloitusluennolle",
        points: 10,
        type: "solo quest",
		activationCode: "code",
		usersStarted: [],
		deactivated: false
    },
    {
        name: "Käy pajassa",
        description: "Käy missä tahansa kurssin pajassa",
        points: 10,
        type: "solo quest",
        activationCode: "code",
		usersStarted: [],
		deactivated: false
    },
    {
        name: "Pidä lukupiiri muiden oppilaiden kanssa",
        description: "Järjestäkää kurssin aikana lukupiiri noin 4-10 opiskelijan kanssa ja kertokaa assarille",
        points: 10,
        type: "Team quest",
        activationCode: "code",
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
			//await Course.findByIdAndUpdate(quest._id, {course: course._id }, { new: true })
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

/*
mongoose
	.connect(config.mongoUrl)
	.then(
	Quest
		.remove({})
		.then(console.log('quests removed'))
	)
	.then(() => {
		console.log('connected to database', config.mongoUrl)
		Promise.all(questObjects.map(quest => quest
			.save()
			.then(console.log(`${quest.name} saved`))
		))
	})
	.then(() => {
		console.log(mongoose.connection.close())
	})
	.catch(err => {
		console.log(err)
	})
*/
