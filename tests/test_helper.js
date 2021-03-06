const Quest = require('../models/quest')
const AppUser = require('../models/app_user')
const Course = require('../models/course')

const initialQuests = [
    {
        name: "Anna artolle femma",
        description: "Etsi käsiisi Arto Hellas ja heitä hänen kanssaan high-five.",
        points: 15,
        type: "Solo-quest",
        done: false,
        started: true,
        activationCode: "femma",
        usersStarted: [],
        usersFinished: [],
        deactivated: false
    },
    {
        name: "Käy pajassa",
        description: "Käy jossakin OHPE:n pajoista ja tee siellä tehtävä.",
        points: 5,
        type: "Solo-location-quest",
        done: false,
        started: false,
        activationCode: "pajahdus",
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
        done: false,
        started: true,
        activationCode: "teamWORKS",
        usersStarted: [],
        usersFinished: [],
        deactivated: false
    },
    {
        name: "Fun with Done",
        description: "Tää tehtävä on jo done",
        points: 150,
        type: "Solo-quest",
        done: true,
        started: true,
        activationCode: "tehtyjo",
        usersStarted: [],
        usersFinished: [],
        deactivated: false
    },
    {
        name: "Long long loooong",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        points: 5,
        type: "Timed solo quest",
        done: false,
        started: false,
        activationCode: "Lorem Ipsumord",
        usersStarted: [],
        usersFinished: [],
        deactivated: false
    }
]

initialUsers = [
    {
        quests: [],
        username: "hunterAdmin",
        email: "admin@helsinki.fi",
        tmc_id: 100,
        admin: true,
        points: 100
    },
    {
        quests: [],
        username: "hunter",
        email: "hunter@helsinki.fi",
        tmc_id: 25000,
        admin: true,
        points: 0
    }

]

initialCourses = [
	{
		name: 'initialCourse',
		courseCode: 'INITC'
	}
]

const questsInTestDb = async () => {
    const quests = await Quest.find({})
    return quests
}

const questsInTestDbWithCourse = async () => {
	//Course doesn't know its quests, only because tests don't require it
	const quests = await Quest.find({})
	const course = await giveCourseFromDb()

	await Promise.all(quests.map(async quest => {
		quest.course = course._id
		await quest.save()
	}))
    return quests
}

const usersInTestDb = async () => {
    const users = await AppUser.find({})
    return users
}

const coursesInTestDb = async () => {
    const courses = await Course.find({})
    return courses
}

const giveCourseFromDb = async () => {
    const course = await Course.findOne({})
    return course
}

const thisUserIsInTestDb = async (id) => {
    
    const user = await AppUser.findById(id)
    if (user === null || user === undefined) {
        return false
    } 
    return true
}

module.exports = {
	initialQuests, questsInTestDb, initialUsers, usersInTestDb, 
	thisUserIsInTestDb, coursesInTestDb, giveCourseFromDb,
	questsInTestDbWithCourse
}
