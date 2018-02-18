const mongoose = require('mongoose')

const questSchema = new mongoose.Schema({
    name: String,
    description: String,
    points: Number,
    type: String,
    done: Boolean,
    started: Boolean,
    activationCode: String,
    usersStarted: [ { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' } ],
    usersFinished: [ { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' } ]
})

questSchema.statics.format = (quest) => {
    return {
        id: quest._id,
        name: quest.name,
        description: quest.description,
        points: quest.points,
        type: quest.type,
        done: quest.done,
        started: quest.started,
        activationCode: quest.activationCode,
        usersStarted: quest.usersStarted,
        usersFinished: quest.usersFinished
    }
}

const Quest = mongoose.model('Quest', questSchema)

module.exports = Quest