const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
    subscription: {},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' }
})

subscriptionSchema.statics.format = (subscription) => {
    return {
        id: subscription.id,
		user: subscription.user,
		subscription: subscription.subscription 
    }
}

const PushSubscription = mongoose.model('PushSubscription', subscriptionSchema)

module.exports = PushSubscription