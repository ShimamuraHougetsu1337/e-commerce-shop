import { updateProfileApi, getAvatarUrl } from '@/utils/user.api';
import { LockOutlined, MailOutlined, UploadOutlined, UserOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Divider, Form, Input, Row, Typography, Upload, Avatar, Spin, Switch } from 'antd';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface AccountSettingsProps {
    user: any;
    avatar: string;
    accessToken: string;
    onNameUpdate?: (newName: string) => void;
}

const AccountSettings = ({ user, avatar, accessToken, onNameUpdate }: AccountSettingsProps) => {
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
            const res = await updateProfileApi({ 
                name: values.displayName,
                phone: values.phone,
                address: values.address,
                avatar: avatar,
                receiveNotifications: values.receiveNotifications,
                sendOrderToEmail: values.sendOrderToEmail
            }, accessToken);
            
            if (res && res.data) {
                message.success(t('updateProfileSuccess'));
                onNameUpdate?.(values.displayName);
                // Cập nhật JWT token để thông tin mới tồn tại sau khi refresh trang
                await update({ 
                    name: values.displayName,
                    phone: values.phone,
                    address: values.address,
                    avatar: avatar,
                    receiveNotifications: values.receiveNotifications,
                    sendOrderToEmail: values.sendOrderToEmail
                });
            } else {
                message.error(res?.message || t('updateProfileError'));
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

            <Row gutter={[32, 32]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={24}>
                    <Form
                        form={profileForm}
                        layout="vertical"
                        initialValues={{
                            email: user?.email,
                            displayName: user?.name,
                            phone: user?.phone,
                            address: user?.address,
                            receiveNotifications: user?.receiveNotifications !== false,
                            sendOrderToEmail: user?.sendOrderToEmail !== false
                        }}
                        onFinish={handleUpdateProfile}
                    >
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item label={t('displayName')} name="displayName" rules={[{ required: true, message: t('displayNameRequired') }]}>
                                    <Input size="large" placeholder={t('displayNamePlaceholder')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item 
                                    label={t('phone')} 
                                    name="phone" 
                                    rules={[
                                        { pattern: /^[0-9+]{9,15}$/, message: t('phoneInvalid') }
                                    ]}
                                >
                                    <Input size="large" prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} placeholder={t('phonePlaceholder')} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item 
                            label={t('address')} 
                            name="address" 
                        >
                            <Input.TextArea rows={2} placeholder={t('addressPlaceholder')} style={{ borderRadius: 8 }} />
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

                        <Divider style={{ margin: '24px 0' }} />
                        <Title level={5} style={{ marginBottom: 20 }}>{t('preferencesTitle')}</Title>
                        
                        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                            <Col xs={24} sm={12}>
                                <Form.Item 
                                    name="receiveNotifications" 
                                    valuePropName="checked"
                                    label={t('receiveNotificationsLabel')}
                                    help={t('receiveNotificationsDesc')}
                                >
                                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item 
                                    name="sendOrderToEmail" 
                                    valuePropName="checked"
                                    label={t('sendOrderToEmailLabel')}
                                    help={t('sendOrderToEmailDesc')}
                                >
                                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                                </Form.Item>
                            </Col>
                        </Row>

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
                </Col>
            </Row>

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
