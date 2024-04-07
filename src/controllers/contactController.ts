import { Request, Response, NextFunction } from "express";
import * as CustomError from "../errors";
import asyncWrapper from "../helpers/asyncWrapper";
import { StatusCodes } from "http-status-codes";
import { httpResponse } from "../helpers";
import Contact, { createContact, updateContact } from "../configs/contact";
import db from "../database/db";


const findLinkedContact = async (email: string, phoneNumber: number) => {
    try {
        let matchedContacts = await db("Contact").select("*")
                                                .where("email", email)
                                                .orWhere("phone_number", phoneNumber);
        if(matchedContacts.length == 0){
            console.log("length = 0");
            const newContact = {
                email: email,
                phone_number: phoneNumber,
                link_precedence: "primary"
            }
            const newConCreated = await createContact(newContact);
            console.log((newConCreated[0]).id);
            return (newConCreated[0]).id;
        }
        else if(matchedContacts.length == 1){
            console.log("length = 1");
            if(email && phoneNumber && (matchedContacts[0].email != email || matchedContacts[0].phone_number != phoneNumber)){
                const newContact = {
                    email: email,
                    phone_number: phoneNumber,
                    link_precedence: "secondary",
                    linked_id: matchedContacts[0].id
                }
                const newConCreated = await createContact(newContact);
                return (newConCreated[0]).id;
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
            (phoneObj).link_precedence = "secondary";
            (phoneObj).linked_id = (emailObj).id;
            if(email && phoneNumber){
                const UpdateCon = await updateContact(phoneObj as any);
                return (UpdateCon[0]).id;
            }else{
                return matchedContacts.slice(-1)[0].id;
            }
        }
    }catch(error){
        throw  CustomError.InternalServerError("Problem occurred while finding contact");
    }
}


const root_recursive = async (id : number) => {
    const query = `with recursive findRoot as
                   (select id, email, phone_number, link_precedence, linked_id
                    from "Contact"
                    where id = ?

                    union all

                    select c.id, c.email, c.phone_number, c.link_precedence, c.linked_id
                    from "Contact" c
                    join findRoot r on c.id = r.linked_id
                   )
                   select * from findRoot
                   where link_precedence = 'primary';
                   `;
    const db_query = await db.raw(query, [id]);
    return db_query.rows[0].id;
}

const child_recursive = async (id : number) => {
    const query = `with recursive findChild as
                   (select id, email, phone_number, linked_id, linked_precedence
                    from "Contact"
                    where id = ?

                    union all

                    select c.id, c.email, c.phone_number, c.linked_id, c.link_precedence
                    from "Contact" c
                    inner join findChild fc on c.linked_id = fc.id;
                   )
                   select
                        array_remove(array_agg(distinct email), null) as emails,
                        array_remove(array_agg(distinct phone_number), null) as phoneNumbers,
                        max(case when link_precedence = "primary" then id end) as primaryContactID,
                        array_remove(array_agg(case when link_precedence = "secondary" then id end), null) as secondaryContactIDs
                    from findChild;;
                   `;
    const db_query = db.raw(query, [id]);
    const res = await db_query;
    return res.rows[0];
}

export const contactCreation = asyncWrapper(
    async(_req: Request, _res: Response, _next: NextFunction) => {
        try{
            const {email, phoneNumber} = _req.body;
            if(!email || !phoneNumber){
                throw _next(CustomError.BadRequestError("Enter email and phoneNumber both"));
            }

            const contactId = await findLinkedContact(email, phoneNumber);
            const rootId = await root_recursive(contactId);
            const contact = await child_recursive(rootId);

            _res.status(StatusCodes.OK).json(httpResponse(true, "Identified Contacts", {contact}));
        }
        catch(error){
            console.log("Error", error);
            throw _next(CustomError.InternalServerError("Internal server error"));
        }
    }
)