'use client';
import { ExportOutlined, PlusOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Space, Typography } from 'antd';

const { Title } = Typography;

interface CustomersPageHeaderProps {
    breadcrumb?: string[];
    title: string;
    onExport?: () => void;
    onAdd?: () => void;
    addLabel?: string;
}

const CustomersPageHeader = ({
    breadcrumb = ['Admin', 'Khách hàng'],
    title,
    addLabel = 'Thêm khách hàng',
}: CustomersPageHeaderProps) => {
    return (
        <div
            style={{
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
            }}
        >
            <div>
                <Breadcrumb
                    items={breadcrumb.map((b) => ({ title: b }))}
                    style={{ marginBottom: 8 }}
                />
                <Title level={3} style={{ margin: 0 }}>
                    {title}
                </Title>
            </div>
            <Space>
                <Button icon={<ExportOutlined />}>Xuất dữ liệu</Button>
                <Button type="primary" icon={<PlusOutlined />}>
                    {addLabel}
                </Button>
            </Space>
        </div>
    );
};

export default CustomersPageHeader;
