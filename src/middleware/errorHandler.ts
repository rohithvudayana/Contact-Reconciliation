import { NextFunction, Request, Response } from "express";
import { httpResponse } from "../helpers/createResponse";
import { createCustomApiError } from "../errors/customApiError";

export const errorHandler = (
  err: createCustomApiError,
  _req: Request,
  _res: Response,
  _next: NextFunction 
) => {
  console.error(`Error ${err.statusCode}: ${err.message}`);
  return _res.status(err.statusCode).json(httpResponse(false, err.message, {}));
};