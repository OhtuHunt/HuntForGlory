const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    name: String,
    courseCode: String,
    quests: [
        {
            quest: { type: mongoose.Schema.Types.ObjectId, ref: 'quest' },
        }]
})

questSchema.statics.format = (course) => {
    return {
        id: course.id,
        name: course.name,
        courseCode: course.courseCode,
        quests: course.quests
    }
}

const Course = mongoose.model('Course', courseSchema)

module.exports = Course