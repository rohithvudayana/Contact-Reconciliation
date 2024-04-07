import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import * as CustomError from "../errors/";

type Callback = (
  _req: Request,
  _res: Response,
  _next: NextFunction
) => Promise<void>;

const asyncWrapper = (callback: Callback): Callback =>
    async (_req: Request, _res: Response, _next: NextFunction): Promise<void> => {
        try {
            await callback(_req, _res, _next);
        } catch (error: any) {
            console.error(error?.message || "Unknown error occurred");
            if (error instanceof mongoose.Error.CastError) {
                _next(CustomError.BadRequestError("Invalid user id"));
            }
            _next(CustomError.InternalServerError(`Something went wrong ${error?.message || ''}`));
        }
    };

export default asyncWrapper;
