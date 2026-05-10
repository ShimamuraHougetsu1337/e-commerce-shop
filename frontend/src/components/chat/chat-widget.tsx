'use client';

import { CloseOutlined, RobotOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Typography } from 'antd';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { useChat } from './hooks/useChat';
import ChatMessageList from './components/chat-message-list';
import ChatInput from './components/chat-input';
import ChatToggle from './components/chat-toggle';
import './chat-widget.css';

const { Text } = Typography;

export default function ChatWidget() {
  const t = useTranslations('ChatWidget');
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isWaitingTooLong,
    handleSendMessage
  } = useChat(t);

  return (
    <div className="chat-widget-wrapper">
      {isOpen && (
        <Card
          className="chat-window-card"
          title={
            <Flex align="center" gap={8}>
              <div className="chat-status-dot" />
              <RobotOutlined style={{ color: '#1677ff', fontSize: 20 }} />
              <Text strong>{t('salesAssistant')}</Text>
            </Flex>
          }
          extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setIsOpen(false)} />}
        >
          <ChatMessageList 
            messages={messages} 
            isLoading={isLoading} 
            isWaitingTooLong={isWaitingTooLong} 
          />
          <ChatInput 
            inputValue={inputValue}
            setInputValue={setInputValue}
            isLoading={isLoading}
            onSendMessage={() => handleSendMessage()}
          />
        </Card>
      )}

      {!isOpen && (
        <ChatToggle onClick={() => setIsOpen(true)} />
      )}
    </div>
  );
}