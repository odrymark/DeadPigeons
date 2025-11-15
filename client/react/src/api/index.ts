import {Api} from "./Api.ts";

export type User = {
    id: string;
    isAdmin: boolean;
    username: string;
}

export type UserLoginPost = {
    username: string;
    password: string;
}

export type Board = {
    id: string;
    numbers: number[];
    createdAt: string;
    isWinner: boolean;
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

export async function handleLogout(): Promise<void> {
    try
    {
        await defApi.pigeon.mainLogout({credentials:"include"});
    }
    catch (error) {
        console.log("Failed to logout: "+error);
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

export async function handleGetBoards() : Promise<Board[] | null> {
    try {
        const res = await defApi.pigeon.mainGetBoards({credentials:"include"});
        return await res.json() as Board[];
    }
    catch (error) {
        console.log("Failed to authenticate user: "+error);
        return null;
    }
}