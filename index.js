const express = require('express')
const cors = require('cors')
var jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()
const port =process.env.PORT|| 5000

app.use(express.json())
app.use(cors())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.UserDB}:${process.env.password}@cluster0.ugmduxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



const verifyJWT = (req, res, next) => {
  console.log('hitting server')
  //  console.log(req.headers.authorize)
  const authorize = req.headers.authorize;
  if (!authorize) {
    return res.status(401).send({ error: true, message: 'unauthorize access' })
  }
  const token = authorize.split(' ')[1]
  console.log(token)
  jwt.verify(token, process.env.Secure_Token, (error, decoded) => {
    if (error) {
      return res.status(401).send({ error: true, message: "unauthorize access" })
    }
    req.decoded = decoded
    next()
  })
}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const database = client.db("b9a11-server-side-jritu4h");
    const volunteer = database.collection("volunteer");
    const volunteer2 = database.collection("volunteer2");


    app.post('/jwt', (req, res) => {
      const user = req.body;
      console.log(user)
      const token = jwt.sign(user, process.env.Secure_Token, {
        expiresIn: '2000h'
      });
    
      res.send({ token })

    })



    app.post('/volunteers',async(req,res)=>{
         const createData=req.body;
         const result=await volunteer.insertOne(createData)
         res.send(result)
    })
    app.get('/volunteers',async(req,res)=>{
         const result= await  volunteer.find().toArray()
         res.send(result)
    })
    app.get('/volunteers2',async(req,res)=>{
      const result= await  volunteer2.find().toArray()
      res.send(result)
 })
    app.delete('/volunteers/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) };
        const result = await volunteer.deleteOne(query)
        res.send(result)
      })
    app.get('/volunteers/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) };
        const result = await volunteer.findOne(query)
        res.send(result)
      })
      app.get('/volunteers2/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) };
        const result = await volunteer2.findOne(query)
        res.send(result)
      })
      app.get('/volunteer', verifyJWT, async (req, res) => {
        const email = req.query.email;
  
        if (!email) {
          res.send([]);
        }
        const query = { email: email };
       
        const result = await volunteer.find(query).toArray()
        res.send(result)
      })
      app.patch('/volunteers/:id', async (req, res) => {
        const id = req.params.id;
        const updateDoc = req.body;
        const filter = { _id: new ObjectId(id) };
  
        const result = await volunteer.updateOne(filter, { $set: updateDoc })
  
        res.send(result)
  
      })

     


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})