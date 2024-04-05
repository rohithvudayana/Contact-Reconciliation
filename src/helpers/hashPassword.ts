import bcrypt from "bcrypt";

export const hashPassword = (password: string) => {
    const salt = 10;
    const hashed = bcrypt.hashSync(password, salt);
    return hashed;
}

export const hashCompare = (password: string, hashpass: string) => {
    const bool = bcrypt.compareSync(password, hashpass);
    return bool;
}