const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const directorCollection = client.db("blogWebDB").collection("directorDB")
    const movieCollection = client.db("blogWebDB").collection("movieDB")

    // get blog data
    app.get("/blogposts", async (req, res) => {
        const cursor = blogCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });

    app.get("/blogdetails/:id", async (req, res) => {
      console.log(req.params.id);
      const result = await blogCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result)
    });

    app.get("/updateblog/:id", async (req, res) => {
      console.log(req.params.id);
      const result = await blogCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result)
    });

    app.get("/myblog/:email", async(req, res) => {
      console.log(req.params.email);
      const result = await blogCollection.find({ email: req.params.email}).toArray();
      res.send(result)
    });

    app.post("/blogposts", async (req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await blogCollection.insertOne(newItem);
      res.send(result)
    })

    app.delete("/delete/:id", async (req, res) => {
      const result = await blogCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      console.log(result)
      res.send(result)
    })

    app.put("/updateChanges/:id", async (req, res) => {
      console.log(req.params.id);
      const query = { _id: new ObjectId(req.params.id)};
      const options = { upsert: true };
      const data = {
        $set: {
          title: req.body.title,
          image_url: req.body.image_url,
          category: req.body.category,
          short_description: req.body.short_description,
          long_description: req.body.long_description,
        },
      };
      const result = await blogCollection.updateOne(query, data, options);
      res.send(result);
    })

   // for filter get data

    // app.get('/filter-blog', async (req, res) => {
    //   const filter = req.query.filter
    //   console.log(filter)
    //   let query = {}
    //   console.log(query)
    //   // if(filter) query = { category: filter}
    //   const result = await blogCollection.find().toArray()
    //   let filterdArr;
    //     filterdArr = result.filter( (item) => 
    //       item.category== filter
    //     ) 
    //   // console.log(result)
    //   console.log(filterdArr)
    //   res.send(filterdArr)
    // })

    app.get('/filter-blog', async (req, res) => {
      const filter = req.query.filter
      const search = req.query.search
      let query = {
        title: { $regex: search, $options: 'i'},
      }
      if (filter) query.category = filter
      const result = await blogCollection.find(query).toArray()
      res.send(result)
    })

    // get featured data
    app.get('/featuredblog', async (req, res) => {
      const description = await blogCollection.find().toArray();
      const sortedDesc = description.sort((a, b) => {
        return b.long_description.split(" ").length - a.long_description.split(" ").length;
      });
      console.log(description)
      console.log(sortedDesc)
      const topPost = sortedDesc.slice(0, 10);
      res.json(topPost)
    })

    //Director Data
    app.get("/director", async (req, res) => {
      const cursor = directorCollection.find();
      const result = await cursor.toArray();
      res.send(result);
     });

     app.get("/moviedb/:category", async(req, res) => {
      console.log(req.params.category);
      const result = await movieCollection.find({ director: req.params.category}).toArray();
      res.send(result)
    });


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