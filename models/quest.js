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

questSchema.statics.format = (quest) => {
    return {
        id: quest.id,
        name: quest.name,
        description: quest.description,
        points: quest.points,
        type: quest.type,
        activationCode: quest.activationCode,
        usersStarted: quest.usersStarted,
        deactivated: quest.deactivated,
        course: quest.course
    }
}

questSchema.statics.formatNonAdmin = (quest) => {
    return {
        id: quest.id,
        name: quest.name,
        description: quest.description,
        points: quest.points,
        type: quest.type,
        usersStarted: quest.usersStarted,
        deactivated: quest.deactivated,
        course: quest.course
    }
}

const Quest = mongoose.model('Quest', questSchema)

module.exports = Quest