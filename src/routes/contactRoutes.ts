import express from "express";
import { contactCreation } from "../controllers/contactController";

export const contactRouter = express.Router();

contactRouter.route("/contact").post(contactCreation);