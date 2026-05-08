import { sendRequest } from "@/utils/api";
import { LoginResponse } from "../types";

export const login = (email: string, password: string) => {
    return sendRequest<IBackendRes<LoginResponse>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`,
        method: "POST",
        body: {
            username: email,
            password: password
        }
    })
}

export const refreshTokenApi = (refreshToken: string) => {
    return sendRequest<IBackendRes<LoginResponse>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refresh`,
        method: "POST",
        body: { refreshToken }
    })
}

export const register = (name: string, email: string, password: string) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register`,
        method: "POST",
        body: {
            name: name,
            email: email,
            password: password,
        }
    })
}

export const socialLogin = (email: string, name: string, provider: string, providerAccountId: string, avatar?: string | null) => {
    return sendRequest<IBackendRes<LoginResponse>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/social-login`,
        method: "POST",
        body: {
            email,
            name,
            provider,
            providerAccountId,
            avatar
        }
    })
}

export const fetchProductsPagination = ({ current, pageSize, sort, category, minPrice, maxPrice, name }: { current: number, pageSize: number, sort?: string, category?: string, minPrice?: number, maxPrice?: number, name?: string }) => {

    let paramsObj: any = { current, pageSize };
    if (sort) paramsObj.sort = sort;
    if (category) paramsObj.category = category;
    if (name) paramsObj.name = `/${name}/i`; // Case-insensitive search using aqp

    let qs = new URLSearchParams(paramsObj).toString();

    let customQueries: string[] = [];

    if (minPrice !== undefined && minPrice !== null) {
        customQueries.push(`price>=${minPrice}`);
    }
    if (maxPrice !== undefined && maxPrice !== null) {
        customQueries.push(`price<=${maxPrice}`);
    }

    if (customQueries.length > 0) {
        qs += (qs ? '&' : '') + customQueries.join('&');
    }

    const finalUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products${qs ? `?${qs}` : ''}`;

    return sendRequest<IBackendRes<IModelPaginate<IProduct>>>({
        url: finalUrl,
        method: "GET",
        queryParams: null as any,
        nextOption: { cache: 'no-store' }
    });
}

export const fetchCategories = ({ current, pageSize }: { current: number, pageSize: number }) => {
    return sendRequest<IBackendRes<IModelPaginate<ICategory>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories`,
        method: "GET",
        queryParams: { current, pageSize },
        nextOption: { cache: 'no-store' }
    })
}
