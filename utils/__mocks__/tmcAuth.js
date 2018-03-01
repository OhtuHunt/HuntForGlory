const AppUser = require('../../models/app_user')

const authenticate = async (token) => {
    let user
    if (token === 'admin') {
        user = {
            "quests": [],
            "_id": "5a85756ef41b1a447acce08a",
            "username": "hunter",
            "email": "gyxgyx@helsinki.fi",
            "tmc_id": 25936,
            "admin": true,
            "points": 0,
            "__v": 4
        }
    } else {
        user = {
            "quests": [],
            "_id": "5a85756ef41b1a447acce08a",
            "username": "hunter",
            "email": "gyxgyx@helsinki.fi",
            "tmc_id": 25936,
            "admin": false,
            "points": 0,
            "__v": 4
        }
    }
    const newUser = new AppUser(AppUser.format(user))
    console.log(newUser)
    return newUser
}

module.exports = { authenticate }