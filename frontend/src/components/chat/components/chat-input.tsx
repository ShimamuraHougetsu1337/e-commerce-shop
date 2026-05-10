import { SendOutlined } from '@ant-design/icons';
import { Button, Flex, Input } from 'antd';
import { useTranslations } from 'next-intl';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  onSendMessage: () => void;
}

export default function ChatInput({ inputValue, setInputValue, isLoading, onSendMessage }: ChatInputProps) {
  const t = useTranslations('ChatWidget');

  return (
    <div className="chat-input-area">
      <Flex gap={10}>
        <Input
          placeholder={t('chatPlaceholder')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={onSendMessage}
          disabled={isLoading}
          variant="filled"
          style={{ borderRadius: 10 }}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={onSendMessage}
          loading={isLoading}
          style={{ height: 40, width: 40 }}
        />
      </Flex>
    </div>
  );
}
