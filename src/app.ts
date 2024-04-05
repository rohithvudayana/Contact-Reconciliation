import express from "express";
import dotenv from "dotenv";
import {errorHandler} from "./middleware/errorHandler";
import { routeNotFound } from "./middleware/routeNotFound";
import { Request, Response } from "express";
import { httpResponse } from "./helpers/createResponse";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (_req: Request, _res: Response) => {
    _res.status(200).send(httpResponse(true, "OK", []));
})

const PORT = process.env.PORT || 8999;
try{
    app.listen(PORT, () => {
        console.log(`Server listening on : http://localhost:${PORT}/`);
    })
}catch(error){
    console.error(error);
}

app.use(routeNotFound);
app.use(errorHandler);