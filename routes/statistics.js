const router = require('express').Router();
const db = require('../db/db')
const {
  body,
  validationResult
} = require("express-validator")

const { render } = require('ejs');

router.get('/', (req, res, next) => {
  res.render('statistics', { ses: req.ses })
})

// get the number of staff working at a branch (or at all branches if 'all' is specified)
// return: [Manager, Waiter, Chef, Director, all]
router.get('/staff/branch/:branch?', (req, res, next) => {
  var query = "select count(StaffID) as staffcount, StaffPosition from Staff" +
    (req.params.branch !== 'all' ? " WHERE fk_restaurantID = " + req.params.branch : "") +
    " GROUP BY StaffPosition ASC WITH ROLLUP"

  db.query(query, (err, results, fields) => {
    if (err) console.log("error while sorting staff", err)
    staffcount = []
    results.forEach(i => {
      staffcount.push(i.staffcount)
    })
    res.send(staffcount)
  })
})

router.get('revenue/branch/:branch?', (req, res, next) => {

})

router.get('/orders/branch/:branch?/period/:period?/:interval?', (req, res, next) => {
  req.params.interval = req.params.interval - 1
  var part_interval = ""
  var upperBound = "CURDDATE()"
  var lowerBound = "DATE_ADD(CURDATE(), INTERVAL "
  if (req.params.period === 'year') {
    part_interval = "extract(YEAR FROM FoodOrderTime)"
    lowerBound += "-" + req.params.interval + " " + req.params.period + ")"
  } else if (req.params.period === 'month') {
    part_interval = "extract(MONTH FROM FoodOrderTime)"
    lowerBound = "2020-07-01"
  } else if (req.params.period === 'day') { // day
    part_interval = "convert(FoodOrderTime,DATE)"
    lowerBound = "2020-10-08"
  } else {
    res.send({error: true})
  }
  var query = "SELECT RestaurantName, " + part_interval + " as fooddate, COUNT(DISTINCT(OrderID)) as n_of_orders " +
"FROM Restaurant, FoodOrder " +
" WHERE Restaurant.RestaurantID = FoodOrder.fk_restaurantID " +
 (req.params.branch === 'all' ? "" : " AND Restaurant.RestaurantID= " + req.params.branch)  + " " +
 "AND (convert(FoodOrder.FoodOrderTime,date) >=  DATE_ADD(CURDATE(), INTERVAL -" + req.params.interval + " " + req.params.period + ")  " +
 "AND convert(FoodOrder.FoodOrderTime, date) <= CURDATE() ) " +
 "GROUP BY RestaurantName,fooddate WITH ROLLUP;"

 //  var query = "SELECT RestaurantName, " +
 //    part_interval + " as fooddate, " +
 //    "COUNT(DISTINCT(OrderID)) as n_of_orders " +
 //    "FROM Restaurant, FoodOrder " +
 //    "WHERE Restaurant.RestaurantID = FoodOrder.fk_restaurantID"
 // " AND " + (req.params.branch === 'all' ? "" : "Restaurant.RestaurantID= " + req.params.branch + " AND ") +
 //    "(convert(FoodOrder.FoodOrderTime, date) >= " +
 //    " DATE_ADD(CURDATE(), INTERVAL -" + req.params.interval + " " + req.params.period + ") " +
 //    " AND CONVERT(FoodOrder.FoodOrderTime, date) <=" +
 //    " CURDATE() ) " +
 //    "GROUP BY RestaurantName,fooddate WITH ROLLUP;"
  console.log(query)
  db.query(query, (err, results, fields) => {
    var labels = []
    var data = []
    if (err) {console.log("error while sorting staff", err)
next(err)
  }
    results.forEach((item, i) => {
      if (item.fooddate !== null) {
        console.log(item.fooddate)
        var d = Date.parse(item.fooddate)
        date = new Date(d)
        console.log(date)
        var label
        if (req.params.period === 'year')
          label = date.getFullYear()
        else if (req.params.period === 'month') {
          label = "" + (date.getMonth() + 1)
        } else {
          label = date.getDate() + "." + (date.getMonth() + 1) + "."
        }
        labels.push(label)
        data.push(item.n_of_orders)
      }
    });

    res.send({ labels: labels, data: data })
  })
},
(err, req, res, next) => {
  res.send(err)
})

module.exports = router;
