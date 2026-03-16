export const getJwt = (authorization: string | undefined) => {
    if (authorization && authorization.startsWith('Bearer')) {
        return authorization.substring(7, authorization.length);
    }
    return null;
}