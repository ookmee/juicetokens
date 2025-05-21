/**
 * Options for network requests
 */
export interface RequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
}
/**
 * Response structure from network requests
 */
export interface NetworkResponse<T = any> {
    data: T;
    statusCode: number;
    headers: Record<string, string>;
}
/**
 * Base interface for network adapters
 */
export interface NetworkAdapter {
    /**
     * Unique identifier for the adapter
     */
    readonly id: string;
    /**
     * Send HTTP GET request
     */
    get<T = any>(url: string, options?: RequestOptions): Promise<NetworkResponse<T>>;
    /**
     * Send HTTP POST request
     */
    post<T = any>(url: string, data: any, options?: RequestOptions): Promise<NetworkResponse<T>>;
    /**
     * Send HTTP PUT request
     */
    put<T = any>(url: string, data: any, options?: RequestOptions): Promise<NetworkResponse<T>>;
    /**
     * Send HTTP DELETE request
     */
    delete<T = any>(url: string, options?: RequestOptions): Promise<NetworkResponse<T>>;
    /**
     * Open a websocket connection
     */
    openWebSocket(url: string, protocols?: string | string[]): WebSocket;
}
