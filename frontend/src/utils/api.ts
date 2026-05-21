import queryString from 'query-string';
import { getSession } from 'next-auth/react';

export const sendRequest = async <T>(props: IRequest) => {
    let {
        url,
        method,
        body,
        queryParams = {},
        useCredentials = false,
        headers = {},
        nextOption = {},
        accessToken
    } = props;

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const options: any = {
        method: method,
        headers: new Headers({ 'content-type': 'application/json', ...headers }),
        ...nextOption
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    if (useCredentials) options.credentials = "include";

    if (queryParams && Object.keys(queryParams).length > 0) {
        url = `${url}?${queryString.stringify(queryParams)}`;
    }

    return fetch(url, options).then(async (res) => {
        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        
        // Auto-refresh token and retry if 401 Unauthorized (Client-side only)
        if (res.status === 401 && typeof window !== 'undefined' && accessToken) {
            try {
                // Fetch the session again to force a token refresh via NextAuth
                const newSession: any = await getSession();
                if (newSession?.accessToken && newSession.accessToken !== accessToken) {
                    // Update the Authorization header with the new token
                    headers["Authorization"] = `Bearer ${newSession.accessToken}`;
                    
                    const retryOptions: any = {
                        method: method,
                        headers: new Headers({ 'content-type': 'application/json', ...headers }),
                        ...nextOption
                    };
                    
                    if (body) {
                        retryOptions.body = JSON.stringify(body);
                    }
                    if (useCredentials) retryOptions.credentials = "include";

                    // Retry the request
                    const retryRes = await fetch(url, retryOptions);
                    const retryText = await retryRes.text();
                    const retryJson = retryText ? JSON.parse(retryText) : {};
                    
                    if (retryRes.ok) {
                        return {
                            statusCode: retryRes.status,
                            ...retryJson
                        } as T;
                    } else {
                        return {
                            statusCode: retryRes.status,
                            message: retryJson?.message ?? "",
                            error: retryJson?.error ?? ""
                        } as T;
                    }
                }
            } catch (retryError) {
                console.error("Failed to retry request after token refresh", retryError);
            }
        }

        if (res.ok) {
            return {
                statusCode: res.status,
                ...json
            } as T;
        } else {
            return {
                statusCode: res.status,
                message: json?.message ?? "",
                error: json?.error ?? ""
            } as T;
        }
    });
};