// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

// load articles
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_fv44zl6d:ddc0kl09i49sjk1ljcl0toaclf@ds163360.mlab.com:63360/heroku_fv44zl6d");
// mongoose.connect("mongodb://localhost/scrapenews4");

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes
app.get("/scrape", function(req, res) {
  request("http://reddit.com/r/technology", function(error, response, html) {
    var $ = cheerio.load(html);
    var articles = $("a.title");
    var articleCount = articles.length - 1;

    articles.each(function(i, element) {
      var result = {};
      result.title = $(this).text();
      result.link = $(this).attr("href");

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
        }

        if (i === articleCount) {
          res.send("Scrape Complete");
        }
      });
    });
  });
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  Article.find({}, function(err, doc) {
    if (err) {
      res.send(err);
    } else {
      res.send(doc);
    }
  });
});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "Comment",
  // then responds with the article with the Comment included
  Article.findOne({ _id: req.params.id })
    .populate('comments')
    .exec(function(err, doc) {
      if (err) {
        res.send(err);
      } else {
        console.log(doc);

        res.send(doc);
      }
  });
});

// Create a new Comment or replace an existing Comment
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new Comment that gets posted to the Comments collection
  // then find an article from the req.params.id
  // and update it's "Comment" property with the _id of the new Comment
  console.log('post req.body');
  console.log(req.body);

  console.log('post req.params.id');
  console.log(req.params.id);

  var newComment = new Comment(req.body);
  console.log('post new comment')
  console.log(newComment);

  // Save the new Comment to mongoose
  newComment.save(function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    } else {
      Article.findOneAndUpdate(
        { _id: req.params.id }, 
        {$push: { "comments": newComment._id }}, 
        // { safe: true }, 
        // { upsert: true },
        function(err, newDoc) {
          if (err) {
            res.send(err);
          } else {
            res.send(newDoc);
          }
        });
    }
  });  
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
