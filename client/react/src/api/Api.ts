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

export interface UserAddReqDTO {
  username?: string;
  password?: string;
  email?: string;
  phoneNumber?: string;
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
  public baseUrl: string = "http://localhost:5000";
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
 * @baseUrl http://localhost:5000
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  pigeon = {
    /**
     * No description
     *
     * @tags Main
     * @name MainLogin
     * @request POST:/pigeon/login
     */
    mainLogin: (data: UserLoginReqDTO, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainLogout
     * @request POST:/pigeon/logout
     */
    mainLogout: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/logout`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainGetMe
     * @request GET:/pigeon/auth/me
     */
    mainGetMe: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/auth/me`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainRefresh
     * @request POST:/pigeon/auth/refresh
     */
    mainRefresh: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/auth/refresh`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainGetBoards
     * @request GET:/pigeon/getBoards
     */
    mainGetBoards: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/getBoards`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainGetBoardsAdmin
     * @request GET:/pigeon/getBoardsAdmin
     */
    mainGetBoardsAdmin: (
      query?: {
        username?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<File, any>({
        path: `/pigeon/getBoardsAdmin`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainGetAllGames
     * @request GET:/pigeon/getAllGames
     */
    mainGetAllGames: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/getAllGames`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainGetPayments
     * @request GET:/pigeon/getPayments
     */
    mainGetPayments: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/getPayments`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainGetPaymentsAdmin
     * @request GET:/pigeon/getPaymentsAdmin
     */
    mainGetPaymentsAdmin: (
      query?: {
        username?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<File, any>({
        path: `/pigeon/getPaymentsAdmin`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainGetBalance
     * @request GET:/pigeon/getBalance
     */
    mainGetBalance: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/getBalance`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainAddBoard
     * @request POST:/pigeon/addBoard
     */
    mainAddBoard: (data: BoardReqDTO, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/addBoard`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainEndRepeat
     * @request POST:/pigeon/endRepeat
     */
    mainEndRepeat: (data: string, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/endRepeat`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainAddUser
     * @request POST:/pigeon/addUser
     */
    mainAddUser: (data: UserAddReqDTO, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/addUser`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainGetGameIncome
     * @request GET:/pigeon/getWeekIncome
     */
    mainGetGameIncome: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/getWeekIncome`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainAddWinningNumbers
     * @request POST:/pigeon/addWinningNumbers
     */
    mainAddWinningNumbers: (
      data: WinningNumsReqDTO,
      params: RequestParams = {},
    ) =>
      this.request<File, any>({
        path: `/pigeon/addWinningNumbers`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainGetAllUsers
     * @request GET:/pigeon/getAllUsers
     */
    mainGetAllUsers: (params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/getAllUsers`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainGetUserInfo
     * @request GET:/pigeon/getUserInfo
     */
    mainGetUserInfo: (
      query?: {
        username?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<File, any>({
        path: `/pigeon/getUserInfo`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainAddPayment
     * @request POST:/pigeon/addPayment
     */
    mainAddPayment: (data: PaymentReqDTO, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/addPayment`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Main
     * @name MainApprovePayment
     * @request POST:/pigeon/approvePayment
     */
    mainApprovePayment: (data: PaymentReqDTO, params: RequestParams = {}) =>
      this.request<File, any>({
        path: `/pigeon/approvePayment`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
}
