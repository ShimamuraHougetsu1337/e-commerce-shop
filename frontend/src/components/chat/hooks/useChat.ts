import { useState, useCallback } from 'react';

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
  const [isOffline, setIsOffline] = useState(false);

  const checkChatStatus = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chat/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.status !== 'ok') throw new Error();
      setIsOffline(false);
      setMessages(prev => prev.filter(m => m.id !== 'offline-msg'));
    } catch (err) {
      clearTimeout(timeoutId);
      setIsOffline(true);
      setMessages(prev => {
        if (prev.some(m => m.id === 'offline-msg')) return prev;
        return [
          ...prev,
          {
            id: 'offline-msg',
            role: 'assistant',
            content: '⚠️ Hệ thống AI hiện đang ngoại tuyến hoặc bảo trì. Chức năng tự động hỗ trợ tạm thời không khả dụng. Xin lỗi vì sự bất tiện này!',
            isError: true
          }
        ];
      });
    }
  }, []);

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
        let errorMessage = 'API_ERROR';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || 'API_ERROR';
        } catch {
          try {
            errorMessage = await response.text();
          } catch {}
        }
        throw new Error(errorMessage);
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
              let isErrorData = false;
              let errorMsg = '';

              if (dataStr.startsWith('{')) {
                const data = JSON.parse(dataStr);
                if (data.statusCode && data.statusCode >= 400) {
                  isErrorData = true;
                  errorMsg = data.message || 'CHAT_SERVICE_ERROR';
                } else {
                  content = data.text || '';
                }
              } else {
                content = dataStr;
              }

              if (isErrorData) {
                throw new Error(errorMsg);
              }

              if (
                content === 'CHAT_SERVICE_ERROR' ||
                content.includes('[ERROR_CODE:') ||
                content === 'AI_QUOTA_EXCEEDED' ||
                content === 'AI_GENERIC_ERROR'
              ) {
                const errorCode = content
                  .replace('[ERROR_CODE:', '')
                  .replace(']', '');
                throw new Error(errorCode);
              }

              if (content) {
                setIsWaitingTooLong(false);
                setMessages(prev => prev.map(msg =>
                  msg.id === botMsgId ? { ...msg, content: msg.content + content } : msg
                ));
              }
            } catch (e: any) {
              if (e instanceof SyntaxError) {
                console.error("JSON parse error on line:", dataStr, e);
              } else {
                throw e;
              }
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
    isOffline,
    checkChatStatus,
    handleSendMessage
  };
}
