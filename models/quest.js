const mongoose = require('mongoose')

const questSchema = new mongoose.Schema({
    name: String,
    description: String,
    points: Number,
    type: String,
    activationCode: {},
    usersStarted: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' },
            startTime: Date,
            finishTime: Date
        }],
    deactivated: Boolean,
	course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
})

const formatQuestCourse = (course) => {
    return {
        id: course._id,
        name: course.name
    }
}

const formatQuestUsersStarted = (usersStarted) => {
    return usersStarted.map(user => {
        return {
            user: user.user,
            startTime: user.startTime,
            finishTime: user.finishTime
        }
    })
}

questSchema.statics.format = (quest) => {
    return {
        id: quest.id,
        name: quest.name,
        description: quest.description,
        points: quest.points,
        type: quest.type,
        activationCode: quest.activationCode,
        usersStarted: formatQuestUsersStarted(quest.usersStarted),
        deactivated: quest.deactivated,
        course: formatQuestCourse(quest.course)
	}
}

questSchema.statics.formatNonAdmin = (quest) => {
    return {
        id: quest.id,
        name: quest.name,
        description: quest.description,
        points: quest.points,
        type: quest.type,
        usersStarted: formatQuestUsersStarted(quest.usersStarted),
        deactivated: quest.deactivated,
        course: formatQuestCourse(quest.course)
    }
}

const Quest = mongoose.model('Quest', questSchema)

module.exports = Quest