import { useState } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

export function useChat(t: any) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: t('greeting') }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingTooLong, setIsWaitingTooLong] = useState(false);

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
        body: JSON.stringify({
          message: userMsg,
          history: messages
            .filter(m => !m.isError && m.content.trim() !== '')
            .map(m => ({ role: m.role, content: m.content }))
        }),
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

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isWaitingTooLong,
    handleSendMessage
  };
}
