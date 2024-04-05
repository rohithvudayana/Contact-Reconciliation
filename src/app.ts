import express from "express";
import dotenv from "dotenv"
import { Request, Response } from "express";
import { error } from "console";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8999;
try{
    // if(!process.env.DB_URL)
    // throw new Error("No DB_URL found in .env file");

    app.listen(PORT, () => {
        console.log(`Server listening on : http://localhost:${PORT}/`);
    })
}catch(error){
    console.error(error);
}

app.use(express.json());