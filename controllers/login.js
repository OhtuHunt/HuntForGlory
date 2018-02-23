const loginRouter = require('express').Router()
const AppUser = require('../models/app_user')
const tmcAuth = require('../utils/tmcAuth')

require('es6-promise').polyfill();
const fetch = require('isomorphic-fetch');
const tmc = require('tmc-client-js')
const tmcClient = new tmc(process.env.CLIENT_ID, process.env.CLIENT_SECRET)

const axios = require('axios')

loginRouter.post('/', async (request, response) => {
    const body = request.body
    const param = {
        username: body.username,
        password: body.password
    }
    try {
        const res = await tmcClient.authenticate(param)
        const userById = await tmcAuth.authenticate(res.accessToken)

        if (userById === null) {
            const appUser = new AppUser({
                username: user.data.username,
                email: user.data.email,
                tmc_id: user.data.id,
                admin: user.data.administrator,
                points: 0
            })

            const userToSave = await appUser.save()
            response.status(200).send({user: userToSave, token: res.accessToken})
        } else {
            console.log({user: userById, token: res.accessToken})
            response.status(200).send({user: userById, token: res.accessToken})
        }

    } catch (e) {
        console.error(e);
        response.status(400).send({ error: 'authentication failed' })
    } finally {

    }
})

module.exports = loginRouter