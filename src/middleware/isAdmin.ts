import { NextFunction, Request, Response } from "express";
import * as CustomError from "../errors";
export const adminMiddleware = async(_req: Request, _res: Response, _next: NextFunction) => {
    if((<any>_req).user && (<any>_req).user.isAdmin === true){
        return _next();
    }else{
        _next(CustomError.ForbiddenError("Unauthorized access"));
    }
}