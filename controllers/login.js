const loginRouter = require('express').Router()
const AppUser = require('../models/app_user')
const tmcAuth = require('../utils/tmcAuth')
const jwt = require('jsonwebtoken')

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
        const config = {
            headers: {
                'Authorization': `Bearer ${res.accessToken}`,
                'Content-Type': 'application/json'
            }
        }

        const user = await axios.get('https://tmc.mooc.fi/api/v8/users/current', config)
        let userById = await AppUser.findOne({ "tmc_id": user.data.id })

        if (userById === null) {
            
            const appUser = new AppUser({
                username: user.data.username,
                email: user.data.email,
                tmc_id: user.data.id,
                admin: user.data.administrator,
                points: 0
            })

            const userToSave = await appUser.save()
            userById = await AppUser.findOne({ "tmc_id": userToSave.tmc_id })
        } 

        response.status(200).send({user: AppUser.format(userById), token: res.accessToken})

    } catch (e) {
        console.error(e);
        response.status(400).send({ error: 'authentication failed' })
    } finally {

    }
})

module.exports = loginRouter