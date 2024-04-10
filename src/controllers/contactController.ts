import { Request, Response, NextFunction } from "express";
import * as CustomError from "../errors";
import asyncWrapper from "../helpers/asyncWrapper";
import { StatusCodes } from "http-status-codes";
import { httpResponse } from "../helpers";
import Contact, { createContact,  updateContact } from "../configs/contact";
import { LinkPrecedence, PrismaClient} from '@prisma/client';

export const prisma = new PrismaClient();

const findLinkedContact = async (email: string, phoneNumber: string) => {
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

            console.log(newConCreated.id);
            return newConCreated.id;
        }
        else if(matchedContacts.length == 1){
            console.log("length = 1");
            if(email && phoneNumber && (matchedContacts[0].email != email || matchedContacts[0].phonenumber != phoneNumber)){
                const newContact = {
                    email: email,
                    phonenumber: phoneNumber,
                    linkprecedence: LinkPrecedence.SECONDARY,
                    linkedid: matchedContacts[0].id
                }
                const newConCreated = await prisma.contact.create({data : newContact});
                console.log(newConCreated);
                console.log(newConCreated.id);
                return newConCreated.id;
            }
            return matchedContacts[0].id;
        }
        else{
            console.log("length > 1");
            let emailObj: Contact;
            let phoneObj: Contact;

            if(matchedContacts[0].email == email){
                emailObj = matchedContacts[0];
                phoneObj = matchedContacts[1];
            }
            else{
                emailObj = matchedContacts[1];
                phoneObj = matchedContacts[0];
            }
            (phoneObj).linkprecedence = "SECONDARY";
            (phoneObj).linkedid = (emailObj).id;
            if(email && phoneNumber){
                const UpdateCon = await updateContact(phoneObj as any);
                console.log(UpdateCon);
                console.log(UpdateCon.id);
                return UpdateCon.id;
            }
            else{
                return matchedContacts.slice(-1)[0].id;
            }
        }
    }catch(error){
        throw  CustomError.InternalServerError("Problem occurred while finding contact");
    }
}

interface RootRecursiveResult {
    id: number;
    email: string;
    phoneNumber: string;
    linkPrecedence: string;
    linkedId: number;
  }

  const rootRecursive = async (id: number): Promise<RootRecursiveResult[]> => {
    console.log("ROOT");
    const result = await prisma.$queryRaw<RootRecursiveResult[]>`
      with recursive findRoot as (
        select id, email,phonenumber,linkprecedence,linked_id
        from "Contact"
        where id = ${id}

        union all

        select c.id, c.email, c.phonenumber, c.linkprecedence, c.linked_id
        from "Contact" c
        join findRoot r on c.id = r.linked_id
      )
      select * from findRoot
      where linkPrecedence = 'PRIMARY';
    `;

    return result;
  }

interface ChildRecursiveResult {
    emails: string[];
    phoneNumbers: string[];
    primaryContactId: number | null;
    secondaryContactIds: (number | null)[];
  }

  const childRecursive = async (id: number): Promise<ChildRecursiveResult> => {
    console.log("CHILD");
        const result = await prisma.$queryRaw<ChildRecursiveResult[]>`
        WITH RECURSIVE ChildHierarchy AS (
        SELECT id, email, phonenumber, linked_id, linkprecedence
        FROM "Contact"
        WHERE id = ${id}

        UNION ALL

        SELECT c.id, c.email, c.phonenumber, c.linked_id, c.linkprecedence
        FROM "Contact" c
        INNER JOIN ChildHierarchy ch ON c.linked_id = ch.id
        )
        SELECT
        array_remove(array_agg(DISTINCT email), null) AS emails,
        array_remove(array_agg(DISTINCT phonenumber), null) AS phoneNumbers,
        MAX(CASE WHEN linkprecedence = 'PRIMARY' THEN id END) AS primaryContactId,
        array_remove(array_agg(CASE WHEN linkprecedence = 'SECONDARY' THEN id END), null) AS secondaryContactIds
        FROM ChildHierarchy;
    `;

    return result[0];
  };



export const contactCreation = asyncWrapper(
    async(_req: Request, _res: Response, _next: NextFunction) => {
        try{
            const {email, phoneNumber} = _req.body;
            if(!email || !phoneNumber){
                throw _next(CustomError.BadRequestError("Enter email and phoneNumber both"));
            }
            const contactId = await findLinkedContact(email, phoneNumber);
            // console.log(contactId);
            const root = await rootRecursive(contactId);
            // console.log(root);
            const rootId = root[0].id;
            // console.log(rootId);
            const contact = await childRecursive(rootId);
            console.log({contact});

            _res.status(StatusCodes.OK).json(httpResponse(true, "Identified Contacts", {contact}));
        }
        catch(error){
            console.log("Error", error);
            throw _next(CustomError.InternalServerError("Internal server error"));
        }
    }
)
