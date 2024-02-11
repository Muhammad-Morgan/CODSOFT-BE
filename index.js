const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
dotenv.config()

const Members = require('./Models/membersModel')
const Jobs = require('./Models/job')

const app = express()
app.use(cors({
    origin: ['https://jobster-femsa.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(express.json())

mongoose.connect(process.env.URI)
mongoose.connection.once('open', () => console.log('connected to MongoDB'))
app.get('/', (req, res) => {
    res.send('Hi, there...')
})

app.get('/auth', (req, res) => {
    const { token } = req.query
    if (!token) {
        res.json('no token')
    } else {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decode) => {
            if (err) return res.json('not a valid token')
            return res.json({
                state: 'success',
                myToken: token
            })
        })
    }
})

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
// employer version
app.get('/filteremployerjobs', (req, res) => {
    const { position, myID } = req.query
    Jobs.find().then((result) => {
        var newData = [];
        newData = result.filter((item) => item.myID === myID)
        var positionJobs = []
        positionJobs = newData.filter((item) => item.position.includes(position.toLowerCase()))
        res.json(positionJobs);
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
app.get('/employerpool', (req, res) => {
    const { id } = req.query
    Jobs.find().then((result) => {
        var newResult = result.filter((item) => item.myID === id)
        res.json(newResult)
    }).catch(err => console.log(err))
})
app.post('/register', (req, res) => {
    const { name,
        email,
        password,
        type,
        myID } = req.body
    bcrypt.genSalt(process.env.SALT, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            Members.create({
                name,
                email,
                type,
                myID,
                password: hash
            }).then(() => {
                const token = jwt.sign({ myID, name, type }, process.env.TOKEN_SECRET, { expiresIn: process.env.EXPIRE_TOKEN })
                res.json({
                    token,
                    msg: 'registered successfully !',
                    type: 'success'
                })
            }).catch((err) => console.log(err))
        })
    })
})
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    Members.findOne({ email }).then((result) => {
        if (!result) return res.json({
            msg: 'no users',
            type: 'danger'
        })
        else {
            const { name, myID, type } = result
            bcrypt.compare(password, result.password).then((resultCondition) => {
                if (resultCondition) {
                    const token = jwt.sign({ name, myID, type }, process.env.TOKEN_SECRET, { expiresIn: process.env.EXPIRE_TOKEN })
                    res.json({
                        token,
                        msg: 'logged in !',
                        type: 'success'
                    })
                } else {
                    res.json({
                        msg: 'wrong password !',
                        type: 'danger'
                    })
                }
            })
        }
    }
    ).catch(err => console.log(err))
})
app.put('/addjob', (req, res) => {
    Jobs.create(req.body).then(() => res.json({ msg: 'Job was Added', type: 'success' })).catch(err => console.log(err))

})
app.put('/filterstatus', (req, res) => {
    const { status } = req.body
    if (status === 'all') {
        Jobs.find().then((result) => res.json(result)).catch(err => console.log(err))
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
// employer version
app.get('/filteremployerstatus', (req, res) => {
    const { status, myID } = req.query
    if (!status) {
        console.log('No value Found.. !')
    }
    if (status === 'all') {
        Jobs.find().then((result) => {
            var newData = [] 
            newData = result.filter((item) => item.myID === myID)
            // console.log(newData)
            res.json(newData)
        }).catch(err => console.log(err))
    }
    else {
        Jobs.find().then((result) => {
            var newData = []
            newData = result.filter((item) => item.myID === myID)
            var statusJobs = newData.filter((item) => item.status === status)
            res.json(statusJobs)
        }).catch(err => console.log(err))
    }
})
app.put('/filtertypes', (req, res) => {
    const { type } = req.body
    if (type === 'all') {
        Jobs.find().then((result) => res.json(result)).catch(err => console.log(err))
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
// employer version
app.get('/filteremployertypes', (req, res) => {
    const { type, myID } = req.query
    if (!type) {
        console.log('No value Found.. !')
    }
    if (type === 'all') {
        Jobs.find().then((result) => {
            var newData = result.filter((item) => item.myID === myID)
            res.json(newData)
        }).catch(err => console.log(err))
    }
    else {
        Jobs.find().then((result) => {
            var newData = []
            newData = result.filter((item) => item.myID === myID)
            var typesJobs = newData.filter((item) => item.jobType === type)
            res.json(typesJobs)
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
        Members.findOne({ myID: id }).then((result) => res.json(result))
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
        }).catch(err => console.log)
    }).catch(err => console.log)
})
app.delete('/deletejob', (req, res) => {
    const { id } = req.query;
    Jobs.findByIdAndDelete(id).then(() => res.json('deleted!')).catch(err => console.log(err))
})
app.delete('/logout', (req, res) => {
    res.json({
        msg: 'logged out !',
        type: 'success'
    })
})
app.listen(5000, () => console.log('Listening on Server 5000'))
