const express = require('express');
const path = require('path');
const app = express();
const passport = require('passport');
const userModel = require('./models/users');
const inventoryModel = require('./models/inventory');
const reservationModel = require('./models/reservations');
const orderModel = require('./models/orders');
const localStrategy = require('passport-local');
const session = require('session');
const expressSession = require('express-session');
const { name } = require('ejs');
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

app.get('/home', isLoggedIn, async (req,res)=>{
    const inventory = await inventoryModel.findOne({
        _id:'676aaaf304cb940ba556cee3'
    });
    const foodData = inventory.foodItems;
    const user = await userModel.findOne({
        username: req.session.passport.user,
    });
    let name = '';
    for (let i = 0; i < user.fullName.length; i++){
        if (user.fullName[i] == ' '){
            break;
        }
        name += user.fullName[i];
    }
    res.render("home",{user:user,name:name,foodData:foodData});
});

app.get('/api/food', async (req, res) => {
    const inventory = await inventoryModel.findOne({
        _id:'676aaaf304cb940ba556cee3'
    });
    const foodData = inventory.foodItems;
    res.json(foodData);
});

app.get('/api/reservations', async (req, res) => {
    const currentUser = await userModel.findOne({
        username: req.session.passport.user,
    });
    await currentUser.populate('reservations');
    const reservationData = currentUser.reservations;
    res.json(reservationData);
});

app.post("/order",async (req,res)=>{
    const user = await userModel.findOne({
        username: req.session.passport.user,
    });
    let reservationData = new reservationModel({
        user: user._id,
        name: req.body.food,
        price: req.body.price,
        quantity: req.body.quantity,
        duration: req.body.duration,
    });
    await reservationData.save();
    await reservationData.populate('user');
    user.reservations.push(reservationData._id);
    await user.save();
    res.redirect('/profile');
});

app.get('/profile', isLoggedIn, async (req,res)=>{
    const user = await userModel.findOne({
        username: req.session.passport.user,
    });
    await user.populate('reservations');
    res.render("profile",{user});
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