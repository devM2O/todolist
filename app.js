//require to npm install pkgs
const express = require("express");
const bodyParser = require("body-parser");
//require mongoose
const mongoose = require('mongoose');
const _ = require('lodash');  //require lodash


var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);


const app = express();

//let items = ["list1", "list2", "list3"];
//let workList = [];


//setting ejs
app.set("view engine", "ejs");

//using bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));

//public static to css and images
app.use(express.static("public"));


//connect to modoDB and create database    (mongodb://localhost:27017/todolistDB , this is for local)
mongoose.connect("mongodb+srv://admin-minmaw:Test123@cluster0.7dwkq.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//data type of item collection
const itemSchema = {
  name: String
};
//data type of list collection
const listSchema = {
  name: String,
  items: [itemSchema]
}
//mongoose item collection
const Item = mongoose.model("item", itemSchema);
//mongoose list collection
const List = mongoose.model("list", listSchema);

//adding default items
//use this const -- = new Item({name or something else: --}); before adding data to database
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit + button to add"
});
const item3 = new Item({
  name: "<-- Hit this to delete"
});
const defaultItem = [item1, item2, item3];



//get'/'
app.get("/", function(req, res) {
  //select from where
  Item.find({}, function(err, foundItem) {
    if (foundItem.length === 0) {   //check default item not existing?
      //insert
      Item.insertMany(defaultItem, function(err) {
        if (!err){
          console.log("Successfully added default items to database");
        }
      });
      res.redirect("/");
    } else {       //existing? give data to list.ejs
      //this else will be run bcoz of res.redirect("/")
      res.render('list', {
        listTitle: "Today",
        newlistItems: foundItem
      });
    }
  });
});


app.get("/:customListName", function (req, res) { //custom list
  const customListName = _.capitalize(req.params.customListName); //get custom list name

  List.findOne({name: customListName}, function (err, foundList) { //check existing or not
    if(!err){   //check error?
      if(!foundList){      //not? create and store default data
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItem
        });
        list.save();
        res.redirect('/');
      }else{                //no error? give data to list.ejs
        //show an existing list
        res.render('list', {
          listTitle: foundList.name,
          newlistItems: foundList.items
        });
      }
    }
  });
});


//post '/' and '/work' from list.ejs
app.post("/", function(req, res) {
  let item = req.body.newList; //get data form text field
  let listName = req.body.list;  //get value name from list button
  //add data to the Item table
  if(item != null && item != ''){

    let newItem = new Item({   //create temporary array to Item (database) array not inserting
      name: item              //there is just one item array from user type
    });
    if(listName === "Today"){
      newItem.save(); //mongoose insert one method to Item database
      res.redirect('/'); //redirect to target page
    }else {

      List.findOne({name: listName}, function (err, foundList) {
          foundList.items.push(newItem);   //push user data to items from foundList
          foundList.save();
          res.redirect('/' + listName);
      });
    }
  }else {
    res.redirect('/' + listName);
  }
});



app.post('/delete', function(req, res) {
  let checkedID = req.body.checkbox; //get checked ID from list.ejs
  let listName = req.body.listName;  //get list name from hidden input

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedID, function(err) { //findByIdAndRemove from item table
      if (err) {
        console.log("Successfully deleted checked item");
      }
      res.redirect("/");
    });
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedID}}}, function (err, foundList) {
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.post('/list', function (req, res) {
  let listName = _.capitalize(req.body.listName);

    // res.redirect("/" + listName);

});

//port listen locally and heroku
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

//port listen locally
app.listen(port, function() {
  console.log("Server started Successfully");
});
