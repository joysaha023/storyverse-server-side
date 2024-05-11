const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.ADMIN_DB}:${process.env.ADMIN_PASS}@cluster0.jvkz9mr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const blogCollection = client.db("blogWebDB").collection("blogPosts");

    app.get("/blogposts", async (req, res) => {
        const cursor = blogCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });

    //for filter get data
    app.get('/filter-blog', async (req, res) => {
      const filter = req.query.filter
      console.log(filter)
      let query = {}
      if(filter) query = { category: filter}
      const result = await blogCollection.find(query).toArray()
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('blogging website server is running')
})

app.listen(port, () => {
    console.log(`blogging website running on port ${port}`)
})