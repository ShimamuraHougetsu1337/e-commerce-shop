"use client";

import { ADMIN_ROLE } from "@/constants";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { App, Button, Form, Input, theme } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { getSession, signIn } from "next-auth/react";

const { useToken } = theme;

type FieldType = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { token } = useToken();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { message, notification } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const onFinish = async (values: FieldType) => {
    setIsLoading(true);
    const { email, password } = values;

    try {

      const response = await signIn("credentials", {
        username: email,
        password,
        redirect: false,
      });

      console.log(response)
      if (response?.error) {

        notification.error({
          message: "Đăng nhập thất bại",
          description: response.error,
          placement: "topRight",
        });
        setIsLoading(false);
      } else if (response?.ok) {
        const session = await getSession();

        const redirectPath = session?.user?.role === ADMIN_ROLE ? '/admin/dashboard' : callbackUrl;
        message.success({ content: "Đăng nhập thành công", duration: 3 });

        router.push(redirectPath);

        router.refresh();
      }
    } catch (error: any) {
      notification.error({
        message: "Lỗi mạng",
        description: "Đã có lỗi xảy ra, vui lòng thử lại"
      });
      setIsLoading(false);
    }
  };

  return (
    <Form
      name="signin_form"
      layout="vertical"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      size="large"
      requiredMark={false}
      style={{ width: "100%" }}
    >
      <Form.Item<FieldType>
        name="email"
        rules={[
          { required: true, message: "Vui lòng nhập email!" },
          { type: "email", message: "Vui lòng nhập email hợp lệ!" },
        ]}
      >
        <Input
          prefix={<MailOutlined style={{ color: token.colorTextQuaternary, marginRight: token.marginXXS }} />}
          placeholder="Email"
        />
      </Form.Item>

      <Form.Item<FieldType>
        name="password"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: token.colorTextQuaternary, marginRight: token.marginXXS }} />}
          placeholder="Password"
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
          Đăng nhập
        </Button>
      </Form.Item>
    </Form>
  );
}