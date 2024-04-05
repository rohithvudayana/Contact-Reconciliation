import { StatusCodes } from "http-status-codes";
import { createCustomApiError } from "./customApiError";

function UnauthorizedError(message : string) {
    return new createCustomApiError( message, StatusCodes.UNAUTHORIZED)
}
export {UnauthorizedError};