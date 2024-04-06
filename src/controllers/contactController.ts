import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import * as CustomError from "../errors";
import asyncWrapper from "../helpers/asyncWrapper";
import { StatusCodes } from "http-status-codes";
import { httpResponse } from "../helpers";
import { createContact, updateContact } from "../configs/contact";
import db from "../database/db";

const findLinkedContact = async (email: string, phoneNumber: number) => {
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
        console.log((newConCreated[0] as any).id);
        return (newConCreated[0] as any).id;
    }
    else if(matchedContacts.length == 1){
        console.log("length > 1");
        if(email && phoneNumber && (matchedContacts[0].email != email || matchedContacts[0].phone_number != phoneNumber)){
            const newContact = {
                email: email,
                phone_number: phoneNumber,
                link_precedence: "secondary",
                linked_id: matchedContacts[0].id
            }
            const newConCreated = await createContact(newContact);
            return (newConCreated[0] as any).id;
        }
        return matchedContacts[0].id;
    }
    else{
        console.log("length > 1");
        let emailObj = {};
        let phoneObj = {};

        if(matchedContacts[0].email == email){
            emailObj = matchedContacts[0];
            phoneObj = matchedContacts[1];
        }
        else{
            emailObj = matchedContacts[1];
            phoneObj = matchedContacts[0];
        }
        (phoneObj as any).link_precedence = "secondary";
        (phoneObj as any).linked_id = (emailObj as any).id;
        
    }
}
