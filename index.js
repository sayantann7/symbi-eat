const express = require("express");
const path = require("path");
const app = express();
const passport = require("passport");
const userModel = require("./models/users");
const inventoryModel = require("./models/inventory");
const reservationModel = require("./models/reservations");
const orderModel = require("./models/orders");
const localStrategy = require("passport-local");
const session = require("session");
const expressSession = require("express-session");
passport.use(new localStrategy(userModel.authenticate()));
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const multer = require("multer");
require("dotenv").config();
const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

app.use(
  expressSession({
    secret: "ihqwdhioqhf",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/image/:filename", async (req, res) => {
  try {
    const inventory = await inventoryModel.findOne({});
    const foodItem = inventory.foodItems.find((item) =>
      item.image.includes(req.params.filename)
    );
    if (!foodItem) {
      return res.status(404).json({ err: "No file exists" });
    }

    const base64Data = foodItem.image.split(",")[1];
    const imgBuffer = Buffer.from(base64Data, "base64");
    res.writeHead(200, {
      "Content-Type": "image/jpeg",
      "Content-Length": imgBuffer.length,
    });
    res.end(imgBuffer);
  } catch (err) {
    console.error("Error retrieving image:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/register", (req, res) => {
  let userData = new userModel({
    fullName: req.body.fullName,
    username: req.body.prn,
    phoneNumber: `+91${req.body.phone}`,
    email: req.body.email,
    secret: req.body.secret,
  });

  userModel
    .register(userData, req.body.password)
    .then(function (registeredUser) {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/home");
      });
    });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true,
  }),
  function (req, res) {}
);

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/home", isLoggedIn, async (req, res) => {
  const inventory = await inventoryModel.findOne({});
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  let name = "";
  for (let i = 0; i < user.fullName.length; i++) {
    if (user.fullName[i] == " ") {
      break;
    }
    name += user.fullName[i];
  }
  res.render("home", {
    user: user,
    name: name,
    foodData: inventory != null ? inventory.foodItems : null,
  });
});

app.get("/api/food", async (req, res) => {
  const inventory = await inventoryModel.findOne({});
  const foodData = inventory.foodItems;
  res.json(foodData);
});

app.get("/api/reservations", async (req, res) => {
  const currentUser = await userModel.findOne({
    username: req.session.passport.user,
  });
  await currentUser.populate("reservations");
  const reservationData = currentUser.reservations;
  res.json(reservationData);
});

app.post("/order", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    const inventory = await inventoryModel.findOne({});
    const foodName = req.body.food.trim();
    const foodItem = inventory.foodItems.find((item) => item.name === foodName);

    if (!foodItem) {
      return res.status(404).send("Food item not found");
    }

    if (foodItem.quantity < req.body.quantity) {
      return res.status(400).send("Insufficient quantity available");
    }

    let reservationData = new reservationModel({
      user: user._id,
      name: req.body.food.trim(),
      price: req.body.price,
      quantity: req.body.quantity,
      duration: req.body.duration,
      foodID: foodItem.foodID,
      image: foodItem.image,
    });

    await reservationData.save();
    await reservationData.populate("user");

    user.reservations.push(reservationData._id);
    await user.save();

    // Update inventory
    foodItem.quantity -= req.body.quantity;
    await inventory.save();

    res.redirect("/profile");
  } catch (error) {
    console.error("Error confirming reservation:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/confirm-reservation", isLoggedIn, async (req, res) => {
  try {
    const { itemId } = req.body;
    const reservation = await reservationModel
      .findById(itemId)
      .populate("user");

    if (!reservation) {
      return res.status(404).send("Reservation not found");
    }

    const orderData = new orderModel({
      user: reservation.user._id,
      foodID: reservation.foodID,
      name: reservation.name,
      quantity: reservation.quantity,
      price: reservation.price,
      image: reservation.image,
    });

    await orderData.save();

    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    user.orders.push(orderData._id);
    await user.save();

    await reservationModel.findByIdAndDelete(itemId);

    res.status(200).send("Order confirmed");
  } catch (error) {
    console.error("Error confirming reservation:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/cancel-reservation", isLoggedIn, async (req, res) => {
  try {
    const itemId = req.body.itemId;
    const reservation = await reservationModel.findById(itemId);
    if (!reservation) {
      console.log(`Reservation not found for itemId: ${itemId}`); // Debugging line
      return res.status(404).send("Reservation not found");
    }

    const inventory = await inventoryModel.findOne({});
    const foodItem = inventory.foodItems.find(
      (item) => item.foodID === reservation.foodID
    );

    if (foodItem) {
      foodItem.quantity += reservation.quantity;
      await inventory.save();
    }

    await reservationModel.findByIdAndDelete(itemId);

    res.status(200).send("Reservation canceled");
  } catch (error) {
    console.error("Error canceling reservation:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/notify/:itemID", isLoggedIn, async (req, res) => {
  try {
    const { itemID } = req.params;
    const inventory = await inventoryModel.findOne({});
    const foodItem = inventory.foodItems[itemID];

    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    if (!foodItem) {
      return res.status(404).send("Food item not found");
    }

    // Send SMS notification
    client.messages.create({
      body: `We received a request to notify you about the avaliability of ${foodItem.name}. We'll send a sms soon when it's available.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phoneNumber
    }).then(message => {
      console.log(`Message sent: ${message.sid}`);
      res.status(200).send("Notification sent");
    }).catch(error => {
      console.error("Error sending SMS:", error);
      res.status(500).send("Internal Server Error");
    });

  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/profile", isLoggedIn, async (req, res) => {
  const now = Date.now();

  const user = await userModel.findOne({
    username: req.session.passport.user,
  });

  if (!user) {
    return res.status(404).send("User not found");
  }

  const reservations = await reservationModel.find({
    user: user._id,
  });

  for (const item of reservations) {
    const itemDate = new Date(item.date);
    const endTime = new Date(itemDate.getTime() + item.duration * 60 * 1000);
    const timeLeft = endTime - now;
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    if (minutes < 0 && seconds < 0) {
      try {
        const result = await reservationModel.findByIdAndDelete(item._id);
        if (result) {
          console.log("Reservation deleted:", result);
        } else {
          console.log("No reservation found with the given id");
        }
      } catch (error) {
        console.error("Error deleting reservation:", error);
      }
    }
  }

  await user.populate("reservations");
  await user.populate({
    path: "orders",
    options: { sort: { date: -1 } },
  });
  res.render("profile", { user: user, formatDate: formatDate });
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
