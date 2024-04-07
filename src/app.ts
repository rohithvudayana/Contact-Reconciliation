import express from "express";
import dotenv from "dotenv";
import {errorHandler} from "./middleware/errorHandler";
import { routeNotFound } from "./middleware/routeNotFound";
import { Request, Response } from "express";
import { httpResponse } from "./helpers/createResponse";
import { contactRouter } from "./routes/contactRoutes";
import { BASEURL } from "./constants";
import db from "./database/db";
import { StatusCodes } from "http-status-codes";

dotenv.config();
const app = express();  // Using Express app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8999;
try{
    app.listen(PORT, () => {
        console.log(`Server listening on : http://localhost:${PORT}/`);   // Server Setup
    })
}catch(error){
    console.error(error);
}

app.get("/", (_req: Request, _res: Response) => {
    _res.status(200).send(httpResponse(true, "OK", []));  // Ping Route
})

app.post("/", async(_req: Request, _res: Response) => {
    try{
        const {data} = _req.body;
        await db("Contact").insert(data);
    }catch(error){
        console.error("Error pushing data to the database:", error);
        _res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(httpResponse(false, "Failed to push data", []));
    }
})


app.use(`${BASEURL}/contact`, contactRouter);  // Routes

app.use(routeNotFound); // Middlewares
app.use(errorHandler);