const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    name: String,
    courseCode: String,
    quests: [],
    users: [
        {
			user: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' },
			points: Number
        }]
})

const formatCourseUsers = (users) => {
    return users.map(user => {
        return {
            id: user.user._id,
            username: user.user.username,
            points: user.points
        }
    })
}
// no users
courseSchema.statics.format = (course) => {
    return {
        id: course.id,
        name: course.name,
        courseCode: course.courseCode,
		quests: course.quests,
		users: formatCourseUsers(course.users)
    }
}

const Course = mongoose.model('Course', courseSchema)

module.exports = Course