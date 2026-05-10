import { MessageOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface ChatToggleProps {
  onClick: () => void;
}

export default function ChatToggle({ onClick }: ChatToggleProps) {
  return (
    <Button
      type="primary"
      shape="circle"
      size="large"
      icon={<MessageOutlined style={{ fontSize: 28 }} />}
      className="chat-toggle-btn"
      onClick={onClick}
    />
  );
}
