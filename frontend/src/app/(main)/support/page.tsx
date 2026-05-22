'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, List, Typography, Space, Flex, Card, Spin, Avatar } from 'antd';
import { SendOutlined, CustomerServiceOutlined, UserOutlined } from '@ant-design/icons';
import { useSocket } from '@/providers/socket.provider';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Text, Title } = Typography;

interface IMessage {
    _id?: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt?: string;
}

export default function SupportPage() {
    const { data: session, status } = useSession();
    const { socket, isAdminOnline } = useSocket();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [input, setInput] = useState('');
    const [historyLoading, setHistoryLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const user = session?.user as any;
    const userId = user?._id || user?.id;
    const adminId = 'ADMIN';

    useEffect(() => {
        if (!socket || !userId) return;

        // Lắng nghe tin nhắn mới từ socket toàn cục
        socket.on('new_message', (msg: any) => {
            setMessages((prev) => [...prev, msg]);
        });

        // Lấy lịch sử chat
        const fetchHistory = async () => {
            try {
                setHistoryLoading(true);
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
                const res = await fetch(`${backendUrl}/api/v1/chat/history/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${session?.accessToken}`
                    }
                });
                if (!res.ok) throw new Error('Network response was not ok');
                const result = await res.json();
                if (result && result.data) setMessages(result.data);
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
            } finally {
                setHistoryLoading(false);
            }
        };
        fetchHistory();

        return () => {
            socket.off('new_message');
        };
    }, [socket, userId, session?.accessToken]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSendMessage = () => {
        if (!input.trim() || !socket || !userId) return;

        socket.emit('send_message', {
            senderId: userId,
            receiverId: adminId,
            content: input,
            roomId: userId,
        });
        setInput('');
    };

    if (status === 'loading' || (status === 'authenticated' && historyLoading)) {
        return (
            <Flex justify="center" align="center" style={{ minHeight: '80vh' }}>
                <Spin size="large" tip="Đang kết nối với tổng đài..." />
            </Flex>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <Flex justify="center" align="center" style={{ minHeight: '80vh', padding: '0 20px' }}>
                <Card style={{ textAlign: 'center', maxWidth: 450, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <CustomerServiceOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
                    <Title level={3}>Hỗ trợ trực tuyến</Title>
                    <Text type="secondary">Vui lòng đăng nhập để chúng tôi có thể hỗ trợ bạn tốt nhất.</Text>
                    <div style={{ marginTop: 24 }}>
                        <Button type="primary" size="large" onClick={() => window.location.href = '/login'}>Đăng nhập ngay</Button>
                    </div>
                </Card>
            </Flex>
        );
    }

    return (
        <Content style={{ padding: '40px 20px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
            <Card 
                title={
                    <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                        <Space size="middle">
                            <Avatar 
                                size="large" 
                                icon={<CustomerServiceOutlined />} 
                                style={{ backgroundColor: '#1677ff', boxShadow: '0 2px 8px rgba(22, 119, 255, 0.3)' }} 
                            />
                            <div>
                                <Title level={5} style={{ margin: 0 }}>Trung tâm hỗ trợ</Title>
                                <Text type={isAdminOnline ? "success" : "secondary"} style={{ fontSize: 12 }}>
                                    {isAdminOnline ? '● Trực tuyến' : '○ Ngoại tuyến'}
                                </Text>
                            </div>
                        </Space>
                    </Flex>
                }
                style={{ height: '75vh', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', borderRadius: '20px', border: 'none', overflow: 'hidden' }}
                styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 } }}
            >
                <div 
                    ref={scrollRef}
                    style={{ flex: 1, overflowY: 'auto', padding: '30px', background: '#f0f2f5', backgroundImage: 'radial-gradient(#d1d1d1 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}
                >
                    <List
                        dataSource={messages}
                        renderItem={(item) => {
                            const isMe = String(item.senderId) === String(userId);
                            return (
                                <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 20 }}>
                                    {!isMe && (
                                        <Avatar size="small" icon={<CustomerServiceOutlined />} style={{ marginRight: 8, marginTop: 4, backgroundColor: '#8c8c8c' }} />
                                    )}
                                    <div style={{ maxWidth: '75%' }}>
                                        <div style={{ 
                                            padding: '12px 18px', 
                                            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            backgroundColor: isMe ? '#1677ff' : '#fff',
                                            color: isMe ? '#fff' : '#262626',
                                            boxShadow: isMe ? '0 4px 12px rgba(22, 119, 255, 0.25)' : '0 4px 12px rgba(0,0,0,0.05)',
                                            fontSize: '14.5px',
                                            lineHeight: '1.5'
                                        }}>
                                            {item.content}
                                        </div>
                                        <div style={{ 
                                            fontSize: '11px', 
                                            marginTop: 5, 
                                            color: '#8c8c8c', 
                                            textAlign: isMe ? 'right' : 'left',
                                            padding: '0 4px'
                                        }}>
                                            {dayjs(item.createdAt).format('HH:mm')}
                                        </div>
                                    </div>
                                    {isMe && (
                                        <Avatar size="small" icon={<UserOutlined />} style={{ marginLeft: 8, marginTop: 4, backgroundColor: '#1677ff' }} />
                                    )}
                                </div>
                            );
                        }}
                    />
                </div>

                <div style={{ padding: '24px 30px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                    <Flex gap="middle">
                        <Input 
                            size="large"
                            placeholder="Gửi tin nhắn cho chúng tôi..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onPressEnter={handleSendMessage}
                            style={{ borderRadius: '12px', border: '1px solid #d9d9d9' }}
                        />
                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<SendOutlined />} 
                            onClick={handleSendMessage}
                            style={{ borderRadius: '12px', height: '45px', width: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        />
                    </Flex>
                </div>
            </Card>
        </Content>
    );
}
