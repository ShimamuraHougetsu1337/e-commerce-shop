import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Flex, Spin, Typography } from 'antd';
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslations } from 'next-intl';
import { Message } from '../hooks/useChat';

const { Text } = Typography;

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  isWaitingTooLong: boolean;
}

export default function ChatMessageList({ messages, isLoading, isWaitingTooLong }: ChatMessageListProps) {
  const t = useTranslations('ChatWidget');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống cuối cùng mỗi khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWaitingTooLong]);

  return (
    <div className="chat-message-list-container">
      <Flex vertical gap={20}>
        {messages.map(msg => (
          <Flex key={msg.id} gap={10} justify={msg.role === 'user' ? 'flex-end' : 'flex-start'} align="flex-start">
            {msg.role === 'assistant' && (
              <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1677ff', flexShrink: 0 }} />
            )}
            <div className={`chat-message-bubble ${
              msg.isError ? 'chat-message-error' : 
              (msg.role === 'user' ? 'chat-message-user' : 'chat-message-assistant')
            }`}>
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
  );
}
