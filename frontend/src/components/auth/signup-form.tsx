"use client";

import React, { useState } from "react";
import { Form, Input, Button, theme, App } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { register } from "@/utils/auth.api";

const { useToken } = theme;

type FieldType = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export default function SignupForm() {

    const { token } = useToken();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { message, notification } = App.useApp();
    const router = useRouter();
    const onFinish = async (values: FieldType) => {
        setIsLoading(true);
        const { name, email, password } = values;
        try {
            const response = await register(name, email, password);
            if (response?.data) {
                message.success({
                    content: response.message,
                    duration: 3
                });
                router.push("/login")
            } else {
                notification.error({
                    message: "Register failed",
                    description: response?.message,
                    duration: 4,
                    placement: "topRight",
                })
                setIsLoading(false);
            }
        } catch (error) {
            notification.error({ message: "Network error" });
            setIsLoading(false);
        }
    };

    return (
        <Form
            name="signup_form"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            requiredMark={false}
            style={{ width: "100%" }}
        >
            <Form.Item<FieldType>
                name="name"
                rules={[
                    { required: true, message: "Please input your name!" },
                ]}
            >
                <Input
                    prefix={<UserOutlined style={{ color: token.colorTextQuaternary, marginRight: token.marginXXS }} />}
                    placeholder="Username"
                />
            </Form.Item>

            <Form.Item<FieldType>
                name="email"
                rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Please enter a valid email address!" },
                ]}
            >
                <Input
                    prefix={<MailOutlined style={{ color: token.colorTextQuaternary, marginRight: token.marginXXS }} />}
                    placeholder="Email"
                />
            </Form.Item>

            <Form.Item<FieldType>
                name="password"
                rules={[{ required: true, message: "Please input your password!" }]}
            >
                <Input.Password
                    prefix={<LockOutlined style={{ color: token.colorTextQuaternary, marginRight: token.marginXXS }} />}
                    placeholder="Password"
                />
            </Form.Item>

            <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                validateTrigger={['onBlur', 'onChange']}
                rules={[
                    { required: true, message: 'Please input your confirm password!' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('The confirm password is not matched!'));
                        },
                    }),
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined style={{ color: token.colorTextQuaternary, marginRight: token.marginXXS }} />}
                    placeholder="Confirm Password"
                />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    style={{ fontWeight: 600 }}
                    loading={isLoading}
                >
                    Sign up
                </Button>
            </Form.Item>
        </Form>
    );
}
