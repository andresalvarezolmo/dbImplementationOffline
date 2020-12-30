const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const db = require('../db/db');
const bcrypt = require('../lib/bcrypt')

console.log('Passport config loaded');
// db.query('SELECT * FROM credentials WHERE fk_StaffID = "1";',(err,result) =>{
//     if(err) console.log(err);
//     console.log(result);
// });

passport.use('local.signin', new Strategy({
    usernameField: 'username',
    passwordField: 'password'
    // passReqToCallBack: true // allows us to pass back the entire request to the callback
} , async(username, password, done) =>{
    // console.log('Entered here');
    const rows = await db.query('SELECT * FROM Staff WHERE StaffID = ?', [username]);
    // console.log("Rows",rows[0].StaffID);
    // console.log("Pass",password)
    if (rows.length > 0) {
        console.log('Username found in the database');
        const user = rows[0];
        validPassword = await bcrypt.comparePasswords(password, rows[0].StaffPassword);
        if(validPassword){
            console.log('Right password, welcome '+ user.StaffName) + "with ID: " + user.StaffID;
            done(null, user);
        }
        // if (rows[0].StaffPassword == password) {
        //     console.log('Right password, welcome '+ user.StaffName) + "with ID: " + user.StaffID;
        //     done(null, user);
        // }
        else{
            console.log('Incorrect pass');
            done(null, false);
        }
    }
    else{
        console.log('User not found');
        done(null, false);
    }
}));


passport.serializeUser((user, done) => {
    console.log("Serialize: ", user.StaffID);
    done(null, user.StaffID);
});

passport.deserializeUser(async(username, done) => {
    // console.log("Deserializing", username);
    const user = await db.query('SELECT * FROM StaffListView WHERE StaffID = ?', [username]);
    // console.log("This is the userID that has logged out:" + user[0].StaffID);
    done(null, user);
});