//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
var _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
const itemsSchema = {
  name: String
};
const listSchema = {
  name: String,
  items: [itemsSchema]
}
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);
const item1 = new Item({
  name: "Welcome to ToDoList"
});
const item2 = new Item({
  name: "Click + to add an item"
});
const item3 = new Item({
  name: "click <-- this to delete the item"
});
const arr=[item1, item2, item3];
//Item.insertMany(arr);
async function getItems(){
  const Items = await Item.find({});
  return Items;
}
async function deleteItem(id){
  const Items = await Item.findByIdAndRemove(id);
}
async function findList(name){
  const RouteName = await List.findOne({name: name});
  return RouteName;
}
async function findOne(name, id){
  const listname = await List.findOneAndUpdate({name: name}, {$pull: {items: {_id: id}}});
}
app.get("/", function(req, res) {

  getItems().then(function(FoundItems){
    res.render("list", {listTitle: "Today", newListItems: FoundItems});
  });

});
app.get("/:customRouteLists", function(req, res) {
  const RouteList = _.capitalize(req.params.customRouteLists);
  findList(RouteList).then(function(founditem){
    if(!founditem){
      const list = new List({
        name: RouteList,
        items: arr
      })
    list.save();
    res.redirect("/"+RouteList);
    }else{
      res.render("list", {listTitle: founditem.name, newListItems: founditem.items});
    }
  })

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
  if(listName === "Today"){
    Item.insertMany(item);
    res.redirect("/")
  }else{
  findList(listName).then(function(foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
  });
}

});
app.post("/delete", async function(req, res){
  const itemId=req.body.checkbox;
  const listName=req.body.listName;
if(listName === "Today"){
  deleteItem(itemId);
  res.redirect("/");
  }else{
    await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}});
   res.redirect("/" + listName)
  }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
