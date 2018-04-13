const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
    //instuctor: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    users: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' }
        }]
})

groupSchema.statics.format = (group) => {
    return {
        //instructor: group.instructor,
        id: group.id,
        course: group.course,
        users: group.users
    }
}

const Group = mongoose.model('Group', groupSchema)

module.exports = Group