const router = require('express').Router();
const {render} = require('ejs');
const passport = require('passport');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const dbConnection = require('../db/db');
const bcrypt = require('../lib/bcrypt')



router.get('/', async(req, res) => {
    if(req.user){
        // console.log("-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-", req.user.StaffName);
        var formatted = JSON.stringify(req.user);
        console.log(req.user);
        res.render('login/logIn', {user: req.user, userString:formatted});
    }
    else{
        res.render('login/logIn', {user: req.user});
    }
})

router.post('/login',urlencodedParser, passport.authenticate('local.signin', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

router.post('/signup',async(req,res)=>{
    // console.log(req.body);
    var encryptedPass = await bcrypt.encryptPassword(req.body.StaffPassword)
    var Staff = {StaffName: req.body.StaffName, StaffPassword: encryptedPass, StaffAddress: req.body.StaffAddress, StaffSalary: req.body.StaffSalary, StaffPosition: req.body.StaffPosition, StaffInsuranceNo: req.body.StaffInsuranceNo, Supervises: req.body.Supervises, fk_RestaurantID: req.body.RestaurantID}
    // console.log(Staff);
    // console.log(encryptedPass);
    await dbConnection.query('INSERT INTO Staff SET ?', [Staff], (err)=>{
        if(err){
            console.log(err);
            console.log('Invalid sign up details try again');
            res.redirect('/director/managerList');
        }
        else{
            console.log('Staff added to the database')
            res.redirect('/director/managerList');
        }
    });
});

router.post('/delete', async(req,res)=>{
    // console.log(req.body);
    var StaffID = req.body.staffID;
    await dbConnection.query('DELETE FROM STAFF where StaffID =' +  StaffID, (err)=>{
        if(err) console.log(err);
        else console.log("Record StaffID", StaffID, "deleted from db");
        res.redirect('/director/managerList')
    })
})

router.post('/addDirection', async(req,res)=>{
    var Address = {StreetNo: req.body.StreetNo, StreetName: req.body.StreetName, postcode: req.body.postcode, city: req.body.city};
    // console.log(Address);
    await dbConnection.query('INSERT INTO Address SET ?', [Address], (err)=>{
        if(err){
            console.log(err);
            console.log('Invalid address details try again');
        }
        else{
            console.log('Address added to the database')
        }
        res.redirect('back');
    });
});

router.post('/deleteDirection', async(req,res)=>{
    // console.log(req.body);
    var AddressID = req.body.AddressID;
    await dbConnection.query('DELETE FROM Address where AddressID =' +  AddressID, (err)=>{
        if(err) console.log(err);
        else console.log("Record AddressID", AddressID, "deleted from db");
        res.redirect('back')
    });
});

module.exports = router;
