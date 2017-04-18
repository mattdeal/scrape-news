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

    $("a.title").each(function(i, element) {
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
      });
    });
  });

  res.send("Scrape Complete");
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
  // and run the populate method with "note",
  // then responds with the article with the note included
  Article.findOne({ _id: req.params.id })
    .populate('comment')
    .exec(function(err, doc) {
    if (err) {
      res.send(err);
    } else {
      res.send(doc);
    }
  });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note

   var newNote = new Note(req.body);
  // Save the new note to mongoose
  newNote.save(function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    } else {
      Article.findOneAndUpdate({ _id: req.params.id }, 
        { "comment": doc._id}, 
        // { new: true }, 
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
