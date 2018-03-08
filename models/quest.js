const mongoose = require('mongoose')

const questSchema = new mongoose.Schema({
    name: String,
    description: String,
    points: Number,
    type: String,
    done: Boolean,
    started: Boolean,
    activationCode: String,
    usersStarted: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' },
            startTime: Date,
            finishTime: Date
        }]
})

questSchema.statics.format = (quest) => {
    return {
        id: quest.id,
        name: quest.name,
        description: quest.description,
        points: quest.points,
        type: quest.type,
        done: quest.done,
        started: quest.started,
        activationCode: quest.activationCode,
        usersStarted: quest.usersStarted
    }
}

questSchema.statics.formatNonAdmin = (quest) => {
    return {
        id: quest.id,
        name: quest.name,
        description: quest.description,
        points: quest.points,
        type: quest.type,
        done: quest.done,
        started: quest.started,
        usersStarted: quest.usersStarted
    }
}

const Quest = mongoose.model('Quest', questSchema)

module.exports = Quest