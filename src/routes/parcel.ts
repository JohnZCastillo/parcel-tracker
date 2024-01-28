import { Router, Request, Response } from "express";
import { Parcel } from "../model/parcel";
const router = new Router();

router
  .route("")
  .get( async (req: Request, res: Response) => {

    try{
        let parcel = await Parcel.findOne({ reference: req.query.reference })
        res.render("pages/track.twig", parcel);
    }catch(err){
        res.redirect("/login");
    }
  })
  .post((req: Request, res: Response) => {
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