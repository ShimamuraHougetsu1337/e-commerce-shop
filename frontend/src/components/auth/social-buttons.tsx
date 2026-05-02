"use client";

import { GithubOutlined, GoogleOutlined } from "@ant-design/icons";
import { Button, Flex, theme } from "antd";
import { signIn } from "next-auth/react";

const { useToken } = theme;

export default function SocialButtons() {
  const { token } = useToken();

  return (
    <Flex gap={token.marginMD} wrap="wrap" style={{ width: "100%" }}>
      <Button
        size="large"
        icon={<GoogleOutlined />}
        style={{ flex: 1, minWidth: "140px", fontWeight: 500, color: token.colorTextSecondary }}
        onClick={() => signIn('google', { callbackUrl: '/' })}
      >
        Google
      </Button>
      <Button
        size="large"
        icon={<GithubOutlined />}
        style={{ flex: 1, minWidth: "140px", fontWeight: 500, color: token.colorTextSecondary }}
        onClick={() => signIn('github', { callbackUrl: '/' })}
      >
        Github
      </Button>
    </Flex>
  );
}
