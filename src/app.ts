import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import { routeNotFound } from "./middleware/routeNotFound";
import { Request, Response } from "express";
import { httpResponse } from "./helpers/createResponse";
import { contactRouter } from "./routes/contactRoutes";
import { BASEURL } from "./constants";

dotenv.config();

const app = express(); // Using Express app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

try {
  app.listen(PORT, () => {
    console.log(`Server listening on : http://localhost:${PORT}/`); // Server Setup
  });
} catch (error) {
  console.error(error);
}

app.get("/", (_req: Request, _res: Response) => {
  _res.status(200).send(httpResponse(true, "OK", [])); // Ping Route
});

app.use(`${BASEURL}/`, contactRouter); // Routes

app.use(routeNotFound); // Middlewares
app.use(errorHandler);
