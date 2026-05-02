'use client';
import { Breadcrumb, Space, Typography } from 'antd';

const { Title } = Typography;

interface DashboardPageHeaderProps {
    breadcrumb?: string[];
    title: string;
    onExport?: () => void;
    onAdd?: () => void;
    addLabel?: string;
}

const DashboardPageHeader = ({
    breadcrumb = ['Admin', 'Tổng quan'],
    title,
}: DashboardPageHeaderProps) => {
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
        </div>
    );
};

export default DashboardPageHeader;
