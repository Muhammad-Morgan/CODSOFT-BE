const mongoose = require('mongoose')

const loggedUser = new mongoose.Schema({
    myID: String,
    password: String,
    name: String,
    isUserLogged: Boolean
})

const loggedInUser = mongoose.model('loggedInUser',loggedUser)
module.exports = loggedInUser