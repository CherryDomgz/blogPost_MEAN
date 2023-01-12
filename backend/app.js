const path = require ("path");//allows us to construct path
const express = require ('express');
const mongoose = require ('mongoose');

const postsRoutes = require("./routes/posts");
const userRoutes = require("./routes/user");

const app = express ();

// mongodb pw: q72JZv0xMNK8PgSD
mongoose
  .connect(
    //"mongodb+srv://CherryD:q72JZv0xMNK8PgSD@school-projects-cluster.vuqi9wf.mongodb.net/blogpost?retryWrites=true&w=majority",
   //{useNewUrlParser: true, useUnifiedTopology: true })
    "mongodb+srv://CherryD:" +
    process.env.MONGO_ATLAS_PW +
    "@school-projects-cluster.vuqi9wf.mongodb.net/blogpost?retryWrites=true&w=majority",
    {useNewUrlParser: true, useUnifiedTopology: true }
    )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

app.use(express.json());//in front of app.use
app.use(express.urlencoded({extended:false}));
app.use("/images", express.static(path.join("backend/images")));//static-any request targetting /images will be fetched.

app.use ((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader (
  'Access-Control-Allow-Headers',
  "Origin, X-Request-With, Content-Type, Accept, Authorization"
  );
  res.setHeader (
    'Access-Control-Allow-Methods',
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
  next ();
});

app.use ("/api/posts", postsRoutes); //filter request going to API post and only request where url path starts will be forwarded to postRoutes
app.use("/api/user", userRoutes);

module.exports = app;


