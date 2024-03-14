const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Post = require("./modules/post");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static("public"));
app.use("/public", express.static(__dirname + "/public"));

app.set("view engine", "ejs"); // Set EJS as the view engine
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/blogDB");

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/read", async (req, res) => {
  try {
    const posts = await Post.find({});
    res.render("read.ejs", { posts: posts });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/write", (req, res) => {
  res.render("write.ejs");
});

app.post("/write", async (req, res) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
    });

    await post.save();
    res.redirect("/read"); // Redirect to the /read route
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/delete/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    await Post.findByIdAndDelete(postId);
    res.redirect("/read"); // Redirect to the /read route
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/edit/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId);
    res.render("edit.ejs", { post: post });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/edit/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    await Post.findByIdAndUpdate(postId, {
      title: req.body.title,
      content: req.body.content,
    });
    res.redirect("/read"); // Redirect to the /read route
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
