import { SendOutlined } from '@ant-design/icons';
import { Button, Flex, Input } from 'antd';
import { useTranslations } from 'next-intl';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  onSendMessage: () => void;
  disabled?: boolean;
}

export default function ChatInput({ inputValue, setInputValue, isLoading, onSendMessage, disabled }: ChatInputProps) {
  const t = useTranslations('ChatWidget');

  return (
    <div className="chat-input-area">
      <Flex gap={10}>
        <Input
          placeholder={disabled ? "Hệ thống AI hiện đang ngoại tuyến..." : t('chatPlaceholder')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={disabled ? undefined : onSendMessage}
          disabled={isLoading || disabled}
          variant="filled"
          style={{ borderRadius: 10 }}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={disabled ? undefined : onSendMessage}
          loading={isLoading}
          disabled={disabled}
          style={{ height: 40, width: 40 }}
        />
      </Flex>
    </div>
  );
}
