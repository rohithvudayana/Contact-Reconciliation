import db from "../database/db";

interface Contact{
    phone_number?: string;
    email?: string;
    linked_id?: number | null;
    link_precedence: "secondary" | "primary";
    createdAt?: Date;
    updatedAt?: Date;
    deleted_at?: Date | null;
}
export default Contact;

async function createContact(data) {
    const res = await db("Contact").insert(data, "*");
    console.log(res);
    return res;
}

async function updateContact(data){
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