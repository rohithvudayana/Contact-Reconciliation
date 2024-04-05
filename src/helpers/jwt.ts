import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export interface SerializedUser {
    userId: string;
    userName: string;
    isAdmin: boolean;
}
type UserDocument = any;

export const SerializeUser = (user: UserDocument): SerializedUser => {
    const userId = user && user._id ? user._id : '';
    return { userId, userName: user.email, isAdmin: user.isAdmin };
};

export const genToken = (user: UserDocument | SerializedUser) => {
    const userToken = !user.hasOwnProperty("userId") ? SerializeUser(user as UserDocument) : {
        userId: (user as SerializedUser).userId,
        userName: (user as SerializedUser).userName,
        isAdmin: (user as SerializedUser).isAdmin,
    };
    if (!process.env.JWT_ACCESS_SECRET) {
        console.log("JWT_ACCESS_SECRET not found");
        throw new Error("JWT ACCESS SECRET not found");
    }
    return jwt.sign(userToken, process.env.JWT_ACCESS_SECRET);
};

export const verifyToken = (token: string) : SerializedUser => {
    if(!process.env.JWT_ACCESS_SECRET) {
        console.log("JWT_ACCESS_SECRET not found");
        throw new Error("jwt not found");
    }
    try{
        const deserializedUser = jwt.verify( token, process.env.JWT_ACCESS_SECRET ) as SerializedUser;
        return deserializedUser;
    }catch (error) {
        throw new Error("Invalid access token");
    }
  }




// export const genRefreshToken = (user: UserDocument | SerializedUser) => {
//     const userToken = !user.hasOwnProperty("userId")
//       ? SerializeUser(user as UserDocument)
//       : {
//           userId: (user as SerializedUser).userId,
//           userEmail: (user as SerializedUser).userName,
//           isAdmin: (user as SerializedUser).isAdmin,
//         };
//     if (!process.env.JWT_REFRESH_SECRET) {
//       console.log("JWT_REFRESH_SECRET not found");
//       throw new Error("JWT_REFRESH_SECRET not found");
//     }
//     return jwt.sign(userToken, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d"});
//   };

