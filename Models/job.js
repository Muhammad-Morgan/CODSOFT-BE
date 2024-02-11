const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema({
    myID: String,
    position: String,
    company: String,
    location: String,
    status: String,
    jobType: String
})

const Jobs = mongoose.model('Jobs', JobSchema)

module.exports = Jobs