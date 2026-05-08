'use client';

import { MessageOutlined, RocketOutlined, SafetyCertificateOutlined, SyncOutlined } from '@ant-design/icons';
import { Col, Flex, Row, Typography } from 'antd';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

const getBenefits = (t: any) => [
  {
    icon: <RocketOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: t('fastDelivery'),
    desc: t('fastDeliveryDesc')
  },
  {
    icon: <SyncOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: t('easyReturn'),
    desc: t('easyReturnDesc')
  },
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: t('securePayment'),
    desc: t('securePaymentDesc')
  },
  {
    icon: <MessageOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: t('dedicatedSupport'),
    desc: t('dedicatedSupportDesc')
  }
];

export default function BenefitsBar() {
  const t = useTranslations('BenefitsBar');
  const benefits = getBenefits(t);
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
