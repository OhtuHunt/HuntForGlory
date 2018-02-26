const tmcAuth = require('./tmcAuth') 

const check = async (request) => {
    try {
        
        const authorization = request.get('authorization')
        if (!(authorization && authorization.toLowerCase().startsWith('bearer '))) {
            return false
        }
        const token = authorization.substring(7)
        let user = await tmcAuth.authenticate(token)
        if (!user.admin) {
            return false
        }
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {check}