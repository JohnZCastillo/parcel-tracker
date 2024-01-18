import express, { Express, Request, Response } from "express";
import bodyParser from 'body-parser';
import mongoose from "mongoose";
import {Company} from './model/company';
import 'dotenv/config';
import path from "path";

const app: Express = express();

const port = 8000;

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.set('view engine','twig');

app.use('/static',express.static( path.join(__dirname,'/../public')));

app.get('/',(req: Request, res: Response)=>{
    res.render('index.twig',{});
})

app.post('/', async (req: Request, res: Response)=>{

    let company = new Company({
        name: '234'
    });

    await company.save();

    res.json({'message': 'hello world'})
})

mongoose.connect(process.env.MONGO_DB)
  .then(() => console.log('Connected!'));

  
app.listen(port,()=>{
    console.log('Server Started')
})