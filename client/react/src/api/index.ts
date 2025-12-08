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
    id: string;
    username: string;
    email?: string;
    phoneNumber?: string;
    createdAt?: string;
    lastLogin?: string;
    isActive?: boolean;
}

export type BoardPost = {
    numbers: number[];
    repeats: number;
}

export type BoardGet = {
    id: string;
    numbers: number[];
    createdAt: string;
    repeats: number;
    isWinner: boolean;
}

export type WinnersGet = {
    username: string;
    winningBoardsNum: number;
}

export type GameGet = {
    id: string;
    createdAt: string;
    winningNums: number[];
    income: number;
    winners: WinnersGet[];
}

export type CurrGameCloseGet = {
    closeDate: string;
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
    baseUrl: 'https://dead-pigeons-backend.fly.dev'
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
        refreshPromise = defApi.api
            .authRefresh({ credentials: "include" })
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

class ApiService {
    private api = defApi.api;

    private async _get<T>(
        requestFunc: (opts?: RequestInit) => Promise<Response>,
        defaultValue: T,
        errorMsg: string
    ): Promise<T> {
        try {
            return await apiRequest<T>(requestFunc);
        } catch (error) {
            console.log(`${errorMsg}: ${error}`);
            return defaultValue;
        }
    }

    private async _action(
        requestFunc: (opts?: RequestInit) => Promise<Response>,
        successMsg: string,
        errorMsg: string
    ): Promise<void> {
        try {
            await apiRequest<unknown>(requestFunc);
            if (successMsg) alert(successMsg);
        } catch (error) {
            console.log(`${errorMsg}: ${error}`);
            if (successMsg) alert(`${errorMsg}: ${error}`);
        }
    }

    async login(user: UserLoginPost): Promise<UserGet | null> {
        return this._get(
            (opts) => this.api.authLogin(user, opts),
            null,
            "Failed to login"
        );
    }

    async logout(): Promise<void> {
        return this._action(
            (opts) => this.api.authLogout(opts),
            "",
            "Failed to logout"
        );
    }

    async getCurrentUser(): Promise<UserGet | null> {
        return this._get(
            (opts) => this.api.authGetMe(opts),
            null,
            "Failed to authenticate user"
        );
    }

    async getBoards(userId?: string): Promise<BoardGet[]> {
        return this._get(
            (opts) => userId
                ? this.api.boardsGetBoardsAdmin({ userId }, opts)
                : this.api.boardsGetBoards(opts),
            [],
            "Failed to retrieve boards"
        );
    }

    async getPayments(userId?: string): Promise<PaymentGet[]> {
        return this._get(
            (opts) => userId
                ? this.api.paymentsGetPaymentsAdmin({ userId }, opts)
                : this.api.paymentsGetPayments(opts),
            [],
            "Failed to retrieve payments"
        );
    }

    async getBalance(): Promise<number> {
        return this._get(
            (opts) => this.api.paymentsGetBalance(opts),
            -1,
            "Failed to retrieve balance"
        );
    }

    async addBoard(board: BoardPost): Promise<void> {
        return this._action(
            (opts) => this.api.boardsAddBoard(board, opts),
            "Board added successfully.",
            "Failed to add board"
        );
    }

    async endRepeat(id: string): Promise<void> {
        return this._action(
            (opts) => this.api.boardsEndRepeat(id, opts),
            "Board updated successfully.",
            "Failed to update board"
        );
    }

    async addUser(user: UserAddPost): Promise<void> {
        return this._action(
            (opts) => this.api.usersAddUser(user, opts),
            "User added successfully.",
            "Failed to add user"
        );
    }

    async addWinningNumbers(numbers: number[]): Promise<void> {
        return this._action(
            (opts) => this.api.gamesAddWinningNumbers({ numbers }, opts),
            "Winning numbers added successfully.",
            "Failed to add the winning numbers"
        );
    }

    async addPayment(payment: PaymentAddPost): Promise<void> {
        return this._action(
            (opts) => this.api.paymentsAddPayment(payment, opts),
            "Payment added successfully!",
            "Failed to add payment"
        );
    }

    async getAllUsers(): Promise<UserInfoGet[]> {
        return this._get(
            (opts) => this.api.usersGetAllUsers(opts),
            [],
            "Failed to get users"
        );
    }

    async getUserInfo(userId: string): Promise<UserInfoGet | null> {
        return this._get(
            (opts) => this.api.usersGetUserInfo({ userId }, opts),
            null,
            "Failed to get user info"
        );
    }

    async getAllGames(): Promise<GameGet[] | null> {
        return this._get(
            (opts) => this.api.gamesGetAllGames(opts),
            null,
            "Failed to get all games"
        );
    }

    async approvePayment(payment: PaymentApprovePost): Promise<void> {
        return this._action(
            (opts) => this.api.paymentsApprovePayment(payment, opts),
            "Payment approved successfully!",
            "Failed to approve payment"
        );
    }

    async getCurrentGameClosing(): Promise<CurrGameCloseGet | null> {
        return this._get(
            (opts) => this.api.gamesGetCurrGameClosing(opts),
            null,
            "Failed to get current game closing"
        );
    }

    async getLastGameNums(): Promise<number[]> {
        return this._get(
            (opts) => this.api.gamesGetLastGameNums(opts),
            [],
            "Failed to get last game nums"
        );
    }

    async getCurrentBoardsForUser(): Promise<BoardGet[]> {
        return this._get(
            (opts) => this.api.boardsGetCurrBoardsForUser(opts),
            [],
            "Failed to get boards for user"
        );
    }

    async getPreviousBoardsForUser(): Promise<BoardGet[]> {
        return this._get(
            (opts) => this.api.boardsGetPrevBoardsForUser(opts),
            [],
            "Failed to get boards for user"
        );
    }
}

export const apiService = new ApiService();