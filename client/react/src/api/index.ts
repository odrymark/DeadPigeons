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

export type UserEditPost = {
    id: string;
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
}

export const defApi = new Api({
    baseUrl: 'https://dead-pigeons-backend.fly.dev'
});

async function apiRequest<T>(
    requestFunc: (opts?: RequestInit) => Promise<Response>
): Promise<T> {
    const makeRequest = async (): Promise<Response> => {
        const res = await requestFunc({ credentials: "include" });

        if (res.ok) return res;

        let message = `HTTP error ${res.status}`;

        try {
            const body = await res.clone().json();
            if (body.detail) message = body.detail;
            else if (body.title) message = body.title;
        } catch {
            // if not json ignore
        }

        const error = new Error(message);
        (error as Error & { status?: number }).status = res.status;
        throw error;
    };

    try {
        const res = await makeRequest();

        const text = await res.text();
        return text ? JSON.parse(text) as T : {} as T;
    } catch (error) {
        if ((error as Error & { status?: number }).status === 401) {
            console.log("Got 401, attempting token refresh...");

            try {
                await handleRefreshToken();
                const retryRes = await makeRequest();

                const text = await retryRes.text();
                return text ? JSON.parse(text) as T : {} as T;
            } catch {
                throw new Error("Session expired. Please log in again.");
            }
        }

        throw error;
    }
}

let refreshPromise: Promise<unknown> | null = null;

async function handleRefreshToken(): Promise<void> {
    if (!refreshPromise) {
        refreshPromise = defApi.api
            .authRefresh({ credentials: "include" })
            .then((response) => {
                console.log("Token refreshed successfully");
                return response;
            })
            .catch((err) => {
                console.log("Refresh failed:", err);
                throw err;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    await refreshPromise;
}

class ApiService {
    private api = defApi.api;

    private async _get<T>(
        requestFunc: (opts?: RequestInit) => Promise<Response>,
        defaultValue: T
    ): Promise<T> {
        try {
            return await apiRequest<T>(requestFunc);
        } catch (error) {
            console.log("GET request failed:", error);
            return defaultValue;
        }
    }

    private async _action(
        requestFunc: (opts?: RequestInit) => Promise<Response>
    ): Promise<void> {
        try {
            await apiRequest<unknown>(requestFunc);
        } catch (error) {
            console.error("Action failed:", error);
            throw error;
        }
    }

    async login(user: UserLoginPost): Promise<UserGet | null> {
        return this._get((opts) => this.api.authLogin(user, opts), null);
    }

    async logout(): Promise<void> {
        return this._action((opts) => this.api.authLogout(opts));
    }

    async getCurrentUser(): Promise<UserGet | null> {
        return this._get((opts) => this.api.authGetMe(opts), null);
    }

    async getBoards(idStr?: string): Promise<BoardGet[]> {
        return this._get(
            (opts) => idStr
                ? this.api.boardsGetBoardsAdmin({ idStr }, opts)
                : this.api.boardsGetBoards(opts),
            []
        );
    }

    async getPayments(idStr?: string): Promise<PaymentGet[]> {
        return this._get(
            (opts) => idStr
                ? this.api.paymentsGetPaymentsAdmin({ idStr }, opts)
                : this.api.paymentsGetPayments(opts),
            []
        );
    }

    async getBalance(): Promise<number> {
        return this._get((opts) => this.api.paymentsGetBalance(opts), -1);
    }

    async addBoard(board: BoardPost): Promise<void> {
        return this._action((opts) => this.api.boardsAddBoard(board, opts));
    }

    async endRepeat(id: string): Promise<void> {
        return this._action((opts) => this.api.boardsEndRepeat(id, opts));
    }

    async addUser(user: UserAddPost): Promise<void> {
        return this._action((opts) => this.api.usersAddUser(user, opts));
    }

    async addWinningNumbers(numbers: number[]): Promise<void> {
        return this._action((opts) => this.api.gamesAddWinningNumbers({ numbers }, opts));
    }

    async addPayment(payment: PaymentAddPost): Promise<void> {
        return this._action((opts) => this.api.paymentsAddPayment(payment, opts));
    }

    async getAllUsers(): Promise<UserInfoGet[]> {
        return this._get((opts) => this.api.usersGetAllUsers(opts), []);
    }

    async getUserInfo(idStr: string): Promise<UserInfoGet | null> {
        return this._get((opts) => this.api.usersGetUserInfo({ idStr }, opts), null);
    }

    async getAllGames(): Promise<GameGet[] | null> {
        return this._get((opts) => this.api.gamesGetAllGames(opts), null);
    }

    async approvePayment(payment: PaymentApprovePost): Promise<void> {
        return this._action((opts) => this.api.paymentsApprovePayment(payment, opts));
    }

    async getCurrentGameClosing(): Promise<CurrGameCloseGet | null> {
        return this._get((opts) => this.api.gamesGetCurrGameClosing(opts), null);
    }

    async getLastGameNums(): Promise<number[]> {
        return this._get((opts) => this.api.gamesGetLastGameNums(opts), []);
    }

    async getCurrentBoardsForUser(): Promise<BoardGet[]> {
        return this._get((opts) => this.api.boardsGetCurrBoardsForUser(opts), []);
    }

    async getPreviousBoardsForUser(): Promise<BoardGet[]> {
        return this._get((opts) => this.api.boardsGetPrevBoardsForUser(opts), []);
    }

    async editUser(user: UserEditPost): Promise<void> {
        return this._action((opts) => this.api.usersEditUser(user, opts));
    }
}

export const apiService = new ApiService();