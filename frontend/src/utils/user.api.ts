
import { sendRequest } from "@/utils/api";

export const addToWishlist = (productId: string, accessToken?: string) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/wishlist`,
        method: "POST",
        body: {
            productId
        },
        headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`
        } : undefined
    });
}

export const removeFromWishlist = (productId: string, accessToken?: string) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/wishlist/${productId}`,
        method: "DELETE",
        headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`
        } : undefined
    });
}

export const getWishlist = (accessToken?: string) => {
    return sendRequest<IBackendRes<IProduct[]>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/wishlist`,
        method: "GET",
        headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`
        } : undefined
    });
}

// Cart API
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

export const clearCartApi = (accessToken: string) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/carts/clear`,
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

export const updateProfileApi = (data: { name?: string, oldPassword?: string, newPassword?: string }, accessToken: string) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/profile`,
        method: "PATCH",
        body: data,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

// Orders API
export const getMyOrdersApi = (accessToken: string) => {
    return sendRequest<IBackendRes<any[]>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/orders/my-orders`,
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
    });
};

export const createOrderApi = (
    data: { items: any[]; totalAmount: number; shippingAddress?: string; paymentMethod?: string },
    accessToken: string
) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/orders`,
        method: 'POST',
        body: data,
        headers: { Authorization: `Bearer ${accessToken}` },
    });
};

export const getMyReviewsApi = (accessToken: string) => {
    return sendRequest<IBackendRes<any[]>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/user`,
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
    });
};

export const createReviewApi = (
    data: { productId: string; rating: number; comment: string; images?: string[] },
    accessToken: string
) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews`,
        method: 'POST',
        body: data,
        headers: { Authorization: `Bearer ${accessToken}` },
    });
};

export const getReviewsByProductApi = (productId: string, current: number = 1, pageSize: number = 5) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/product/${productId}?current=${current}&pageSize=${pageSize}`,
        method: 'GET',
    });
};

export const updateReviewApi = (
    id: string,
    data: { rating?: number; comment?: string; images?: string[] },
    accessToken: string
) => {
    return sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/${id}`,
        method: 'PATCH',
        body: data,
        headers: { Authorization: `Bearer ${accessToken}` },
    });
};
