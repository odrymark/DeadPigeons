import {Api} from "./Api.ts";

export type UserGet = {
    id: string;
    isAdmin: boolean;
    username: string;
}

export type UserLoginPost = {
    username: string;
    password: string;
}

export type BoardGet = {
    id: string;
    numbers: number[];
    createdAt: string;
    isWinner: boolean;
}

export type PaymentGet = {
    id: string;
    amount: number;
    createdAt: string;
    paymentNumber: string;
}

export type UserAddPost = {
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
}

export const defApi = new Api({
    baseUrl: 'http://localhost:5000'
});

export async function handleUserLogin(user: UserLoginPost): Promise<UserGet | null> {
    try {
        const res = await defApi.pigeon.mainLogin(user, {credentials:"include"});
        return await res.json() as UserGet;
    }
    catch (error) {
        console.log("Failed to login: "+error);
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

export async function handleUserAuth() : Promise<UserGet | null> {
    try {
        const res = await defApi.pigeon.mainGetMe({credentials:"include"});
        if(!res.ok)
            return null;

        return await res.json() as UserGet;
    }
    catch (error) {
        console.log("Failed to authenticate user: "+error);
        return null;
    }
}

export async function handleGetBoards() : Promise<BoardGet[]> {
    try {
        const res = await defApi.pigeon.mainGetBoards({credentials:"include"});
        return await res.json() as BoardGet[];
    }
    catch (error) {
        console.log("Failed to retrieve boards: "+error);
        return [];
    }
}

export async function handleGetPayments() : Promise<PaymentGet[]> {
    try
    {
        const res = await defApi.pigeon.mainGetPayments({credentials:"include"});
        return await res.json() as PaymentGet[];
    }
    catch (error) {
        console.log("Failed to retrieve payments: "+error);
        return [];
    }
}

export async function handleGetBalance() : Promise<number> {
    try {
        const res = await defApi.pigeon.mainGetBalance({credentials:"include"});
        return await res.json() as number;
    }
    catch (error) {
        console.log("Failed to retrieve balance: "+error);
        return -1;
    }
}

export async function handleAddBoard(numbers: number[]) {
    try {
        await defApi.pigeon.mainAddBoard({numbers:numbers}, {credentials:"include"});
        alert("Board added successfully.");
    }
    catch (error) {
        console.log("Failed to add board: "+error);
        alert("Failed to add board: "+error);
    }
}

export async function handleAddUser(user: UserAddPost) {
    try {
        await defApi.pigeon.mainAddUser(user, {credentials:"include"});
        alert("User added successfully.");
    }
    catch (error) {
        console.log("Failed to add user: "+error);
        alert("Failed to add user: "+error);
    }
}

export async function handleGetWeekIncome() : Promise<number> {
    try {
        const res = await defApi.pigeon.mainGetWeekIncome({credentials:"include"});
        return await res.json() as number;
    }
    catch (error) {
        console.log("Failed to retrieve weeks income: "+error);
        return -1;
    }
}