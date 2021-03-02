//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:AdminAjeet2538@cluster0.md0p7.mongodb.net/todoListDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Read a book"});
const item2 = new Item({name: "Write a book"});
const defaultItems = [item1, item2];

// Item.insertMany(defaultItems, function(err){
//   if (err){
//     console.log(err);
//   }
// });

app.get("/", function(req, res){
  Item.find({}, function(err, items){
    if(err){
      console.log(err);
    } else {
      res.render("list.ejs", {items: items});
    }
  });


});

app.post("/delete", function(req, res){
  const toDelete = req.body.toDelete;
  Item.findByIdAndRemove(toDelete, function(err){
    if(!err){
      res.redirect("/");
    }
  });
});

app.post("/", function(req, res){
  const itemContents = req.body.newItem;
  const newItem = new Item({name: itemContents});
  newItem.save();
  res.redirect("/");
});

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}

app.listen(port, function(){
  console.log("App has started");
});
