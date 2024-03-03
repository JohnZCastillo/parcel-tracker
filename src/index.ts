import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose, { Model, Mongoose, Query } from "mongoose";
import { Company } from "./model/company";
import Parcel from "./model/parcel";
import "dotenv/config";
import path from "path";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import auth from "./lib/middleware/auth";
import flashMessage from "connect-flash";

const app: Express = express();

const port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flashMessage());

passport.use(
  new LocalStrategy(
    { passReqToCallback: true },
    (req, username, password, done) => {
      Company.findOne({ email: username, password: password })
        .then((company) => {
          return done(null, company);
        })
        .catch((err) => {
          return done(err, false);
        });
    }
  )
);

passport.serializeUser(function (user, done) {
  return done(null, user);
});

passport.deserializeUser(function (id, done) {
  Company.findById(id._id.toString())
    .then((company) => {
      return done(null, company);
    })
    .catch((err) => {
      return done(err);
    });
});

app.set("view engine", "twig");

app.use("/static", express.static(path.join(__dirname, "/../public")));

app.use(
  session({
    secret: "my-secret",
    rolling: true,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 60 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req: Request, res: Response) => {
  res.render("pages/login.twig", { error: req.flash("error") });
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/admin",
    failureFlash: "Invalid username or password.",
  })
);

app.get("/register", (req: Request, res: Response) => {
  res.render("pages/register.twig", {'error':  req.flash('error')});
});

app.post("/register", (req: Request, res: Response) => {
  let company = new Company(req.body);

  company
    .save()
    .then((company) => {
      res.redirect("/login");
    })
    .catch((err) => {
      req.flash("error", 'Username Already Taken');
      res.redirect("/register");
    });
});

app.get("/", (req: Request, res: Response) => {
  res.render("pages/track.twig", {});
});

app.get("/track", async (req: Request, res: Response) => {
  try {
    if (!req.query.reference) {
      return res.render("pages/track.twig", {});
    }

    let parcel = await Parcel.findOne({ reference: req.query.reference });

    if (!parcel) {
      throw new Error("Parcel not found");
    }

    res.render("pages/track.twig", parcel);
  } catch (error) {
    res.render("pages/track.twig", { error: "Parcel Not Found" });
  }
});

app.post("/track", (req: Request, res: Response) => {
  Parcel.findOne({ reference: req.body.reference })
    .then((parcel) => {
      parcel.history.push({
        location: req.session.passport.user.name,
        date: new Date(),
      });

      parcel.updatedAt = new Date();

      parcel.save();

      res.redirect("/admin");
    })
    .catch((err) => {
      let parcel = new Parcel(req.body);

      parcel.history.push({
        location: req.session.passport.user.name,
        date: new Date(),
      });

      parcel.updatedAt = new Date();

      parcel
        .save()
        .then((parcel) => {
          res.redirect("/admin");
        })
        .catch((err) => {
          res.redirect("/admin");
        });
    });
});

app.use(auth);

app.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

app.get("/admin", async (req: Request, res: Response) => {
  let parcels = [];

  try {
    parcels = await Parcel.find().sort({ updatedAt: -1 }).limit(10);
  } catch {
    // add error here
  }

  res.render("admin.twig", { parcels: parcels,});
});

mongoose.connect(process.env.MONGO_DB).then(() => console.log("Connected!"));

app.listen(port, () => {
  console.log("Server Started");
});
