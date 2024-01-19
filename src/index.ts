import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose, { Model, Mongoose } from "mongoose";
import { Company } from "./model/company";
import { Parcel } from "./model/parcel";
import "dotenv/config";
import path from "path";
import session from "express-session";
import auth from './lib/middleware/auth';

const app: Express = express();

const port = 8000;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set("view engine", "twig");

app.use("/static", express.static(path.join(__dirname, "/../public")));

app.use(
  session({
    secret: "my-secret",
    resave: true, 
    saveUninitialized: false,
  })
);

app.get("/login", (req: Request, res: Response) => {

  console.log(req.session);

  res.render("pages/login.twig", {});
});

app.post("/login", (req: Request, res: Response) => {

  Company.findOne({"email": req.body.email, "password": req.body.password})
  .then(company => {
   
    req.session.loginId = company._id.toString();

    res.json('hello world')

  }).catch(err =>{
    res.redirect('/login');
  })

});

app.post("/track", (req: Request, res: Response) => {

  Parcel.findOne({"reference": req.body.reference})
  .then( (parcel)  => {
   
    parcel.history.push({
      location: 'hello',
      date: Date(),
    })

    parcel.save();

    res.redirect('/admin');

  }).catch(err =>{
    res.redirect('/login');
  })

});


app.get("/track", (req: Request, res: Response) => {

  Parcel.findOne({"reference": req.query.reference})
  .then( (parcel)  => {
   
    res.render('pages/track.twig', parcel);

  }).catch(err =>{
    res.redirect('/login');
  })

});


app.post("/item", (req: Request, res: Response) => {

  let parcel = new Parcel(req.body);

  parcel.save()
  .then(parcel => {

    res.json({message: "ok"});

  }).catch(err => {
    res.json({message: "not ok"});
  })

});


// app.use(auth);

app.get("/", (req: Request, res: Response) => {


  console.log(req.session);

  res.render("pages/track.twig", {});
});

app.get("/register", (req: Request, res: Response) => {

    console.log(req.session);
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

app.post("/login", (req: Request, res: Response) => {
  res.render("pages/track.twig", {});
});

app.get("/admin", (req: Request, res: Response) => {
  res.render("admin.twig", {});
});

app.post("/", async (req: Request, res: Response) => {
  // let company = new Company({
  //     name: '234'
  // });

  // await company.save();

  // res.json({'message': 'hello world'})

  res.redirect("/admin");
});

mongoose.connect(process.env.MONGO_DB).then(() => console.log("Connected!"));

app.listen(port, () => {
  console.log("Server Started");
});
