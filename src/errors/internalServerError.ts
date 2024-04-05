import { createCustomApiError } from "./customApiError";
import { StatusCodes } from "http-status-codes";

function InternalServerError(message: string) {
  return  new createCustomApiError(message, StatusCodes.INTERNAL_SERVER_ERROR);
}

export { InternalServerError };
