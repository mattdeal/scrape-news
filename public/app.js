// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    // $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    $("#articles").append(makeArticle(data[i]._id, data[i].title, data[i].link));
  }
});

function makeArticle(id, title, link) {
  return '<div class="panel panel-primary panel-article" data-id="' + id + '">' +
    '<div class="panel-heading">' + 
    '<h3 class="panel-title">' + title + '</h3>' + 
    '</div>' +
    '<div class="panel-body">' + 
    link + 
    '</div>' + 
    '</div>';
}

// Whenever someone clicks a p tag
$(document).on("click", ".panel-article", function() {
  // Empty the comments from the note section
  $("#comments").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);

      // The title of the article
      $("#comment-title").html(data.title);
      // A textarea to add a new note body
      $('#comment-new').empty();
      // $("#comment-new").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#comment-new").append('<div class="row"><div class="col-xs-12"><div class="form-group"><label for="bodyinput" class="col-lg-2 control-label">Comment</label><div class="col-lg-8"><input type="text" class="form-control" id="bodyinput" placeholder="Comment"></div><div class="col-lg-2"><div class="btn btn-info btn-block" data-id=' + data._id + ' id="savenote">Save</div></div></div></div></div>');
      // A button to submit a new note, with the id of the article saved to it
      $("#comment-new").append("<div class='row'><div class='col-xs-12'></div></div>");

      // If there's a note in the article
      if (data.comments) {
        // Place the body of the note in the body textarea
        for (var i = 0; i < data.comments.length; i++) {
          $("#comments").append('<li>' + data.comments[i].body + '</li>');
        }
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  }).done(function(data) {
    // Log the response
    console.log(data);
  });

  // Also, remove the values entered in the input and textarea for note entry
  $("#comments").append('<li>' + $("#bodyinput").val() + '</li>');
  $("#bodyinput").val("");
});
