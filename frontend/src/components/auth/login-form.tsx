"use client";

import { ADMIN_ROLE } from "@/constants";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { App, Button, Form, Input, theme } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { getSession, signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

const { useToken } = theme;

type FieldType = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const t = useTranslations('LoginForm');
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
          message: t('loginFailed'),
          description: response.error,
          placement: "topRight",
        });
        setIsLoading(false);
      } else if (response?.ok) {
        const session = await getSession();

        const redirectPath = session?.user?.role === ADMIN_ROLE ? '/admin/dashboard' : callbackUrl;
        message.success({ content: t('loginSuccess'), duration: 3 });

        router.push(redirectPath);

        router.refresh();
      }
    } catch (error: any) {
      notification.error({
        message: t('networkError'),
        description: t('networkErrorDesc')
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
          { required: true, message: t('emailRequired') },
          { type: "email", message: t('emailInvalid') },
        ]}
      >
        <Input
          prefix={<MailOutlined style={{ color: token.colorTextQuaternary, marginRight: token.marginXXS }} />}
          placeholder={t('emailPlaceholder')}
        />
      </Form.Item>

      <Form.Item<FieldType>
        name="password"
        rules={[{ required: true, message: t('passwordRequired') }]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: token.colorTextQuaternary, marginRight: token.marginXXS }} />}
          placeholder={t('passwordPlaceholder')}
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
          {t('loginButton')}
        </Button>
      </Form.Item>
    </Form>
  );
}