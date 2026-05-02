'use client';

import { updateProfileApi } from '@/utils/user.api';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Divider, Form, Input, Row, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const { Title, Text } = Typography;

interface AccountSettingsProps {
    user: any;
    accessToken: string;
    onNameUpdate?: (newName: string) => void;
}

const AccountSettings = ({ user, accessToken, onNameUpdate }: AccountSettingsProps) => {
    const { message } = App.useApp();
    const { update } = useSession();
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    const handleUpdateProfile = async (values: any) => {
        setIsProfileLoading(true);
        try {
            const res = await updateProfileApi({ name: values.displayName }, accessToken);
            if (res && res.data) {
                message.success('Cập nhật tên hiển thị thành công!');
                onNameUpdate?.(values.displayName);
                // Cập nhật JWT token để tên mới tồn tại sau khi refresh trang
                await update({ name: values.displayName });
            } else {
                message.error(res?.message || 'Có lỗi xảy ra khi cập nhật tên');
            }
        } catch (error) {
            message.error('Lỗi hệ thống, vui lòng thử lại sau');
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handleChangePassword = async (values: any) => {
        setIsPasswordLoading(true);
        try {
            const res = await updateProfileApi({ 
                oldPassword: values.oldPassword, 
                newPassword: values.newPassword 
            }, accessToken);

            if (res && res.data) {
                message.success('Đổi mật khẩu thành công!');
                passwordForm.resetFields();
            } else {
                message.error(res?.message || 'Mật khẩu cũ không chính xác hoặc có lỗi xảy ra');
            }
        } catch (error) {
            message.error('Lỗi hệ thống, vui lòng thử lại sau');
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <Card bordered={false} className="profile-card">
            {/* Form Cập nhật thông tin */}
            <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ margin: 0 }}>Thông tin cá nhân</Title>
                <Text type="secondary">Quản lý tên hiển thị và email của bạn</Text>
            </div>

            <Form
                form={profileForm}
                layout="vertical"
                initialValues={{
                    email: user?.email,
                    displayName: user?.name
                }}
                onFinish={handleUpdateProfile}
            >
                <Form.Item label="Tên hiển thị" name="displayName" rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị' }]}>
                    <Input size="large" placeholder="Tên hiển thị trên website" />
                </Form.Item>

                <Form.Item 
                    label="Địa chỉ Email" 
                    name="email" 
                    extra="Email không thể thay đổi để đảm bảo tính bảo mật."
                >
                    <Input 
                        size="large" 
                        prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
                        disabled 
                    />
                </Form.Item>

                <Button 
                    type="primary" 
                    size="large" 
                    htmlType="submit" 
                    className="action-btn" 
                    loading={isProfileLoading}
                >
                    Lưu thay đổi
                </Button>
            </Form>

            <Divider style={{ margin: '40px 0' }} />

            {/* Form Đổi mật khẩu */}
            <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ margin: 0 }}>Thay đổi mật khẩu</Title>
                <Text type="secondary">Đảm bảo an toàn cho tài khoản của bạn</Text>
            </div>

            <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
            >
                <Form.Item 
                    label="Mật khẩu hiện tại" 
                    name="oldPassword"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                >
                    <Input.Password size="large" prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="••••••••" />
                </Form.Item>

                <Row gutter={24}>
                    <Col xs={24} sm={12}>
                        <Form.Item 
                            label="Mật khẩu mới" 
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự' }
                            ]}
                        >
                            <Input.Password size="large" prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Mật khẩu mới" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item 
                            label="Xác nhận mật khẩu" 
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password size="large" prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Nhập lại mật khẩu mới" />
                        </Form.Item>
                    </Col>
                </Row>

                <Button 
                    type="primary" 
                    size="large" 
                    htmlType="submit" 
                    className="action-btn" 
                    style={{ background: '#22c55e', borderColor: '#22c55e' }} 
                    loading={isPasswordLoading}
                >
                    Cập nhật mật khẩu
                </Button>
            </Form>
        </Card>
    );
};

export default AccountSettings;
