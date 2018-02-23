const AppUser = require('../models/app_user')
const axios = require('axios')

const authenticate = async (token) => {
    try {
        const config = {
            headers: {
                "Authorization": `bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
        
        let userFromTMC = await axios.get('https://tmc.mooc.fi/api/v8/users/current', config)
        let user = await AppUser.findOne({ "tmc_id": userFromTMC.data.id })
        
        return user
    } catch (error) {
        console.log(error)
        return error
    }
}

module.exports = {
    authenticate
}
