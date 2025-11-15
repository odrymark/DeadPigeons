import {Api} from "./Api.ts";

export type User = {
    id: number;
    isAdmin: boolean;
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
        const res = await defApi.pigeon.mainLogin(user, {credentials:"include"});
        return await res.json() as User;
    }
    catch (error) {
        console.log("Failed to login with provided credentials: "+error);
        return null;
    }
}

export async function handleUserAuth() : Promise<User | null> {
    try {
        const res = await defApi.pigeon.mainGetMe({credentials:"include"});
        if(!res.ok)
            return null;

        return await res.json() as User;
    }
    catch (error) {
        console.log("Failed to authenticate user: "+error);
        return null;
    }
}