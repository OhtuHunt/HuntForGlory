const mongoose = require('mongoose')

const questSchema = new mongoose.Schema({
    name: String,
    description: String,
    points: Number,
    type: String,
    done: Boolean,
    started: Boolean,
    activationCode: String
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
        activationCode: quest.activationCode
    }
}

const Quest = mongoose.model('Quest', questSchema)

module.exports = Quest