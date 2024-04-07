import db from "../database/db";

interface Contact{
    id?:number;
    phone_number?: string;
    email?: string;
    linked_id?: number | null;
    link_precedence: "secondary" | "primary";
    createdAt?: Date;
    updatedAt?: Date;
    deleted_at?: Date | null;
}
export default Contact;

interface data{
    email?: string,
    phoneNumber?: number,
    link_precedence?: string,
    linked_id?: number,
    id?: number
}


async function createContact(data : data) {
    const res = await db("Contact").insert(data, "*");
    console.log(res);
    return res;
}

async function updateContact(data : data) {
    const query = db("Contact")
        .where("id", data.id)
        .update({
            linked_id: data.linked_id,
            link_precedence: data.link_precedence,
            updated_at: new Date(),
        })
        .returning("*");
    return query;
}

export { createContact, updateContact };