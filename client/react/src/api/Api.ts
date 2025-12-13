/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface UserLoginReqDTO {
  username?: string;
  password?: string;
}

export interface BoardReqDTO {
  /**
   * @maxItems 8
   * @minItems 5
   */
  numbers?: number[];
  /** @format int32 */
  repeats?: number;
}

export interface UserEditReqDTO {
    id: string;
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
}

export interface WinningNumsReqDTO {
  /**
   * @maxItems 3
   * @minItems 3
   */
  numbers?: number[];
}

export interface PaymentReqDTO {
  id?: string | null;
  /** @format int32 */
  amount?: number | null;
  /**
   * @minLength 1
   * @pattern ^[0-9]{10}$
   */
  paymentNumber: string;
  isApproved?: boolean | null;
}

export interface UserAddReqDTO {
  username?: string;
  password?: string;
  email?: string;
  phoneNumber?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "https://dead-pigeons-backend.fly.dev";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title My Title
 * @version 1.0.0
 * @baseUrl https://dead-pigeons-backend.fly.dev
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Auth
     * @name AuthLogin
     * @request POST:/api/auth/login
     */
    authLogin: (data: UserLoginReqDTO, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthLogout
     * @request POST:/api/auth/logout
     */
    authLogout: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/auth/logout`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthGetMe
     * @request GET:/api/auth/me
     */
    authGetMe: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/auth/me`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthRefresh
     * @request POST:/api/auth/refresh
     */
    authRefresh: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/auth/refresh`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Boards
     * @name BoardsGetBoards
     * @request GET:/api/boards/getBoards
     */
    boardsGetBoards: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/boards/getBoards`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Boards
     * @name BoardsGetBoardsAdmin
     * @request GET:/api/boards/getBoardsAdmin
     */
    boardsGetBoardsAdmin: (
      query?: {
        idStr?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<File, any>({
        path: `/api/boards/getBoardsAdmin`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Boards
     * @name BoardsGetCurrBoardsForUser
     * @request GET:/api/boards/getCurrBoardsForUser
     */
    boardsGetCurrBoardsForUser: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/boards/getCurrBoardsForUser`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Boards
     * @name BoardsGetPrevBoardsForUser
     * @request GET:/api/boards/getPrevBoardsForUser
     */
    boardsGetPrevBoardsForUser: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/boards/getPrevBoardsForUser`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Boards
     * @name BoardsAddBoard
     * @request POST:/api/boards/addBoard
     */
    boardsAddBoard: (data: BoardReqDTO, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/boards/addBoard`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Boards
     * @name BoardsEndRepeat
     * @request POST:/api/boards/endRepeat
     */
    boardsEndRepeat: (data: string, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/boards/endRepeat`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Games
     * @name GamesGetAllGames
     * @request GET:/api/games/getAllGames
     */
    gamesGetAllGames: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/games/getAllGames`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Games
     * @name GamesAddWinningNumbers
     * @request POST:/api/games/addWinningNumbers
     */
    gamesAddWinningNumbers: (
      data: WinningNumsReqDTO,
      params: RequestParams = {},
    ) =>
      this.request<File, any>({
        path: `/api/games/addWinningNumbers`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Games
     * @name GamesGetGameIncome
     * @request GET:/api/games/getGameIncome
     */
    gamesGetGameIncome: (
        data: string,
        params: RequestParams = {}
    ) =>
      this.request<File, any>({
        path: `/api/games/getGameIncome`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Games
     * @name GamesGetCurrGameClosing
     * @request GET:/api/games/getCurrGameClosing
     */
    gamesGetCurrGameClosing: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/games/getCurrGameClosing`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Games
     * @name GamesGetLastGameNums
     * @request GET:/api/games/getLastGameNums
     */
    gamesGetLastGameNums: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/games/getLastGameNums`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payments
     * @name PaymentsGetPayments
     * @request GET:/api/payments/getPayments
     */
    paymentsGetPayments: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/payments/getPayments`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payments
     * @name PaymentsGetPaymentsAdmin
     * @request GET:/api/payments/getPaymentsAdmin
     */
    paymentsGetPaymentsAdmin: (
      query?: {
          idStr?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<File, any>({
        path: `/api/payments/getPaymentsAdmin`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payments
     * @name PaymentsAddPayment
     * @request POST:/api/payments/addPayment
     */
    paymentsAddPayment: (data: PaymentReqDTO, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/payments/addPayment`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payments
     * @name PaymentsApprovePayment
     * @request POST:/api/payments/approvePayment
     */
    paymentsApprovePayment: (data: PaymentReqDTO, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/payments/approvePayment`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payments
     * @name PaymentsGetBalance
     * @request GET:/api/payments/getBalance
     */
    paymentsGetBalance: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/payments/getBalance`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersAddUser
     * @request POST:/api/users/addUser
     */
    usersAddUser: (data: UserAddReqDTO, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/users/addUser`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

      /**
       * No description
       *
       * @tags Users
       * @name UsersEditUser
       * @request POST:/api/users/editUser
       */
      usersEditUser: (data: UserEditPost, params: RequestParams = {}) =>
          this.request<File, any>({
              path: `/api/users/editUser`,
              method: "POST",
              body: data,
              type: ContentType.Json,
              ...params,
          }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersGetAllUsers
     * @request GET:/api/users/getAllUsers
     */
    usersGetAllUsers: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/api/users/getAllUsers`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersGetUserInfo
     * @request GET:/api/users/getUserInfo
     */
    usersGetUserInfo: (
      query?: {
          idStr?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<File, any>({
        path: `/api/users/getUserInfo`,
        method: "GET",
        query: query,
        ...params,
      }),
  };
  error = {
    /**
     * No description
     *
     * @tags Error
     * @name ErrorHandleError
     * @request GET:/error
     */
    errorHandleError: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/error`,
        method: "GET",
        ...params,
      }),
  };
}
