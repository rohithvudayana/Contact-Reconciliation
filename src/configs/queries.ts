import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();



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

