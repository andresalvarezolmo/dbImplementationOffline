const router = require('express').Router();
const db = require('../db/db')
const {
  body,
  validationResult
} = require("express-validator")

const { render } = require('ejs');

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

var getSortSupply = (req, res, next) => {
    var query = "SELECT * FROM IngredientListView WHERE RestaurantID = '" + req.user[0].fk_RestaurantID + "' ORDER BY " + db.escapeId(req.params.sorter) + " " + (req.params.order === "desc" ?  "DESC" : "ASC")
    console.log(query)
    // console.log("debug: ", req.params.order)
    db.query(query, (err, results, fields) => {
      if (err) console.log("error while sorting supply",err)
      // console.log(results)
      req.results = {
        supply: results
      }
      next()
    });
  }

var insertSupply = (req, res, next) => {
    // source: https://www.npmjs.com/package/mysql#transactions
    db.beginTransaction(function(err) {
      if (err) {
        next(err)
      }
      var query = "INSERT INTO ingredient (IngredientName, Unit) \
       VALUES (?, ?)"
      db.query(query, [req.body.IngredientName, req.body.Unit], function(error, results, fields) {
        if (error) {
          return db.rollback(function() {
            next(error)
          });
        }
  
        db.commit(function(err) {
          if (err) {
            return db.rollback(function() {
              next(err)
            });
          }
          req.message = "Supply " + req.body.IngredientName + " successfully added to the database"
          next()
        });
      });
    });
  }; 
var linkSupply = (req,res,next)=>{
  var linkingQuery = "INSERT INTO restaurantsupply(RestaurantID, SupplyID, StockLeft) VALUES (?, ?, ?);";
  var retrievingQuery = "SELECT MAX(SupplyID) FROM ingredient;";
  db.query(retrievingQuery, (err,results, fields)=>{
    console.log(results[0]['MAX(SupplyID)'], " and stock", req.body.Stock)

    db.query(linkingQuery, [req.user[0].fk_RestaurantID,results[0]['MAX(SupplyID)'], req.body.Stock], (err,results, fields)=>{
      if(err) console.log(err);
    });
  })
  next();
}

/*
-------------------------------
            ROUTES
-------------------------------
*/
router.get("/", (req, res, next) => {
    res.redirect("/supply/sort/SupplyID-asc")
})
router.get("/sort/:sorter-:order",
// TODO check parameters with express-validator here
// validate input
validateInput,
// TODO input validation
  getSortSupply,
  (req, res, next) => {
    res.render("supply_overview", {
      ses: req.ses,
      supply: req.results.supply
    }),
    // error handler
    (err, req, res, next) => {
      res.send("Error occured")
    }
  })


router.get("/insert", (req, res, next) => {
    res.render("supply_insert", {
      ses: req.ses,
    })
  })
  
router.post("/insert", [
    body("IngredientName", "IngredientName is required")
    .not().isEmpty(),
    body("Unit", "Unit has to be a 'g', 'l', 'piece', 'tablespoon' or 'teaspoon'")
    .not().isEmpty(),
    body("Stock")
    .not().isEmpty().withMessage("Stock is required")
    .isInt().withMessage("Stock must be an integer")
    
  ],
  // check if the input is correct
  validateInput,
  // Insert the User into the database
  insertSupply,
  linkSupply,
  // User was successfully added, display a message and render the page
  (req, res, next) => {
    res.render("supply_insert", {
      ses: req.ses,
      message: req.message
    })
  },
  // error handler
  (err, req, res, next) => {
    var e = beautifyError(err)
    res.render("supply_insert", {
      ses: req.ses,
      errors: e,
      message: req.message
    })
  })
  
  
module.exports = router;

