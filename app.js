//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const chance = require('chance').Chance();

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_PW,
  resave: false,
  saveUninitialized:  true,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin:" + process.env.DB_PW + "@cluster0.md0p7.mongodb.net/todoListDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({name: "Read a book"});
const item2 = new Item({name: "Write a book"});
const defaultItems = [item1, item2];

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  todoList: [itemsSchema]
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
  res.render("login.ejs", {nameGen: null, passGen:null});
});

app.post("/register", function(req, res){
  const username = chance.first();
  const password = username + chance.integer({min: 100, max: 999});
  console.log(username);
  console.log(password);

  User.register({username: username}, password, function(err, user){
    if(err){
      console.log(err);
    } else {
      user.todoList.push(item1, item2);
      user.save();
      res.render("login.ejs", {nameGen: username, passGen: password});
    }
  })
});

app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/mylist");
      });
    }
  });
});

app.post("/logout", function(req, res){
  req.logout();
  res.redirect("/");
})

app.get("/mylist", function(req, res){
  if(req.isAuthenticated()){
    res.render("list.ejs", {user: req.user.username, items: req.user.todoList});
  } else {
    res.redirect("/");
  }
})

app.post("/delete", function(req, res){
  if(req.isAuthenticated()){
    User.findById(req.user.id, function(err, user){
        user.todoList.pull({ _id: req.body.toDelete })
        user.save();
        res.redirect("/mylist");
    });

  }
});

app.post("/add", function(req, res){
  if(req.isAuthenticated()){
    const item = new Item({
      name: req.body.newItem
    });
    req.user.todoList.push(item);
    req.user.save()
    res.redirect("/mylist");
  }
});


let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}

app.listen(port, function(){
  console.log("App has started");
});
