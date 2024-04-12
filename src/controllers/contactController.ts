import { Request, Response, NextFunction } from "express";
import * as CustomError from "../errors";
import asyncWrapper from "../helpers/asyncWrapper";
import { StatusCodes } from "http-status-codes";
import { httpResponse } from "../helpers";
import { childRecursive, getSecondaryContacts, rootRecursive } from "../configs/queries";
import { PrismaClient } from '@prisma/client';
import { findLinkedContact } from "../configs/queries";

export const prisma = new PrismaClient();

export const contactCreation = asyncWrapper(
    async(_req: Request, _res: Response, _next: NextFunction) => {
        try{
            const {email, phoneNumber} = _req.body;
            if(!email || !phoneNumber){
                throw _next(CustomError.BadRequestError("Enter email and phoneNumber both"));
            }
            const alreadyExist = await prisma.contact.findMany({ where : {AND : [{email: email}, {phonenumber: phoneNumber}] }});
            if(alreadyExist.length > 0) throw _next(CustomError.BadRequestError(" This contact already exist in the database "));

            const contactId = await findLinkedContact(email, phoneNumber);
            if(contactId == undefined){
                return _next(CustomError.BadRequestError("contactId id Undefined"));
            }

            const secondaryCons = await getSecondaryContacts(contactId.linkedid ?? 0);
            const root = await rootRecursive();
            const ids: string[] = root.flatMap(result => result.ids);
            const contact = await childRecursive(ids);

            _res.status(StatusCodes.OK).json(httpResponse(true, "Identified Contacts", {contact, secondaryCons}));
        }
        catch(error){
            throw _next(CustomError.InternalServerError("Internal server error"));
        }
    }
)
