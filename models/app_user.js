const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    tmc_id: Number,
    username: String,
    points: Number,
    email: String,
    admin: Boolean,
    quests: [
        {
            quest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
            startTime: Date,
            finishTime: Date
		}],
	courses: [{course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }}]
})

userSchema.statics.format = (user) => {
    return {
        id: user.id,
        tmc_id: user.tmc_id,
        username: user.username,
        points: user.points,
        email: user.email,
        admin: user.admin,
		quests: user.quests,
		courses: user.courses
    }
}

userSchema.statics.formatNonAdmin = (user) => {
    return {
        id: user.id,
        username: user.username,
        points: user.points,
        admin: user.admin,
		quests: user.quests,
		courses: user.courses
    }
}

userSchema.statics.formatOnlyId = (user) => {
    return {
        id: user.id,
    }
}

const AppUser = mongoose.model('AppUser', userSchema)

module.exports = AppUser