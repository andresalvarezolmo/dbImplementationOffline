const express = require('express')
const app = express()
const port = process.env.PORT || 4000;
const dbConnection = require('./db/db');
const bodyParser = require("body-parser");
const moment = require('moment')

const path = require("path");
const urlencodedParser = bodyParser.urlencoded({extended: false});
const passport = require('passport');
require('./passport/passport');
const cookieSession = require('cookie-session');
const bcrypt = require('./lib/bcrypt')

const loginRoutes = require('./routes/login-routes');
const staffRoutes = require('./routes/staff')
const statisticsRoutes = require('./routes/statistics')
const menuRoutes = require('./routes/menu')
const supplyRoutes = require('./routes/supply')
const orderRoutes = require('./routes/orders')

const ejs = require('ejs');
const {render} = require('ejs');


//retieve data from forms in html
app.use(bodyParser.urlencoded({
  extended: true
}));
//app.use(bodyParser.json());
app.use(express.json()) // for parsing application/json
//app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// provide static content
app.use("/", express.static('./assets'))

//Setting ejs as view engine and folders for each view
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//Cookies
app.use(cookieSession({
  maxAge: 24*60*60*100,
  keys:['abc']
}));

//Passpoiddlewares
app.use(passport.initialize());
app.use(passport.session());
app.use( (req, res, next) => {
  if (req.user) {
    req.ses = {
      id: req.user[0].StaffID,
      username: req.user[0].StaffName,
      position: req.user[0].StaffPosition,
      branch: req.user[0].fk_RestaurantID,
      logged: true
    }
  } else {
    req.ses = {
      logged: false
    }
  }
  next()
})

//separating routes
app.use('/login', loginRoutes);
app.use('/staff', staffRoutes)
app.use('/statistics', statisticsRoutes)
app.use('/menu', menuRoutes)
app.use('/supply', supplyRoutes)
app.use('/orders', orderRoutes)

app.get('/', (req, res) => {

  res.render('index', {ses: req.ses})
})
app.get('/test', (req, res) => {
  var query = "SELECT * FROM DishIngredientsView, CustomerDishView WHERE DishIngredientsView.DishID = CustomerDishView.DishID AND CustomerDishView.AvailableAtRestaurant = " + "1" + " order by DishIngredientsView.DishID"
  var options = {
    sql: query,
    nextTables: '_'
  }
  dbConnection.query(options, (err, result, fields) => {
    if (err)
    // console.log(err)
    // console.log("FIELDS:", fields)
    // console.log(result)
    res.render('test', {results: result})
  })
})
app.get('/logout', (req,res)=>{
  req.logout();
  res.redirect('/');
});

app.get('/home', (req, res) => {
  dbConnection.query(query1,(err, result)=>{
    if(err) console.log(err);

    res.render('home', {info:result, test:'tew'});
  });
})

app.get('/passwordGenerator/:p', async (req, res) => {
  console.log(req.params.p);
  var pass = await bcrypt.encryptPassword(req.params.p);
  res.render('passwordGenerator', {pass: pass});
  for (let index = 0; index < 48; index++) {
    var pass = await bcrypt.encryptPassword('1234');
    console.log(pass)
  }
});

// app.post('/add', urlencodedParser, (req,res)=>{
//   // console.log("Hey")
//   // console.log(req.body);
//   dbConnection.query("INSERT INTO Address (StreetNo, StreetName, Postcode, City) VALUES	('"+ req.body.StreetNo +"','" + req.body.StreetName + "','" + req.body.postcode + "','" + req.body.city + "' )", (err)=>{
//     if(err) console.log(err);
//   });
//   res.redirect('/home');
// })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
