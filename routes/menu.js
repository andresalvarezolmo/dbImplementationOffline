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

var getSortMenu = (req, res, next) => {
    var query = "SELECT * FROM DishListView WHERE AvailableAtRestaurant = '" + req.user[0].fk_RestaurantID + "' ORDER BY " + db.escapeId(req.params.sorter) + " " + (req.params.order === "desc" ?  "DESC" : "ASC")
    console.log(query)
    // console.log("debug: ", req.params.order)
    db.query(query, (err, results, fields) => {
      if (err) console.log("error while sorting menu",err)
      // console.log(results)
      req.results = {
        menu: results
      }
      next()
    });
  }
  
  var insertDish = (req, res, next) => {
    // source: https://www.npmjs.com/package/mysql#transactions
    db.beginTransaction(function(err) {
      if (err) {
        next(err)
      }
      var query = "INSERT INTO DishListView (Price, PreparationTime, DishName, AvailableAtRestaurant) \
       VALUES (?, ?, ?, ?)"
      db.query(query, [req.body.Price, req.body.PreparationTime, req.body.DishName, req.body.AvailableAtRestaurant], function(error, results, fields) {
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
          req.message = "Dish " + req.body.DishName + " successfully added to the database"
          next()
        });
      });
    });
  };
/*
-------------------------------
            ROUTES
-------------------------------
*/
router.get("/", (req, res, next) => {
  res.redirect("/menu/sort/DishID-asc")
})

router.get("/sort/:sorter-:order",
// TODO check parameters with express-validator here
// validate input
validateInput,
// TODO input validation
  getSortMenu,
  (req, res, next) => {
    res.render("menu_overview", {
      ses: req.ses,
      menu: req.results.menu
    }),
    // error handler
    (err, req, res, next) => {
      res.send("Error occured")
    }
  })

router.get("/insert", (req, res, next) => {
  res.render("menu_insert", {
    ses: req.ses,
  })
})


router.post("/insert", [
  body("Price")
  .not().isEmpty().withMessage("Price is required")
  .isInt().withMessage("Price must be a number"),
  body("PreparationTime")
  .not().isEmpty().withMessage("PreparationTime is required")
  .isInt().withMessage("PreparationTime must be a number"),
  body('DishName', "DishName is required")
  .not().isEmpty(),
  body("AvailableAtRestaurant")
  .not().isEmpty().withMessage("AvailableAtRestaurant is required")
  .isInt().withMessage("AvailableAtRestaurant must be a number")
],
// check if the input is correct
validateInput,
// Insert the User into the database
insertDish,
// User was successfully added, display a message and render the page
(req, res, next) => {
  res.render("menu_insert", {
    ses: req.ses,
    message: req.message
  })
},
// error handler
(err, req, res, next) => {
  var e = beautifyError(err)
  res.render("menu_insert", {
    ses: req.ses,
    errors: e,
    message: req.message
  })
})

module.exports = router;

