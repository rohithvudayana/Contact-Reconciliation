import { NextFunction, Request, Response } from "express";
import { jwtUtils } from "../helpers";
import * as CustomError from "../errors";

export const authenticateToken = async (_req: Request, _res: Response, _next: NextFunction) => {
        const authHeader = _req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if(token == null){
            return _next(CustomError.ForbiddenError("No token Provided"));
        }
        try{
            const decode = jwtUtils.verifyToken(token);
            (<any>_req).user = decode;
            (<any>_req).access_token = token;
            _next();
        }catch(err: any){
            _next(CustomError.UnauthorizedError(err.message));
        }
    }