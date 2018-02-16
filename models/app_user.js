const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    tmc_id: Number,
    username: String,
    points: Number,
    email: String,
    admin: Boolean
})

userSchema.statics.format = (user) => {
    return {
        id: user.id,
        tmc_id: user.tmc_id,
        username: user.username,
        points: user.points,
        email: user.email,
        admin: user.admin
    }
}

const AppUser = mongoose.model('AppUser', userSchema)

module.exports = AppUser