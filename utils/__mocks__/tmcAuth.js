const authenticate = async (token) => {
    let user = {
            "quests": [],
            "_id": "5a85756ef41b1a447acce08a",
            "username": "hunter",
            "email": "gyxgyx@helsinki.fi",
            "tmc_id": 25936,
            "admin": true,
            "points": 0,
            "__v": 4
    }
    return user
}

module.exports = {authenticate}