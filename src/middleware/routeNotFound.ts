import { NotFoundError } from "../errors";

export const routeNotFound = () => {
    throw NotFoundError("Bad method or Route does not exist");
}