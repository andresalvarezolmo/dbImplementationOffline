const router = require('express').Router();
const db = require('../db/db')
const bcrypt = require('../lib/bcrypt')
const {
  body,
  validationResult
} = require("express-validator")

const {
  render
} = require('ejs');


//TODO: move functions into separate files and include them :)

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

var getSpecificStaff = (req, res, next) => {

  var query = "SELECT * FROM StaffListView WHERE StaffID = " + req.params.id;
  console.log(query);
  // console.log("debug: ", req.params.)
  db.query(query, (err, results, fields) => {
    if (err) console.log("error while fetching specific staff staff", err)
    // console.log(results)
    req.results = {
      staff: results[0]
    }
    next()
  });
}

/*
SQL Query to get all members of staff
*/
var getSortStaff = (req, res, next) => {
  // var query = "SELECT * FROM StaffListView ORDER BY " + db.escapeId(req.params.sorter) + " " + (req.params.order === "desc" ?  "DESC" : "ASC")
  var query = "SELECT * FROM StaffListView WHERE fk_RestaurantID = '" + req.user[0].fk_RestaurantID + "' ORDER BY " + db.escapeId(req.params.sorter) + " " + (req.params.order === "desc" ?  "DESC" : "ASC")
  if(req.user[0].StaffPosition == 'Director'){
      query = "SELECT * FROM StaffListView ORDER BY " + db.escapeId(req.params.sorter) + " " + (req.params.order === "desc" ?  "DESC" : "ASC")
  }
  console.log(query)
  // console.log("debug: ", req.params.order)
  db.query(query, ['StaffSalary'], (err, results, fields) => {
    if (err) console.log("error while sorting staff", err)
    // console.log(results)
    req.results = {
      staff: results
    }
    next()
  });
}

var insertAddress = (req, res, next) => {

  db.beginTransaction(function(err) {
    if (err) {
      next(err)
    }
var query = "INSERT INTO AddressView (StreetNo, StreetName, Postcode, City) VALUES (?, ?, ?, ?)"
var city = ''

    db.query(query, [req.body.StreetNo, req.body.AddressStreet, req.body.AddressPostcode, city], function(error, results, fields) {
      // get the id of the inserted row and store it in req so the next middle ware can access this value
      req.transaction = {
        address_id: results.insertId
      }
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
        next()
      });
    });
  });
}

/*
SQL transaction to insert users into the database
*/
var insertUser = (req, res, next) => {
  // source: https://www.npmjs.com/package/mysql#transactions
  db.beginTransaction(function(err) {
    if (err) {
      next(err)
    }
    var query = "INSERT INTO StaffListView (StaffName, StaffPassword, StaffAddress, StaffSalary, StaffPosition, StaffInsuranceNo, Supervises, fk_RestaurantID) \
     VALUES (?,'$2a$10$5vdhKMb36Wp8EwEHmMnCuerjxNZgIQDEXxVPPRAFRnbPH3Qf7yvMa', ?, ?, ?, ?, NULL, ?)"
    db.query(query, [req.body.StaffName, req.transaction.address_id, req.body.StaffSalary, req.body.StaffPosition, req.body.StaffInsuranceNo, req.body.fk_RestaurantID], function(error, results, fields) {
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
        req.message = "Staff " + req.body.StaffName + " successfully added to the database"
        next()
      });
    });
  });
};

var deleteStaff = (req, res, next) => {
  console.log("in delete staff, " , req.body.del_id)
  db.beginTransaction(async function(err) {
    if (err) {
      next(err)
    }
    var query = "delete from Staff where StaffID = " + req.body.del_id
    // console.log(query);
    db.query(query, function(error, results, fields) {
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
        req.message = "Staff " + req.body.StaffName + "  on the database"
        next()
      });
    });
  });
}

/*
SQL transaction to insert users into the database
*/
var updateUser = (req, res, next) => {
  // source: https://www.npmjs.com/package/mysql#transactions
  db.beginTransaction(async function(err) {
    if (err) {
      next(err)
    }
    var query = "UPDATE StaffListView SET StaffName = '" + req.body.StaffName + "', StaffPassword = '$2a$10$5vdhKMb36Wp8EwEHmMnCuerjxNZgIQDEXxVPPRAFRnbPH3Qf7yvMa', StaffAddress = '" + req.transaction.address_id + "', StaffSalary = '" + req.body.StaffSalary + "', StaffPosition = '" + req.body.StaffPosition + "', StaffInsuranceNo = '" + req.body.StaffInsuranceNo + "', Supervises = NULL, fk_RestaurantID = '" + req.body.fk_RestaurantID + "' WHERE StaffID = '" + req.body.StaffID + "'"
    // console.log(query);
    db.query(query, function(error, results, fields) {
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
        req.message = "Staff " + req.body.StaffName + " successfully updated on the database"
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
  res.redirect("/staff/sort/Staffname-asc")
})

router.get("/sort/:sorter-:order",
  // TODO check parameters with express-validator here
  // validate input
  validateInput,
  // TODO input validation
  getSortStaff,
  (req, res, next) => {
    res.render("staff_overview", {
        ses: req.ses,
        staff: req.results.staff
      }),
      // error handler
      (err, req, res, next) => {
        res.send("Error occured")
      }
  })

router.get("/insert", (req, res, next) => {
  // Default values for inital form
  req.form = {
    StaffID: 47,
    StaffName: '',
    StaffPassword: '',
    StaffAddress: '',
    StreetNo: '',
    AddressStreet: '',
    AddressPostcode: '',
    AddressCity: '',
    StaffSalary: 2000,
    StaffPosition: 'Waiter',
    StaffInsuranceNo: '',
    Supervises: null,
    fk_RestaurantID: 3,
    errors: {}
  };

  res.render("staff_insert", {
    ses: req.ses,
    form: req.form,
  })

})

// post would be better, but hey
router.post("/insert", [
    body("StaffName", "Staff name must be at least 3 characters long")
    .exists()
    .isLength({ min: 3 }),
    body('password', 'Password must be at least 4 characters long')
    .isLength({ min: 4 }),
    body('StreetNo', 'Please provide a valid address number')
    .not().isEmpty(),
    body("AddressStreet", "Enter a valid Street")
    .not().isEmpty(),
    body("AddressPostcode", "Enter a valid Postcode")
    .not().isEmpty(),
    body("City", "Enter a valid Postcode")
    .not().isEmpty(),
    body("StaffSalary")
    .not().isEmpty().withMessage("Salary is required")
    .isInt().withMessage("Salary must be a number"),
    body("StaffPosition", "position may not be empty")
    .not().isEmpty(),
    body("StaffInsuranceNo", "StaffInsuranceNo is required")
    .not().isEmpty(),
    body("fk_RestaurantID")
    .not().isEmpty().withMessage("Restaurant id is required")
    .isInt().withMessage("Restaurant iD must be an integer")

  ],
  // check if the input is correct
  validateInput,
  // Insert the user into the database first
  insertAddress,
  // Insert the User into the database
  insertUser,
  // User was successfully added, display a message and render the page
  (req, res, next) => {
    res.render("staff_insert", {
      ses: req.ses,
      form: req.body,
      message: req.message
    })
  },
  // error handler
  (err, req, res, next) => {
    var e = beautifyError(err)
    res.render("staff_insert", {
      ses: req.ses,
      form: req.body,
      errors: e,
      message: req.message
    })
  })


router.get("/", (req, res, next) => {
  res.redirect("/staff/sort/Staffname-asc")
})

router.get("/sort/:sorter-:order",
  // TODO check parameters with express-validator here
  // validate input
  validateInput,
  // TODO input validation
  getSortStaff,
  (req, res, next) => {
    res.render("staff_overview", {
        ses: req.ses,
        staff: req.results.staff
      }),
      // error handler
      (err, req, res, next) => {
        res.send("Error occured")
      }
  })

router.get("/updateStaff/:id", getSpecificStaff, (req, res, next) => {
  req.form = {
    StaffID: req.params.id,
    StaffName: req.results.staff.StaffName,
    StaffPassword: '',
    StaffAddress: req.results.staff.staffAddress,
    StreetNo: req.results.staff.StreetNo,
    AddressStreet: req.results.staff.StreetName,
    AddressPostcode: req.results.staff.postcode,
    AddressCity: req.results.staff.city,
    StaffSalary: req.results.staff.StaffSalary,
    StaffPosition: req.results.staff.StaffPosition,
    StaffInsuranceNo: req.results.staff.StaffInsuranceNo,
    Supervises: null,
    fk_RestaurantID: req.results.staff.fk_RestaurantID,
    errors: {}
  };
  console.log(req.results.staff)
  res.render("staff_update", {
    ses: req.ses,
    form: req.form
  })
})

router.post("/delete", [

    body("del_id", "deletion id must be a number")
    .exists()
  ],
  validateInput,
  deleteStaff,
  (req, res, next) => {
    res.json({ status: "success" })
  },
  // error handler
  (err, req, res, next) => {
    var e = beautifyError(err)
    console.log("del_id: " , req.body)
    console.log("error in delete: " , e)
    res.json({
      status: "fail",
      msg: e
    })
  })


router.get("/updateStaff", (req, res, next) => {
  // Default values for inital form
  req.form = {
    StaffID: 47,
    StaffName: '',
    StaffPassword: '',
    StaffAddress: '',
    StreetNo: '',
    AddressStreet: '',
    AddressPostcode: '',
    AddressCity: '',
    StaffSalary: 2000,
    StaffPosition: 'Waiter',
    StaffInsuranceNo: '',
    Supervises: null,
    fk_RestaurantID: 3,
    errors: {}
  };

  res.render("staff_update", {
    ses: req.ses,
    form: req.form,
  })

})

router.get("/insert", (req, res, next) => {
  // Default values for inital form
  req.form = {
    StaffID: 47,
    StaffName: '',
    StaffPassword: '',
    StaffAddress: '',
    StreetNo: '',
    AddressStreet: '',
    AddressPostcode: '',
    AddressCity: '',
    StaffSalary: 2000,
    StaffPosition: 'Waiter',
    StaffInsuranceNo: '',
    Supervises: null,
    fk_RestaurantID: 3,
    errors: {}
  };

  res.render("staff_insert", {
    ses: req.ses,
    form: req.form,
  })

})


// post would be better, but hey
router.post("/updateStaff", [
    body("StaffName", "Staff name must be at least 3 characters long")
    .exists()
    .isLength({ min: 3 }),
    body('password', 'Password must be at least 4 characters long')
    .isLength({ min: 4 }),
    body('StreetNo', 'Please provide a valid address number')
    .not().isEmpty(),
    body("AddressStreet", "Enter a valid Street")
    .not().isEmpty(),
    body("AddressPostcode", "Enter a valid Postcode")
    .not().isEmpty(),
    body("StaffSalary")
    .not().isEmpty().withMessage("Salary is required")
    .isInt().withMessage("Salary must be a number"),
    body("StaffPosition", "position may not be empty")
    .not().isEmpty(),
    body("StaffInsuranceNo", "StaffInsuranceNo is required")
    .not().isEmpty(),
    body("fk_RestaurantID")
    .not().isEmpty().withMessage("Restaurant id is required")
    .isInt().withMessage("Restaurant iD must be an integer")

  ],
  // check if the input is correct
  validateInput,
  // Insert the user into the database first
  insertAddress,
  // Insert the User into the database
  updateUser,
  // User was successfully added, display a message and render the page
  (req, res, next) => {
    res.render("staff_update", {
      ses: req.ses,
      form: req.body,
      message: req.message
    })
  },
  // error handler
  (err, req, res, next) => {
    var e = beautifyError(err)
    res.render("staff_update", {
      ses: req.ses,
      form: req.body,
      errors: e,
      message: req.message
    })
  })
module.exports = router;
