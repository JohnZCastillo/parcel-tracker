import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose, { Model, Mongoose } from "mongoose";
import { Company } from "./model/company";
import { Parcel } from "./model/parcel";
import "dotenv/config";
import path from "path";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import auth from "./lib/middleware/auth";
const app: Express = express();

const port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

passport.use(
  new LocalStrategy((username, password, done) => {
    Company.findOne({ email: username, password: password })
      .then((company) => {
        return done(null, company);
      })
      .catch((err) => {
        return done(err, false);
      });
  })
);

passport.serializeUser(function (user, done) {
  return done(null, user._id.toString());
});

passport.deserializeUser(function (id, done) {
  Company.findById(id)
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
    cookie: { maxAge: (60000 * 60) },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req: Request, res: Response) => {
  res.render("pages/login.twig", {});
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/",
  })
);

app.get("/register", (req: Request, res: Response) => {
  res.render("pages/register.twig", {});
});

app.post("/register", (req: Request, res: Response) => {

  let company = new Company(req.body);

  company
    .save()
    .then((compnay) => {
      res.redirect("/admin");
    })
    .catch((err) => {
      console.log(err.message);

      res.redirect("/admin");
    });
});

app.get("/", (req: Request, res: Response) => {
  res.render("pages/track.twig", {});
});

app.get("/track", (req: Request, res: Response) => {
  Parcel.findOne({ reference: req.query.reference })
    .then((parcel) => {
      res.render("pages/track.twig", parcel);
    })
    .catch((err) => {
      res.redirect("/login");
    });
});

app.use(auth);

app.post("/track", (req: Request, res: Response) => {
  Parcel.findOne({ reference: req.body.reference })
    .then((parcel) => {
      parcel.history.push({
        location: "hello",
        date: Date(),
      });

      parcel.save();

      res.redirect("/admin");
    })
    .catch((err) => {
      res.redirect("/login");
    });
});

app.post("/item", (req: Request, res: Response) => {
  
  let parcel = new Parcel(req.body);

  parcel.history.push({
    location: req.session.loginCompany,
    date: Date(),
  });

  parcel
    .save()
    .then((parcel) => {
      res.json({ message: "ok" });
    })
    .catch((err) => {
      res.json({ message: "not ok" });
    });
});


app.get("/admin", (req: Request, res: Response) => {
  res.render("admin.twig", {});
});

mongoose.connect(process.env.MONGO_DB).then(() => console.log("Connected!"));

app.listen(port, () => {
  console.log("Server Started");
});