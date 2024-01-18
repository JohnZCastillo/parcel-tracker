import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { Company } from "./model/company";
import "dotenv/config";
import path from "path";
import session from "express-session";

const app: Express = express();

const port = 8000;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set("view engine", "twig");

app.use("/static", express.static(path.join(__dirname, "/../public")));

app.use(
  session({
    secret: "my-secret",
    resave: false, 
    saveUninitialized: false,
  })
);

app.get("/", (req: Request, res: Response) => {

    req.session.test = 'hello';

  res.render("pages/track.twig", {});
});

app.get("/register", (req: Request, res: Response) => {

    console.log(req.session);
    res.render("pages/register.twig", {});
});

app.get("/login", (req: Request, res: Response) => {
  res.render("pages/login.twig", {});
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
