const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const Members = require('./models/membersModel')
const Jobs = require('./models/job')
const loggedInUser = require('./models/loggedUsers')

const app = express()
app.use(cors())
app.use(express.json())
//app.use(express.urlencoded({ extended: false }))

mongoose.connect('mongodb+srv://muhammad:helloworld123@jobster.r7jsbjp.mongodb.net/?retryWrites=true&w=majority')
app.get('/', (req,res)=>{
    res.send('Hello World')
})

app.get('/test', (req,res)=>{
    Members.find().then((result) => {
        res.json(result)
    }).catch(err => console.log(err))})

app.get('/getjobs', (req, res) => {
    Jobs.find().then((result) => {
        res.json(result)
    }).catch(err => console.log(err))
})
app.get('/filterjobs', (req, res) => {
    const { position } = req.query
    Jobs.find().then((result) => {
        var newData = [];
        newData = result.filter((item) => {
            return item.position.includes(position.toLowerCase())
        })
        res.json(newData);
    }).catch(err => console.log(err))
})
app.get('/getstatus', (req, res) => {
    Jobs.find().then((result) => {
        var pendingJobs = []
        var interviewJobs = []
        var declinedJobs = []
        pendingJobs = result.filter((item) => item.status === 'pending')
        interviewJobs = result.filter((item) => item.status === 'interview')
        declinedJobs = result.filter((item) => item.status === 'declined')
        var numPen = pendingJobs.length
        var numInter = interviewJobs.length
        var numDec = declinedJobs.length
        res.json({
            numPen,
            numInter,
            numDec
        })
    }).catch(err => console.log(err))
})
app.get('/profile', (req, res) => {
    const { id } = req.query
    Members.findOne({ myID: id }).then((result) => {
        res.json(result)
    }).catch(err => console.log(err))
})
app.get('/api/getsinglejob', (req, res) => {
    const { id } = req.query
    Jobs.findById(id).then((result) => {
        res.json(result)
    }).catch(err => console.log(err))
})
app.post('/register', (req, res) => {
    Members.create(req.body).then(() => res.json('Registered Successfully!')).catch((err) => console.log(err))
})
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    Members.findOne({ email }).then((result) => {
        if (result.password === password) {
            const { name, password, myID } = result
            loggedInUser.create({
                myID,
                name, password,
                isUserLogged: true
            }).then((resu) => {
                res.json(resu)
            })
        }
        else {
            res.json('Wrong Password')
        }
    }
    ).catch(err => console.log(err))
})
app.put('/addjob', (req, res) => {
    Jobs.create(req.body).then(() => console.log('sucess!')).catch(err => console.log(err))

})
app.put('/filterstatus', (req, res) => {
    const { status } = req.body
    if (status === 'all') {
        Jobs.find().then((result) => res.json(result)).catch(err => console.log)
    }
    if (!status) {
        console.log('No value Found.. !')
    }
    else {
        Jobs.find().then((result) => {
            var newData = []
            newData = result.filter((item) => item.status === status)
            res.json(newData)
        }).catch(err => console.log(err))
    }
})
app.put('/filtertypes', (req, res) => {
    const { type } = req.body
    if (type === 'all') {
        Jobs.find().then((result) => res.json(result)).catch(err => console.log)
    }
    if (!type) {
        console.log('No value Found.. !')
    }
    else {
        Jobs.find().then((result) => {
            var newData = []
            newData = result.filter((item) => item.jobType === type)
            res.json(newData)
        }).catch(err => console.log(err))
    }
})
app.put('/updateuser', (req, res) => {
    const { id } = req.query
    const {
        name,
        lastName,
        email,
        location,
    } = req.body
    Members.updateOne({ myID: id }, {
        name,
        lastName,
        email,
        location,
    }).then(() => {
        Members.findOne({ myID: id }).then((result) => console.log(result))
    })
})
app.put('/editmyjob', (req, res) => {
    const { id } = req.query
    const {
        position,
        company,
        location,
        status,
        jobType
    } = req.body
    Jobs.findByIdAndUpdate(id,
        {
            position,
            company,
            location,
            status,
            jobType
        }
    ).then(() => {
        Jobs.findById(id).then((result) => {
            res.json(result)
        }).catch(err=>console.log)
    }).catch(err=>console.log)
})
app.delete('/deletejob',(req,res)=>{
    const {id} = req.query;
    Jobs.findByIdAndDelete(id).then(()=>res.json('deleted!')).catch(err=>console.log(err))
})
app.delete('/logout', (req, res) => {
    const { id } = req.query
    loggedInUser.findByIdAndDelete({ _id: id }).then(() => res.json('deleted!')).catch(err => console.log(err))
})
app.listen(5000, () => console.log('Listening on Server 5000'))
