'use client';

import { MessageOutlined, RocketOutlined, SafetyCertificateOutlined, SyncOutlined } from '@ant-design/icons';
import { Col, Flex, Row, Typography } from 'antd';

const { Title, Text } = Typography;

const benefits = [
  {
    icon: <RocketOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: 'Giao hàng nhanh chóng',
    desc: 'Miễn phí cho đơn hàng từ 2tr'
  },
  {
    icon: <SyncOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: 'Đổi trả linh hoạt',
    desc: 'Bảo hành chính hãng 12 tháng'
  },
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: 'Thanh toán an toàn',
    desc: 'Đa dạng phương thức bảo mật'
  },
  {
    icon: <MessageOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: 'Hỗ trợ tận tâm',
    desc: 'Tư vấn kỹ thuật chuyên nghiệp'
  }
];

export default function BenefitsBar() {
  return (
    <div style={{ backgroundColor: '#f9fbff', padding: '40px 24px', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[24, 24]}>
          {benefits.map((benefit, idx) => (
            <Col xs={24} sm={12} md={6} key={idx}>
              <Flex align="center" gap="middle">
                {benefit.icon}
                <div>
                  <Title level={5} style={{ margin: 0, fontWeight: 600 }}>{benefit.title}</Title>
                  <Text style={{ color: '#888', fontSize: 13 }}>{benefit.desc}</Text>
                </div>
              </Flex>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
