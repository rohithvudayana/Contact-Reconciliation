import { LinkPrecedence, PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
interface Contact{
    id:number | null;
    phonenumber: string | null;
    email: string | null;
    linkedid: number | null;
    linkprecedence: "SECONDARY" | "PRIMARY" | null;
    createdat?: Date;
    updatedat?: Date;
    deleted_at?: Date | null;
}
export default Contact;

interface data{
    email?: string,
    phonenumber?: number,
    linkprecedence?: string,
    linked_id?: number,
    id?: number
}


async function createContact(data : any) {
    const res = await prisma.contact.create({data});
    console.log(res);
    return res;
}

async function updateContact(data: any) {
    const contact = await prisma.contact.update({
      where: { id: data.id },
      data: {
        linkedid: data.linked_id,
        linkprecedence: LinkPrecedence.SECONDARY,
        updatedat: new Date(),
      },
    });
    return contact;
  }

export { createContact, updateContact };