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

export type WinnersGet = {
    username: string;
    winningBoardsNum: number;
}

export type PaymentGet = {
    id: string;
    amount: number;
    createdAt: string;
    paymentNumber: string;
}

export type PaymentPost = {
    username: string;
    amount: number;
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

async function apiRequest<T>(requestFunc: (opts?: RequestInit) => Promise<Response>): Promise<T> {
    try {
        const res = await requestFunc({ credentials: "include" });

        if (!res.ok) throw res;

        const text = await res.text();

        if (!text) {
            return {} as T;
        }

        return JSON.parse(text) as T;

    } catch (error: any) {
        if (error?.status === 401) {
            console.log("Got 401, attempting token refresh...");

            try {
                await handleRefreshToken();

                const retryRes = await requestFunc({ credentials: "include" });
                if (!retryRes.ok) throw retryRes;

                const retryText = await retryRes.text();

                if (!retryText) {
                    return {} as T;
                }

                return JSON.parse(retryText) as T;
            } catch (retryErr) {
                console.log("Token refresh failed:", retryErr);
                throw new Error("Unauthorized");
            }
        }

        console.log("Request failed:", error);
        throw error;
    }
}

let refreshPromise: Promise<any> | null = null;

async function handleRefreshToken() : Promise<void> {
    if (!refreshPromise) {
        refreshPromise = defApi.pigeon
            .mainRefresh({ credentials: "include" })
            .catch(err => {
                console.log("Refresh failed:", err);
                throw err;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

export async function handleUserLogin(user: UserLoginPost): Promise<UserGet | null> {
    try {
        return await apiRequest((opts) => defApi.pigeon.mainLogin(user, opts));
    }
    catch (error) {
        console.log("Failed to login: "+error);
        return null;
    }
}

export async function handleLogout(): Promise<void> {
    try
    {
        await defApi.pigeon.mainLogout({credentials: "include"});
    }
    catch (error) {
        console.log("Failed to logout: "+error);
    }
}

export async function handleUserAuth() : Promise<UserGet | null> {
    try {
        return await apiRequest((opts) => defApi.pigeon.mainGetMe(opts));
    }
    catch (error) {
        console.log("Failed to authenticate user: "+error);
        return null;
    }
}

export async function handleGetBoards() : Promise<BoardGet[]> {
    try {
        return await apiRequest((opts) => defApi.pigeon.mainGetBoards(opts));
    }
    catch (error) {
        console.log("Failed to retrieve boards: "+error);
        return [];
    }
}

export async function handleGetPayments() : Promise<PaymentGet[]> {
    try
    {
        return await apiRequest((opts) => defApi.pigeon.mainGetPayments(opts));
    }
    catch (error) {
        console.log("Failed to retrieve payments: "+error);
        return [];
    }
}

export async function handleGetBalance() : Promise<number> {
    try {
        return await apiRequest((opts) => defApi.pigeon.mainGetBalance(opts));
    }
    catch (error) {
        console.log("Failed to retrieve balance: "+error);
        return -1;
    }
}

export async function handleAddBoard(numbers: number[]) {
    try {
        await apiRequest((opts) => defApi.pigeon.mainAddBoard({numbers}, opts));
        alert("Board added successfully.");
    }
    catch (error) {
        console.log("Failed to add board: "+error);
        alert("Failed to add board: "+error);
    }
}

export async function handleAddUser(user: UserAddPost) {
    try {
        await apiRequest((opts) => defApi.pigeon.mainAddUser(user, opts));
        alert("User added successfully.");
    }
    catch (error) {
        console.log("Failed to add user: "+error);
        alert("Failed to add user: "+error);
    }
}

export async function handleGetWeekIncome() : Promise<number> {
    try {
        return await apiRequest((opts) => defApi.pigeon.mainGetGameIncome(opts));
    }
    catch (error) {
        console.log("Failed to retrieve week's income: " + error);
        return -1;
    }
}

export async function handleAddWinningNumbers(numbers: number[]) {
    try {
        await apiRequest((opts) => defApi.pigeon.mainAddWinningNumbers({numbers}, opts));
        alert("Winning numbers added successfully.");
    }
    catch (error) {
        console.log("Failed to add the winning numbers: "+error);
        alert("Failed to add the winning numbers: "+error);
    }
}

export async function handleAddPayment(payment: PaymentPost) {
    try {
        await apiRequest((opts) => defApi.pigeon.mainAddPayment(payment, opts));
        alert("Payment added successfully!");
    }
    catch (error) {
        console.log("Failed to add payment: "+error);
        alert("Failed to add payment: "+error);
    }
}

export async function handleGetAllUsers() : Promise<string[]> {
    try {
        return await apiRequest((opts) => defApi.pigeon.mainGetAllUsers(opts));
    }
    catch (error) {
        console.log("Failed to get users: "+error);
        return [];
    }
}

export async function handleGetWinners() : Promise<WinnersGet[]> {
    try {
        return await apiRequest((opts) => defApi.pigeon.mainGetWinners(opts));
    }
    catch (error) {
        console.log("Failed to get the winners: "+error);
        return [];
    }
}