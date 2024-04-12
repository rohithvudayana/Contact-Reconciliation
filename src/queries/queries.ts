import { LinkPrecedence, PrismaClient } from '@prisma/client';
import * as CustomError from "../errors"
export const prisma = new PrismaClient();


export const findLinkedContact =  async (email: string, phoneNumber: string) => {
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
              const oldestMatchedContact = await prisma.contact.findFirst({
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


interface RootRecursiveResult {
  ids: string[];
}

export const rootRecursive = async (): Promise<RootRecursiveResult[]> => {
  const result = await prisma.$queryRaw<RootRecursiveResult[]>`
    SELECT c.id, c.email, c.phonenumber, c.linked_id, c.linkprecedence
    FROM "Contact" c
    JOIN "Contact" root ON c.id = root.id
    WHERE root.linkprecedence = 'PRIMARY' AND c.linkprecedence = 'PRIMARY';
  `;

  console.table(result);

  const transformResult = (result: any[]): RootRecursiveResult[] => {
    const ids: string[] = Array.from(new Set(result.map(row => row.id)));
    return [{ ids }];
  };

  return transformResult(result);
};






interface ChildRecursiveResult {
    emails: string[];
    phoneNumbers: string[];
    primaryContactId: number | null;
    secondaryContactIds: (number | null)[];
  }

  export const childRecursive = async (ids: string[]): Promise<ChildRecursiveResult[]> => {
    const results: ChildRecursiveResult[] = [];

    for (const id of ids) {
      console.log("faster", id);
        const result = await prisma.$queryRaw<ChildRecursiveResult[]>`
            SELECT  c.id, c.email, c.phonenumber, c.linked_id, c.linkprecedence
            FROM "Contact" c
            WHERE c.id = ${id}
            UNION ALL
            SELECT  c.id, c.email, c.phonenumber, c.linked_id, c.linkprecedence
            FROM "Contact" c
            WHERE c.linked_id = ${id};
        `;
        console.table(result);

        const transformResult = (result: any[]): ChildRecursiveResult => {
            const emails: string[] = Array.from(new Set(result.map(row => row.email)));
            const phoneNumbers: string[] = Array.from(new Set(result.map(row => row.phonenumber)));
            const secondaryContactIds = result.filter(row => row.linkprecedence === 'SECONDARY').map(row => row.id);
            const primaryContactId = result.find(row => row.linkprecedence === 'PRIMARY').id;
            return {
                emails,
                phoneNumbers,
                primaryContactId,
                secondaryContactIds,
            };
        };

        const response = transformResult(result);
        results.push(response);
    }
    console.log(results);
    return results;
};





interface secondaryContacts {
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: (number | null)[];
}

export const getSecondaryContacts = async (id: number): Promise<secondaryContacts> => {
  const result = await prisma.$queryRaw<secondaryContacts[]>`
      SELECT c.id, c.email, c.phonenumber, c.linked_id, c.linkprecedence
      FROM "Contact" c
      WHERE c.linked_id = ${id} AND c.linkprecedence = 'SECONDARY';
  `;

  console.table(result);

  const transformResult = (result) => {
      const emails: string[] = Array.from(new Set(result.map(row => row.email)));
      const phoneNumbers: string[] = Array.from(new Set(result.map(row => row.phonenumber)));
      const secondaryContactIds = result.map(row => row.id);

      return {
          emails,
          phoneNumbers,
          secondaryContactIds,
      };
  };

  return transformResult(result);
};

