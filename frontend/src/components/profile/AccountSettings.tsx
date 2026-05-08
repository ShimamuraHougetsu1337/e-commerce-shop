'use client';

import { updateProfileApi } from '@/utils/user.api';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Divider, Form, Input, Row, Typography } from 'antd';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface AccountSettingsProps {
    user: any;
    accessToken: string;
    onNameUpdate?: (newName: string) => void;
}

const AccountSettings = ({ user, accessToken, onNameUpdate }: AccountSettingsProps) => {
    const t = useTranslations('AccountSettings');
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
                message.success(t('updateNameSuccess'));
                onNameUpdate?.(values.displayName);
                // Cập nhật JWT token để tên mới tồn tại sau khi refresh trang
                await update({ name: values.displayName });
            } else {
                message.error(res?.message || t('updateNameError'));
            }
        } catch (error) {
            message.error(t('systemError'));
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
                message.success(t('changePasswordSuccess'));
                passwordForm.resetFields();
            } else {
                message.error(res?.message || t('changePasswordError'));
            }
        } catch (error) {
            message.error(t('systemError'));
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <Card bordered={false} className="profile-card">
            {/* Form Cập nhật thông tin */}
            <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ margin: 0 }}>{t('personalInfoTitle')}</Title>
                <Text type="secondary">{t('personalInfoDesc')}</Text>
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
                <Form.Item label={t('displayName')} name="displayName" rules={[{ required: true, message: t('displayNameRequired') }]}>
                    <Input size="large" placeholder={t('displayNamePlaceholder')} />
                </Form.Item>

                <Form.Item 
                    label={t('emailAddress')} 
                    name="email" 
                    extra={t('emailNotChangeable')}
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
                    {t('saveChanges')}
                </Button>
            </Form>

            <Divider style={{ margin: '40px 0' }} />

            {/* Form Đổi mật khẩu */}
            <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ margin: 0 }}>{t('changePasswordTitle')}</Title>
                <Text type="secondary">{t('changePasswordDesc')}</Text>
            </div>

            <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
            >
                <Form.Item 
                    label={t('currentPassword')} 
                    name="oldPassword"
                    rules={[{ required: true, message: t('currentPasswordRequired') }]}
                >
                    <Input.Password size="large" prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="••••••••" />
                </Form.Item>

                <Row gutter={24}>
                    <Col xs={24} sm={12}>
                        <Form.Item 
                            label={t('newPassword')} 
                            name="newPassword"
                            rules={[
                                { required: true, message: t('newPasswordRequired') },
                                { min: 6, message: t('newPasswordMinLength') }
                            ]}
                        >
                            <Input.Password size="large" prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder={t('newPassword')} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item 
                            label={t('confirmPassword')} 
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: t('confirmPasswordRequired') },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(t('passwordMismatch')));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password size="large" prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder={t('reenterNewPassword')} />
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
                    {t('updatePasswordBtn')}
                </Button>
            </Form>
        </Card>
    );
};

export default AccountSettings;
