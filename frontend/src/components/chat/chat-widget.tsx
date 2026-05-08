'use client';

import {
  CloseOutlined,
  MessageOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Button, Card, Flex, Input, Spin, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

export default function ChatWidget() {
  const t = useTranslations('ChatWidget');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: t('greeting') }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingTooLong, setIsWaitingTooLong] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống cuối cùng mỗi khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWaitingTooLong]);

  const handleSendMessage = async (retryMessage?: string) => {
    const userMsg = retryMessage || inputValue;
    if (!userMsg.trim()) return;

    if (!retryMessage) setInputValue('');

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userMsg };
    const botMsgId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, newUserMsg, { id: botMsgId, role: 'assistant', content: '' }]);
    setIsLoading(true);
    setIsWaitingTooLong(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const waitingTimer = setTimeout(() => {
      setIsWaitingTooLong(true);
    }, 5000);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      clearTimeout(waitingTimer);
      setIsWaitingTooLong(false);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API_ERROR');
      }

      if (!response.body) throw new Error('NO_BODY');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.substring(6).trim();
            if (!dataStr) continue;

            try {
              let content = '';
              if (dataStr.startsWith('{')) {
                const data = JSON.parse(dataStr);
                content = data.text || '';
              } else {
                content = dataStr;
              }

              if (content.includes('[ERROR_CODE:') || content === 'AI_QUOTA_EXCEEDED' || content === 'AI_GENERIC_ERROR') {
                const errorCode = content.replace('[ERROR_CODE:', '').replace(']', '');
                throw new Error(errorCode);
              }

              if (content) {
                setIsWaitingTooLong(false);
                setMessages(prev => prev.map(msg =>
                  msg.id === botMsgId ? { ...msg, content: msg.content + content } : msg
                ));
              }
            } catch (e: any) {
              if (e.message === 'AI_QUOTA_EXCEEDED' || e.message === 'AI_GENERIC_ERROR') {
                throw e;
              }
              console.error("Parse error:", e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error details:", error);

      let errorMessage = t('systemErrorMsg');
      let errorTitle = t('systemErrorTitle');

      if (error.message?.includes('AI_QUOTA_EXCEEDED') || error.message?.includes('429') || error.message?.includes('quota')) {
        errorTitle = t('systemErrorTitle');
      }
      else if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('AI_TIMEOUT')) {
        errorTitle = t('slowResponseTitle');
      }

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== botMsgId);

        const finalContent = (errorMessage === 'AI_QUOTA_EXCEEDED' || !errorMessage)
          ? t('systemErrorMsg')
          : errorMessage;

        return [...filtered, {
          id: botMsgId,
          role: 'assistant',
          content: finalContent,
          isError: true
        }];
      });
    } finally {
      setIsLoading(false);
      setIsWaitingTooLong(false);
      clearTimeout(timeoutId);
      clearTimeout(waitingTimer);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {isOpen && (
        <Card
          title={
            <Flex align="center" gap={8}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#52c41a', boxShadow: '0 0 8px #52c41a' }} />
              <RobotOutlined style={{ color: '#1677ff', fontSize: 20 }} />
              <Text strong>{t('salesAssistant')}</Text>
            </Flex>
          }
          extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setIsOpen(false)} />}
          style={{ width: 380, height: 550, display: 'flex', flexDirection: 'column', boxShadow: '0 12px 32px rgba(0,0,0,0.2)', borderRadius: 20, marginBottom: 16, border: '1px solid #e6f7ff' }}
          bodyStyle={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)' }}>
            <Flex vertical gap={20}>
              {messages.map(msg => (
                <Flex key={msg.id} gap={10} justify={msg.role === 'user' ? 'flex-end' : 'flex-start'} align="flex-start">
                  {msg.role === 'assistant' && (
                    <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1677ff', flexShrink: 0 }} />
                  )}
                  <div style={{
                    maxWidth: '85%', padding: '12px 16px', borderRadius: 16,
                    background: msg.isError ? '#fff1f0' : (msg.role === 'user' ? 'linear-gradient(135deg, #1677ff 0%, #40a9ff 100%)' : '#fff'),
                    color: msg.role === 'user' ? '#fff' : '#000',
                    border: msg.isError ? '1px solid #ffa39e' : (msg.role === 'user' ? 'none' : '1px solid #e6f7ff'),
                    boxShadow: msg.role === 'assistant' ? '0 2px 12px rgba(0,0,0,0.04)' : '0 4px 12px rgba(22,119,255,0.2)',
                    wordBreak: 'break-word',
                  }}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        {msg.content === '' && isLoading && !msg.isError ? (
                          <Flex align="center" gap={8}>
                            <Spin size="small" />
                            <Text type="secondary" style={{ fontSize: 13 }}>{t('thinking')}</Text>
                          </Flex>
                        ) : (
                          <ReactMarkdown components={{ p: ({ node, ...props }) => <p {...props} style={{ margin: 0 }} /> }}>
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    ) : (
                      <span>{msg.content}</span>
                    )}

                  </div>
                  {msg.role === 'user' && (
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068', flexShrink: 0 }} />
                  )}
                </Flex>
              ))}

              {isWaitingTooLong && (
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" italic style={{ fontSize: 12 }}>
                    {t('processingData')}
                  </Text>
                </div>
              )}
              <div ref={messagesEndRef} />
            </Flex>
          </div>

          <div style={{ padding: 16, borderTop: '1px solid #f0f0f0', background: '#fff' }}>
            <Flex gap={10}>
              <Input
                placeholder={t('chatPlaceholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={() => handleSendMessage()}
                disabled={isLoading}
                variant="filled"
                style={{ borderRadius: 10 }}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                onClick={() => handleSendMessage()}
                loading={isLoading}
                style={{ height: 40, width: 40 }}
              />
            </Flex>
          </div>
        </Card>
      )}

      {!isOpen && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined style={{ fontSize: 28 }} />}
          style={{
            width: 64,
            height: 64,
            boxShadow: '0 6px 16px rgba(22, 119, 255, 0.4)',
            background: 'linear-gradient(135deg, #1677ff 0%, #40a9ff 100%)',
            border: 'none'
          }}
          onClick={() => setIsOpen(true)}
        />
      )}
    </div>
  );
}