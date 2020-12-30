const router = require('express').Router();
const db = require('../db/db')
const bcrypt = require('../lib/bcrypt')
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const moment = require('moment')
const {
  body,
  validationResult
} = require("express-validator")

const {
  render
} = require('ejs');


/*

validate express-validator Input.
Should be called after checking variables with express validator

 */
var validateInput = (req, res, next) => {
  const errors = validationResult(req);
  // If the input is invalid, call the error handler. Else, perform database transactions
  if (!errors.isEmpty()) {
    next(errors.array())
  } else {
    next()
  }
}
/*
This function takes an error object, transforms the content and returns an array of error messages
Used after validating input
*/
function beautifyError(err) {
  var msg = []
  if (typeof(err.sqlMessage) !== "undefined") {
    // check for SQL error
    msg = ["SQL Error: " + err.code + " : " + err.sqlMessage]
  } else if (typeof(err[0].param) !== "undefined") {
    // check for express validator errors
    err.forEach((e) => {
      msg.push(e.msg)
    })
  }
  return msg
}

var getSortList = (req, res, next) => {
  if(req.user[0].StaffPosition == 'Waiter'){
    var query = "SELECT * FROM waiterfoodorderview WHERE fk_RestaurantID = '" + req.user[0].fk_RestaurantID + "' ORDER BY " + db.escapeId(req.params.sorter) + " " + (req.params.order === "desc" ?  "DESC" : "ASC")
    console.log("Identified as waiter")
  }
  else if(req.user[0].StaffPosition == 'Chef'){
    var query = "SELECT * FROM ChefOrderedDishesView WHERE fk_RestaurantID = '" + req.user[0].fk_RestaurantID + "' ORDER BY " + db.escapeId(req.params.sorter) + " " + (req.params.order === "desc" ?  "DESC" : "ASC")
    console.log("Identified as chef")
  }
  else{
    console.log("Not logged in")
  }
  // console.log(query)
  db.query(query, (err, results, fields) => {
    if (err) console.log("error while sorting list",err)
    // console.log(results)
    req.results = {
      orders: results
    }
    next()
  });
}

var getDishList = (req, res, next) => {
  var query = "SELECT * FROM DishNameListView WHERE AvailableAtRestaurant = '" + req.user[0].fk_RestaurantID + "'"
  // console.log(query)
  // console.log("debug: ", req.params.order)
  db.query(query, (err, results, fields) => {
    if (err) console.log("error while sorting list",err)
    // console.log(results)
    req.results = {
      dishes: results
    }
    next()
  });
}

/*
-------------------------------
            ROUTES
-------------------------------
*/

router.get("/", (req, res, next) => {
  // Default values for inital form
 
  // req.order = [{ 
  //     OrderID: 1,
  //     Price: "kjk"
  // }]

  // res.render("orders_overview", {
  //   ses: req.ses,
  //   order: req.order,
  // })
  res.redirect("/orders/sort/OrderID-desc")
})

router.get("/sort/:sorter-:order",
// TODO check parameters with express-validator here
// validate input
validateInput,
// TODO input validation
getSortList,
  (req, res, next) => {
    res.render("orders_overview", {
      ses: req.ses,
      orders: req.results.orders,
      moment:moment 
    }),
    // error handler
    (err, req, res, next) => {
      res.send("Error occured")
    }
  })

// router.get("/insert", (req, res, next) => {
//   res.render("orders_insert", {
//     ses: req.ses,
//   })
// })


router.get("/insert/:id?", 

validateInput,
// TODO input validation
getDishList,
  (req, res, next) => {
    if(typeof req.params.id !== 'undefined'){
      req.message = "Order with ID " + req.params.id + " has been added"
      // console.log(req.message)
      res.render("orders_insert", {
        ses: req.ses,
        dishes: req.results.dishes,
        message: req.message
      })
    }
    else{
      res.render("orders_insert", {
        ses: req.ses,
        dishes: req.results.dishes
      })
    }
  })

module.exports = router;

router.post("/createOrder", urlencodedParser, (req,res,next)=>{
  var parsed = Object.keys(req.body).map((key) => [Number(key), req.body[key]]);
  var price = 0;
  console.log(parsed[parsed.length-1][1])
  for (let j = 0; j < parsed.length-1; j++) {
    dishPrice = Number(parsed[j][1]) * Number(parsed[parsed.length-1][1][j])
    price = price + dishPrice
    // console.log("price: " + [parsed.length-1][1][j])
    // console.log("quantity: " + parsed[j][1])
    // console.log(dishPrice);
  }
  // console.log(price);
  var orderQuery = "INSERT INTO foodorder(FoodOrderTime, Price, fk_RestaurantID) VALUES (CURTIME()," + price + ", " + req.user[0].fk_RestaurantID + ")" 
  db.query(orderQuery, (err, result1, fields) => {
    if (err) console.log("error while adding foodorder",err)
    // console.log(result1)
  });
  var orderIDQuery = "SELECT MAX(OrderID) FROM foodorder"
  db.query(orderIDQuery, (err, result2, fields) => {
    if (err) console.log("error while checking max orderID",err)
    console.log("Current OrderID", result2[0]['MAX(OrderID)'])
    for (let i = 0; i < parsed.length-1; i++) {
      // console.log("Price of dish " + i + " is: " + parsed[parsed.length-1][1][i])
      if(parsed[i][1]!=0){
        // console.log("DishID:" + parsed[i][0] + " quantity: " + parsed[i][1])
        var dishQuery = "INSERT INTO DishInsertView(OrderID, DishID, Quantity, fk_RestaurantID) VALUES('"+ result2[0]['MAX(OrderID)'] + "','" + parsed[i][0] + "', '" +  parsed[i][1]+ "','" + req.user[0].fk_RestaurantID +"')"
        console.log(dishQuery)
        db.query(dishQuery, (err,result3,fields)=>{
          if (err) console.log("error while adding dishes",err)
        })
      }
    }
    res.redirect('insert/' + result2[0]['MAX(OrderID)']);
  });
  // console.log(orderQuery)
  // console.log(parsed[parsed.length-1][1][1])

});

router.post("/completed", urlencodedParser, (req,res,next)=>{
  // console.log(req.body);
  var completedDishQuery = "UPDATE UpdateDishListView SET Prepared = 'YES' WHERE OrderID = '"+ req.body['OrderID'] +"' AND DishID = '" + req.body['DishID'] + "'";
  // console.log(completedDishQuery)
  db.query(completedDishQuery, (err,result4,fields)=>{
    if(err) console.log(err)
    // console.log(result4)
    res.redirect('back');
  })
})