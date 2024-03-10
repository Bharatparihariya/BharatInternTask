// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/registrationDB");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Define Schema and Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.use(express.static(__dirname));

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  const newUser = new User({
    name: name,
    email: email,
    password: password,
  });

  newUser
    .save()
    .then((user) => {
      // Read the welcome.html file
      fs.readFile(__dirname + "/welcome.html", "utf8", (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error reading welcome file");
        }

        // Replace {name} with the actual user's name
        const htmlContent = data.replace("{name}", name);

        // Send the HTML content as the response
        res.status(200).send(htmlContent);
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error registering user");
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
