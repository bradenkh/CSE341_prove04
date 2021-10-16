const path = require("path");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const errorController = require("./controllers/error");
const User = require("./models/user");

//used for prove 05
const csrf = require("csurf");
const flash = require("connect-flash");
const session = require('express-session');
const MongoDBStore = require("connect-mongodb-session")(session);

const PORT = process.env.PORT || 5000;

const MONGODB_URI =
   "mongodb+srv://admin:adminpass1@cluster0.bz7dt.mongodb.net/myFirstDatabase?retryWrites=true";

const app = express();

const store = new MongoDBStore({
   uri: MONGODB_URI,
   collection: 'sessions'
 });
 const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const corsOptions = {
   origin: "https://<whispering-springs-18429>.herokuapp.com/",
   optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
   session({
      secret: "my secret",
      resave: false,
      saveUninitialized: false,
      store: store,
   })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
   if (!req.session.user) {
      return next();
   }
   User.findById(req.session.user._id)
      .then((user) => {
         req.user = user;
         next();
      })
      .catch((err) => console.log(err));
});

app.use((req, res, next) => {
   res.locals.isAuthenticated = req.session.isLoggedIn;
   res.locals.csrfToken = req.csrfToken();
   next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });
