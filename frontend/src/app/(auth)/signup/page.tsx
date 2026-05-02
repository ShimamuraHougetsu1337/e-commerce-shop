"use client";

import SignupForm from "@/components/auth/signup-form";
import SocialButtons from "@/components/auth/social-buttons";
import { Card, ConfigProvider, Divider, Flex, theme, Typography } from "antd";
import Link from "next/link";

const { Title, Text } = Typography;
const { useToken } = theme;

function LoginLayoutContent() {
  const { token } = useToken();

  return (
    <Flex
      align="center"
      justify="center"
      style={{ minHeight: "100vh", backgroundColor: token.colorBgLayout, padding: token.paddingLG }}
    >
      <Flex vertical align="center" style={{ width: "100%", maxWidth: 440 }}>

        <Flex vertical align="center" style={{ marginBottom: token.marginXXL, textAlign: "center" }}>
          <Title level={2} style={{ marginTop: 0, marginBottom: token.marginSM, fontWeight: 800 }}>Create an account</Title>
        </Flex>

        <Card
          style={{
            width: "100%",
            boxShadow: token.boxShadowSecondary,
            border: "none",
            borderRadius: token.borderRadiusLG
          }}
          styles={{ body: { padding: token.paddingXL } }}
        >
          <SignupForm />

          <Flex justify="center" style={{ marginTop: token.marginMD }}>
            <Text type="secondary" style={{ fontSize: token.fontSize }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: token.colorPrimary, fontWeight: 600, textDecoration: "none" }}>
                Login Now!
              </Link>
            </Text>
          </Flex>

          <Divider plain style={{ margin: `${token.marginLG}px 0`, color: token.colorTextSecondary, fontSize: token.fontSizeSM, fontWeight: "normal" }}>
            Or continue with
          </Divider>

          <SocialButtons />
        </Card>
      </Flex>
    </Flex>
  );
}

export default function LoginLayout() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#000000',
          borderRadius: 8,
          colorBgLayout: '#f5f5f5',
          fontFamily: "inherit",
          paddingXL: 40,
        },
      }}
    >
      <LoginLayoutContent />
    </ConfigProvider>
  );
}
