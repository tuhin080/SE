const express = require('express')
const app = express()
const env = require('dotenv')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId
const morgan = require('morgan')
env.config()
const PORT = process.env.PORT || 5000

app.set("query parser", "extended");
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
const client = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eohva.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,

})


client.connect(err => {


    const trainListCollection = client.db(process.env.DB_NAME).collection('train_list')
    const purchaseCollection = client.db(process.env.DB_NAME).collection('purchased')
    const userCollection = client.db(process.env.DB_NAME).collection('users')


    //  - - for ADMIN - -
    // //insert a product
    app.post('/admin/trains/add', (req, res) => {
        trainListCollection.insertOne(req.body)
            .then(result => {
                res.send(result)
            })

    })

    //insert purchase ticket info
    app.post('/purchase', (req, res) => {
        
         purchaseCollection.insertOne(req.body)
             .then(result => {
                 res.send(result)
             })

    })


   //cancell
    app.get('/purchase', (req, res) => {
       
        purchaseCollection.find({
            _id: ObjectId(req.query.ticketId),
			bkash:req.query.bkash
            
        })
            .toArray((err, docs) => {
                res.send(docs)
            })

    })

    // end  - - for ADMIN - -


    //get all trains
    app.get('/trains', (req, res) => {

        trainListCollection.find({})
            .toArray((err, docs) => {
                res.send(docs)
            })

    })

    //get some products by keys
    app.get('/search-by-station', (req, res) => {
        // console.log(req.query)
        trainListCollection.find({
            "departure_station": req.query.from,
            "arrival_station": req.query.to,
        })
            .toArray((err, docs) => {
                res.send(docs)
            })

    })


    app.post('/users', (req, res) => {
        const { name, email, password, mobile, address, gender } = req.body

        if (name != '' && email != '' && mobile != '' && password != '') {
            // res.send(req.body)
            userCollection.insertOne(req.body)
                .then(result => {
                    res.send(result)
                })

        }
        else {

            res.send('Please fill the required field')
        }
        res.send(req.body)
    })

    //get a user
    app.get('/users', (req, res) => {
        // console.log(req.query)
        userCollection.find({
            "email": req.query.email,
            "password": req.query.password,
        })
            .toArray((err, docs) => {
                res.send(docs)
            })

    })


    //get some products by keys
    // app.get('/products-by-keys',(req,res)=>{
    //     trainListCollection.find({key:{$in:req.body}})
    //     .toArray((err,docs)=>{
    //       res.send(docs)
    //     })

    // })




    console.log('database connected')
})

const resolvedDirectory = path.resolve()

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(resolvedDirectory,'/front-end/build')))

    app.get('*',(req,res)=>
        res.sendFile(path.resolve(resolvedDirectory,'front-end','build','index.html'))
    )
}
else{
    app.get('/',(req,res)=>{
        res.send('API running ...')
    })
}

app.listen(PORT, () => {
    console.log(`server running in ${process.env.NODE_ENV} at port ${PORT}`)
})