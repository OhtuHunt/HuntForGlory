const Quest = require('../models/quest')
const AppUser = require('../models/app_user')
const mongoose = require('mongoose')
const config = require('./config')

const initialQuests = [
	{
		name: "Anna artolle femma",
		description: "Etsi käsiisi Arto Hellas ja heitä hänen kanssaan high-five.",
		points: 15,
		type: "Solo-quest",
		activationCode: "abc",
		usersStarted: [],
		usersFinished: [],
		deactivated: false
	},
	{
		name: "Käy pajassa",
		description: "Käy jossakin OHPE:n pajoista ja tee siellä tehtävä.",
		points: 5,
		type: "Solo-location-quest",
		activationCode: "abc",
		usersStarted: [],
		usersFinished: [],
		deactivated: false
	},
	{
		name: "There is no I in a Team",
		description: "Perustakaa 4-6 hengen ryhmä ja kertokaa ryhmässä vuorollanne teidän mielestänne edellisen viikon vaikein" +
			" tehtävä. Käykää yhdessä läpi erilaisia ratkaisuja kyseiseen tehtävään. Katsokaa myös mallivastausta yhdessä",
		points: 25,
		type: "Group-quest",
		activationCode: "abc",
		usersStarted: [],
		usersFinished: [],
		deactivated: false
	},
	{
		name: "Fun with Done",
		description: "Tää tehtävä on jo done",
		points: 150,
		type: "Solo-quest",
		activationCode: "abc",
		usersStarted: [],
		usersFinished: [],
		deactivated: false
	},
	{
		name: "Quest with long description",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Etiam ullamcorper facilisis mi, ac egestas libero commodo in. Nullam dui urna, sollicitudin vel enim in, luctus consectetur diam. Curabitur scelerisque at odio a vestibulum. Cras vehicula nunc varius lacus semper pharetra. Nunc congue est justo, at vulputate purus euismod eget. Nullam sollicitudin placerat ante. Nunc a justo non nibh rhoncus molestie. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut a libero quis leo elementum ultricies. Aenean vitae placerat velit, vel porta diam. Nulla condimentum, ante eu convallis ullamcorper, est quam ultricies velit, et interdum sapien leo eu lacus. Duis non elit odio. Quisque justo purus, semper sit amet justo sed, maximus rutrum ex. In ut aliquam mi, id iaculis ex.",
		points: 5,
		type: "Timed solo quest",
		activationCode: "abc",
		usersStarted: [],
		usersFinished: [],
		deactivated: false
	}
]

const questObjects = initialQuests.map(quest => new Quest(quest))

const removeOldQuestsAndAddNew = async () => {
	try {
		const users = await AppUser.find({})
		await Promise.all(users.map(async (user) => {
			await AppUser.findByIdAndUpdate(user._id, { quests: [], points: 0 }, { new: true })
			console.log(`Quests deleted from ${user.username}`)
		}))

		await Quest.remove({})
		await Promise.all(questObjects.map(async (quest) => {
			await quest.save()
			console.log(`${quest.name} saved`)
		}))
		mongoose.connection.close()
	} catch (error) {
		console.log(error)
	}
}

mongoose.connect(config.mongoUrl)
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
