import { createCustomApiError } from "./customApiError";
import { StatusCodes } from "http-status-codes";

function NotFoundError(message : string){
    return new createCustomApiError(message, StatusCodes.NOT_FOUND);
}

export {NotFoundError};