const mongoose = require('mongoose')

const MemberSchema = new mongoose.Schema({
    myID: String,
    name: String,
    lastName: String,
    email: String,
    password: String,
    location: String,
    type: String
})

const Members = mongoose.model('Members', MemberSchema)

module.exports = Members