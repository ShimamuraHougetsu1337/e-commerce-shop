import { useState } from 'react';
import { TablePaginationConfig } from 'antd';
import { ProductListResponse, ProductTableRow } from '@/types/admin';
import { createProduct, deleteProduct, fetchProductsList, updateProduct } from '@/utils/admin.api';
import { message } from 'antd';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';

interface UseProductTableProps {
    initialData: IBackendRes<ProductListResponse>;
    session: any;
    form: any;
}

export function useProductTable({ initialData, session, form }: UseProductTableProps) {
    const t = useTranslations('AdminProducts');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductTableRow | null>(null);
    const [viewingProduct, setViewingProduct] = useState<ProductTableRow | null>(null);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [sort, setSort] = useState<string>('-createdAt');

    const [pagination, setPagination] = useState({
        current: initialData.data?.meta?.current || 1,
        pageSize: initialData.data?.meta?.pageSize || 10,
    });

    const { data: productsRes, mutate, isLoading: swrLoading } = useSWR(
        session?.accessToken ? ['products', pagination.current, pagination.pageSize, searchText, sort] : null,
        () => fetchProductsList({
            current: pagination.current,
            pageSize: pagination.pageSize,
            query: searchText,
            sort: sort,
            accessToken: session?.accessToken
        }),
        {
            fallbackData: initialData,
            keepPreviousData: true,
        }
    );

    const handleTableChange = (pagination: TablePaginationConfig, filters: any, sorter: any) => {
        if (pagination.current && pagination.pageSize) {
            setPagination({
                current: pagination.current,
                pageSize: pagination.pageSize
            });
        }
        if (sorter.order) {
            setSort(sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`);
        } else {
            setSort('-createdAt');
        }
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleDelete = async (id: string) => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const res = await deleteProduct(id, session.accessToken);
            if (res.data) {
                message.success(t('deleteSuccess'));
                mutate();
            } else {
                message.error(res.message || t('deleteError'));
            }
        } catch (error) {
            message.error(t('serverError'));
        } finally {
            setLoading(false);
        }
    };

    const handleModalOk = async () => {
        if (!session?.accessToken) return;
        try {
            const values = await form.validateFields();
            setLoading(true);

            const { images, ...restValues } = values;
            const payload = {
                ...restValues,
                images: images || []
            };

            if (editingProduct) {
                payload.id = editingProduct._id;
            }

            let res;
            if (editingProduct) {
                res = await updateProduct(editingProduct._id, payload, session.accessToken);
            } else {
                res = await createProduct(payload, session.accessToken);
            }

            if (res.data) {
                message.success(editingProduct ? t('updateSuccess') : t('addSuccess'));
                setIsModalOpen(false);
                mutate();
            } else {
                message.error(res.message || t('errorOccurred'));
            }
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        productsRes,
        loading,
        setLoading,
        uploading,
        setUploading,
        isModalOpen,
        setIsModalOpen,
        editingProduct,
        setEditingProduct,
        viewingProduct,
        setViewingProduct,
        isViewDrawerOpen,
        setIsViewDrawerOpen,
        searchText,
        setSearchText,
        sort,
        setSort,
        pagination,
        setPagination,
        swrLoading,
        mutate,
        handleTableChange,
        handleSearch,
        handleDelete,
        handleModalOk
    };
}
