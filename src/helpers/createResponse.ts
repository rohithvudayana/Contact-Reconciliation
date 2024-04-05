export const httpResponse = (success: boolean, message: string , data : any ) => {
    return Object.freeze({
        success, message, data
    });
};