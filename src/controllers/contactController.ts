import { Request, Response, NextFunction } from "express";
import * as CustomError from "../errors";
import asyncWrapper from "../helpers/asyncWrapper";
import { StatusCodes } from "http-status-codes";
import { httpResponse } from "../helpers";
import Contact from "../configs/contact";
import { childRecursive, getSecondaryContacts, rootRecursive } from "../configs/queries";
import { LinkPrecedence, PrismaClient} from '@prisma/client';

export const prisma = new PrismaClient();

const findLinkedContact =  async (email: string, phoneNumber: string) => {
    try {
        const matchedContacts = await prisma.contact.findMany({
            where: { OR: [ { email: email }, { phonenumber: phoneNumber } ]}
        });

        if(matchedContacts.length == 0){
            console.log("length = 0");
            const newContact = {
                email: email,
                phonenumber: phoneNumber,
                linkprecedence: LinkPrecedence.PRIMARY
            };
            const newConCreated = await prisma.contact.create({data : newContact});
            console.log("Newly created contact : ", newConCreated);
            return {id : newConCreated.id, linkedid : newConCreated.linkedid};
        }
        else{
            let oldestMatchedContact: Contact | null = null;

            const matchedByEmailPrimary = await prisma.contact.findMany({
                where: { AND : [ { email: email }, { linkprecedence: LinkPrecedence.PRIMARY} ]}
            });
            const matchedByPhoneNumberPrimary = await prisma.contact.findMany({
                where: { AND : [ { phonenumber: phoneNumber }, { linkprecedence: LinkPrecedence.PRIMARY} ]}
            });
            const totalContacts = [...matchedByEmailPrimary, ...matchedByPhoneNumberPrimary];
            const newestContact = totalContacts.slice().sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime())[0];
            const oldestContact = totalContacts.slice().sort((a, b) => new Date(a.createdat).getTime() - new Date(b.createdat).getTime())[0];

            if( matchedByEmailPrimary.length >= 1 && matchedByPhoneNumberPrimary.length >= 1 ){
                console.log("both 1");
                const updateData = { data: {
                                        linkprecedence: LinkPrecedence.SECONDARY,
                                        linkedid: oldestContact.id
                                    },
                                        where: { id : newestContact.id}
                                    }

                const updateContact = await prisma.contact.update(updateData);
                console.log("Updated Contact :", updateContact);
                return { id: updateContact.id, linkedid: updateContact.linkedid };

            }else{
                oldestMatchedContact = await prisma.contact.findFirst({
                    where: { OR: [ { email: email }, { phonenumber: phoneNumber } ] },
                    orderBy: { createdat: 'asc'}
                });

                if(!oldestMatchedContact) throw new Error(" No Oldest Matched contact found in database");

                const newContact = {
                    email: email,
                    phonenumber: phoneNumber,
                    linkprecedence: LinkPrecedence.SECONDARY,
                    linkedid: oldestMatchedContact.id
                }
                const newConCreated = await prisma.contact.create({data : newContact});
                console.log("Newly created contact : ", newConCreated);
                return {id : newConCreated.id, linkedid: newConCreated.linkedid};
            }
        }
    }
    catch(error){
        throw  CustomError.InternalServerError("Problem occurred while finding contact");
    }
}


export const contactCreation = asyncWrapper(
    async(_req: Request, _res: Response, _next: NextFunction) => {
        try{
            let linkedid : number | null = null;
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
