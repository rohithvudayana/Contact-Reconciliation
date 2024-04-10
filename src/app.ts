import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import { routeNotFound } from "./middleware/routeNotFound";
import { Request, Response } from "express";
import { httpResponse } from "./helpers/createResponse";
import { contactRouter } from "./routes/contactRoutes";
import { BASEURL } from "./constants";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient(); // Create Prisma Client instance

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

app.post("/", async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const insertedContact = await prisma.contact.create({ data });
    res.status(StatusCodes.CREATED).send(httpResponse(true, "Data inserted successfully", insertedContact));
  } catch (error) {
    console.error("Error inserting data into database:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(httpResponse(false, "Failed to insert data", []));
  }
});

app.use(`${BASEURL}/contact`, contactRouter); // Routes

app.use(routeNotFound); // Middlewares
app.use(errorHandler);
