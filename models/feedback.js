const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
    title: String,
    content: String,
    read: Boolean
})

feedbackSchema.statics.format = (feedback) => {
    return {
        id: feedback.id,
        title: feedback.title,
        content: feedback.content,
        read: feedback.read
    }
}

const Feedback = mongoose.model('Feedback', feedbackSchema)

module.exports = Feedback