import { CustomerListResponse } from "@/types/admin";

/**
 * Fetch danh sách khách hàng từ Backend NestJS sử dụng native Fetch API
 * Tận dụng cơ chế revalidation của Next.js 14
 */
export async function fetchCustomersList({
    current = 1,
    pageSize = 10,
    query = "",
    sort = "",
    accessToken
}: {
    current?: number;
    pageSize?: number;
    query?: string;
    sort?: string;
    accessToken?: string;
}): Promise<IBackendRes<CustomerListResponse>> {
    const params = new URLSearchParams({
        current: current.toString(),
        pageSize: pageSize.toString(),
        sort: sort || "-createdAt"
    });

    if (query) params.append("name", `/${query}/i`); // Regex search

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users?${params.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        next: {
            tags: ['customers-list'],
            revalidate: 60 // Revalidate mỗi 60 giây
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.statusText}`);
    }

    return response.json();
}

export async function deleteUser(id: string, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.json();
}


export async function fetchProductsList({
    current = 1,
    pageSize = 10,
    query = "",
    sort = "",
    accessToken
}: {
    current?: number;
    pageSize?: number;
    query?: string;
    sort?: string;
    accessToken?: string;
}): Promise<IBackendRes<any>> {
    const params = new URLSearchParams({
        current: current.toString(),
        pageSize: pageSize.toString(),
        sort: sort || "-createdAt"
    });
    if (query) params.append("name", `/${query}/i`);

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products?${params.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        next: { tags: ['products-list'], revalidate: 60 }
    });
    return response.json();
}

export async function createProduct(data: any, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

export async function updateProduct(id: string, data: any, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

export async function deleteProduct(id: string, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.json();
}


export async function fetchCategoriesList({
    current = 1,
    pageSize = 10,
    query = "",
    sort = "",
    accessToken
}: {
    current?: number;
    pageSize?: number;
    query?: string;
    sort?: string;
    accessToken?: string;
}): Promise<IBackendRes<any>> {
    const params = new URLSearchParams({
        current: current.toString(),
        pageSize: pageSize.toString(),
        sort: sort || "-createdAt"
    });
    if (query) params.append("name", `/${query}/i`);

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories?${params.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        next: { tags: ['categories-list'], revalidate: 60 }
    });
    return response.json();
}

export async function createCategory(data: any, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

export async function updateCategory(id: string, data: any, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories/${id}`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

export async function deleteCategory(id: string, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.json();
}


export async function fetchOrdersList({
    current = 1,
    pageSize = 10,
    query = "",
    sort = "",
    accessToken
}: {
    current?: number;
    pageSize?: number;
    query?: string;
    sort?: string;
    accessToken?: string;
}): Promise<IBackendRes<any>> {
    const params = new URLSearchParams({
        current: current.toString(),
        pageSize: pageSize.toString(),
        sort: sort || "-createdAt"
    });
    if (query) params.append("query", query);

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/orders?${params.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        next: { tags: ['orders-list'], revalidate: 60 }
    });
    return response.json();
}

export async function updateOrderStatus(id: string, status: string, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/orders/${id}`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status })
    });
    return response.json();
}

export async function fetchAdminStats(accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/dashboard/stats`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        next: { revalidate: 300 } // Cache stats for 5 mins
    });
    return response.json();
}

export async function fetchCouponsList({
    current = 1,
    pageSize = 10,
    query = "",
    sort = "",
    accessToken
}: {
    current?: number;
    pageSize?: number;
    query?: string;
    sort?: string;
    accessToken?: string;
}): Promise<IBackendRes<IModelPaginate<ICoupon>>> {
    const params = new URLSearchParams({
        current: current.toString(),
        pageSize: pageSize.toString(),
        sort: sort || "-createdAt"
    });
    if (query) params.append("code", `/${query}/i`);

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/coupons?${params.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        next: { tags: ['coupons-list'], revalidate: 60 }
    });
    return response.json();
}

export async function createCoupon(data: any, accessToken: string): Promise<IBackendRes<ICoupon>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/coupons`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

export async function updateCoupon(id: string, data: any, accessToken: string): Promise<IBackendRes<ICoupon>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/coupons/${id}`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

export async function deleteCoupon(id: string, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/coupons/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.json();
}

// === ADMIN REVIEWS API ===

export async function fetchReviewsList({
    current = 1,
    pageSize = 10,
    query = "",
    accessToken
}: {
    current?: number;
    pageSize?: number;
    query?: string;
    accessToken?: string;
}): Promise<IBackendRes<any>> {
    const params = new URLSearchParams({
        current: current.toString(),
        pageSize: pageSize.toString(),
    });
    if (query) params.append("query", query);

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/admin/all?${params.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        next: { tags: ['reviews-list'], revalidate: 60 }
    });
    return response.json();
}

export async function adminReplyReview(id: string, reply: string, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/admin/${id}/reply`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ reply })
    });
    return response.json();
}

export async function adminToggleHidden(id: string, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/admin/${id}/toggle-hidden`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.json();
}

export async function adminDeleteReview(id: string, accessToken: string): Promise<IBackendRes<any>> {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/admin/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.json();
}
