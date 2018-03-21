const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    name: String,
    courseCode: String,
    quests: [
        {
            quest: { type: mongoose.Schema.Types.ObjectId, ref: 'quest' }
        }],
    users: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' }
        }]
})

// no users
courseSchema.statics.format = (course) => {
    return {
        id: course.id,
        name: course.name,
        courseCode: course.courseCode,
        quests: course.quests
    }
}

courseSchema.statics.formatAdmin = (course) => {
    return {
        id: course.id,
        name: course.name,
        courseCode: course.courseCode,
        quests: course.quests,
        users: course.users
    }
}

const Course = mongoose.model('Course', courseSchema)

module.exports = Course