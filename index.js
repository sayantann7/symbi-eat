const express = require('express');
const path = require('path');
const app = express();
const passport = require('passport');
const userModel = require('./models/users');
const localStrategy = require('passport-local');
const session = require('session');
const expressSession = require('express-session');
passport.use(new localStrategy(userModel.authenticate()));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.use(expressSession({
    secret: 'ihqwdhioqhf',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.post("/register",(req,res)=>{
    let userData = new userModel({
        fullName: req.body.fullName,
        username: req.body.prn,
        email: req.body.email,
        secret: req.body.secret
    });

    userModel.register(userData,req.body.password)
        .then(function (registeredUser){
            passport.authenticate("local")(req,res,()=>{
                res.redirect('/home');
            })
        })
});

app.post('/login', passport.authenticate("local",{
    successRedirect: '/home',
    failureRedirect: '/'
}),function(req,res){});

app.get('/',(req,res)=>{
    res.render("login");
});

app.get('/signup',(req,res)=>{
    res.render("signup");
});

app.get('/home', isLoggedIn, (req,res)=>{
    res.render("home");
});

app.get('/profile', isLoggedIn, (req,res)=>{
    res.render("profile");
});

app.get('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if (err) {return next(err);}
        res.redirect('/');
    });
});

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/');
    }
}

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});