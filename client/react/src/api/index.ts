import {Api} from "./Api.ts";

export type User = {
    id: number;
    isAdmin: boolean;
    token: string;
    username: string;
}

export type UserLoginPost = {
    username: string;
    password: string;
}

export const defApi = new Api({
    baseUrl: 'http://localhost:5000'
});

export async function handleUserLogin(user: UserLoginPost): Promise<User | null> {
    try {
        const res = await defApi.pigeon.mainLogin(user);
        const data = await res.json() as User;
        return data as User;
    }
    catch (error) {
        console.log("Failed to login with provided credentials: "+error);
        return null;
    }
}