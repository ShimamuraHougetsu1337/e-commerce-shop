export { };

declare global {
    interface IRequest {
        url: string;
        method: string;
        body?: { [key: string]: any };
        queryParams?: any;
        useCredentials?: boolean;
        headers?: any;
        nextOption?: any;
        accessToken?: string;
    }

    interface IBackendRes<T> {
        error?: string | string[];
        message: string;
        statusCode: number | string;
        data?: T;
    }

    interface IModelPaginate<T> {
        meta: {
            current: number;
            pageSize: number;
            pages: number;
            total: number;
        },
        result: T[]
    }

    interface IProduct {
        _id: string,
        name: string,
        slug: string,
        long_description: string,
        short_description: string,
        price: number,
        stock_quantity: number,
        category: {
            _id: string;
            name: string;
            slug: string;
        },
        images: string[],
        averageRating: number,
        totalReviews: number,
    }

    interface ICategory {
        _id: string;
        name: string;
        slug: string;
        description: string;
        thumbnail: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }

}
