export interface CustomerTableRow {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    ordersCount?: number;
    totalSpent?: number;
    avatar?: string;
}

export interface CustomerListResponse {
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: CustomerTableRow[];
}

export interface ProductTableRow {
    _id: string;
    name: string;
    slug: string;
    category: any;
    price: number;
    stock_quantity: number;
    images: string[];
    isActive: boolean;
    short_description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductListResponse {
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: ProductTableRow[];
}

export interface CategoryTableRow {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CategoryListResponse {
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: CategoryTableRow[];
}

export interface OrderTimeline {
    status: string;
    note: string;
    timestamp: string;
    actionBy: {
        _id: string;
        name: string;
    };
}

export interface OrderTableRow {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    totalAmount: number;
    shippingAddress: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    items: any[];
    timeline: OrderTimeline[];
    couponCode?: string;
    discountValue?: number;
    discountType?: string;
    minOrderValue?: number;
}

export interface OrderListResponse {
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: OrderTableRow[];
}

export interface AdminSidebarItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    path: string;
}

export interface AdminProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}
