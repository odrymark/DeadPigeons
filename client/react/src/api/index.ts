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

export type UserInfoGet = {
    username: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
    lastLogin: string;
    isActive: boolean;
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

export type GamesGet = {
    createdAt: string;
    winningNums: number[];
    income: number;
    winners: WinnersGet[];
}

export type PaymentGet = {
    id: string;
    amount?: number;
    createdAt: string;
    paymentNumber: string;
    isApproved?: boolean;
}

export type PaymentAddPost = {
    paymentNumber: string;
}

export type PaymentApprovePost = {
    id: string;
    username: string;
    paymentNumber: string;
    amount: number;
    isApproved: boolean;
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

export async function handleGetBoards(username?: string) : Promise<BoardGet[]> {
    try {
        if (!username)
            return await apiRequest((opts) => defApi.pigeon.mainGetBoards(opts));
        else
            return await apiRequest((opts) => defApi.pigeon.mainGetBoardsAdmin({username}, opts));
    }
    catch (error) {
        console.log("Failed to retrieve boards: "+error);
        return [];
    }
}

export async function handleGetPayments(username?: string) : Promise<PaymentGet[]> {
    try
    {
        if (!username)
            return await apiRequest((opts) => defApi.pigeon.mainGetPayments(opts));
        else
            return await apiRequest((opts) => defApi.pigeon.mainGetPaymentsAdmin({username}, opts));
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

export async function handleAddPayment(payment: PaymentAddPost) {
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

export async function handleGetUserInfo(username: string) : Promise<UserInfoGet | null> {
    try {
        return await apiRequest((opts) => defApi.pigeon.mainGetUserInfo({username}, opts))
    }
    catch (error) {
        console.log("Failed to get user info: "+error);
        return null;
    }
}

export async function handleGetAllGames() : Promise<GamesGet[] | null> {
    try {
        return await apiRequest((opts) => defApi.pigeon.mainGetAllGames(opts));
    }
    catch (error) {
        console.log("Failed to get all games: "+error);
        return null;
    }
}

export async function handleApprovePayment(payment: PaymentApprovePost) {
    try {
        await apiRequest((opts) => defApi.pigeon.mainApprovePayment(payment, opts));
        alert("Payment approved successfully!");
    }
    catch (error) {
        console.log("Failed to approve payment: "+error);
    }
}