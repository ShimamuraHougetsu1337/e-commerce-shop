import queryString from 'query-string';

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