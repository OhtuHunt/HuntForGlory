const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
	//instuctor: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' },
	groupName: String,
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    users: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' }
		}]
})

groupSchema.statics.format = (group) => {
    return {
		//instructor: group.instructor,
		groupName: group.groupName,
        id: group.id,
        course: group.course,
        users: group.users
    }
}

const Group = mongoose.model('Group', groupSchema)

module.exports = Group