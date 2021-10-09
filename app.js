const path = require("path");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const errorController = require("./controllers/error");
const User = require("./models/user");
const PORT = process.env.PORT || 5000

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const corsOptions = {
   origin: "https://<whispering-springs-18429>.herokuapp.com/",
   optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));git remote

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
   User.findById("6160e5300f68fe6550018485")
      .then((user) => {
         req.user = user;
         next();
      })
      .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
   .connect(
      "mongodb+srv://admin:adminpass1@cluster0.bz7dt.mongodb.net/myFirstDatabase?retryWrites=true",
      { useNewUrlParser: true, useUnifiedTopology: true }
   )
   .then((result) => {
      User.findOne().then((user) => {
         if (!user) {
            const user = new User({
               name: "Braden",
               email: "braden@test.com",
               cart: {
                  items: [],
               },
            });
            user.save();
         }
      });
      app.listen(PORT);
   })
   .catch((err) => {
      console.log(err);
   });
