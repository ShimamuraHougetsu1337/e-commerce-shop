import { sendRequest } from "@/utils/api";

export const getCartApi = (accessToken: string) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/carts`,
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

export const addToCartApi = (productId: string, quantity: number, accessToken: string) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/carts/add`,
        method: "POST",
        body: {
            product: productId,
            quantity
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

export const updateQuantityApi = (productId: string, quantity: number, accessToken: string) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/carts/update`,
        method: "PATCH",
        body: {
            product: productId,
            quantity
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

export const removeFromCartApi = (productId: string, accessToken: string) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/carts/remove/${productId}`,
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

export const syncCartApi = (items: { product: string, quantity: number }[], accessToken: string) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/carts/sync`,
        method: "POST",
        body: {
            items
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

export const clearCartApi = (accessToken: string) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/carts/clear`,
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

export const applyCouponApi = (code: string, orderValue: number, accessToken: string) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/coupons/apply`,
        method: "POST",
        body: { code, orderValue },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

export const getActiveCouponsApi = () => {
    return sendRequest<IBackendRes<ICoupon[]>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/coupons/active`,
        method: "GET"
    });
}
