'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Col, Row, Space, Typography, App } from 'antd';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { fetchSpinHistory, fetchSpinStatus, performSpinApi } from '@/utils/gamification.api';
import './lucky-wheel.css';

import HistoryCard from './components/history-card';
import ResultModal from './components/result-modal';
import RulesCard from './components/rules-card';
import WheelSection from './components/wheel-section';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

interface LuckyWheelProps {
    initialStatus?: any;
    initialHistory?: any[];
}

export default function LuckyWheel({ initialStatus, initialHistory }: LuckyWheelProps) {
    const t = useTranslations('Gamification');
    const { data: session } = useSession();
    const { message } = App.useApp();
    const router = useRouter()

    const wheelData = useMemo(() => [
        { option: '5%', style: { backgroundColor: '#FF4D4F', textColor: '#ffffff' } },
        { option: '10%', style: { backgroundColor: '#FFA940', textColor: '#ffffff' } },
        { option: '20k', style: { backgroundColor: '#FF4D4F', textColor: '#ffffff' } },
        { option: '50k', style: { backgroundColor: '#FADB14', textColor: '#D46B08' } },
        { option: t('tryAgain'), style: { backgroundColor: '#F0F2F5', textColor: '#595959' } },
        { option: '10%', style: { backgroundColor: '#FFA940', textColor: '#ffffff' } },
        { option: '5%', style: { backgroundColor: '#FF4D4F', textColor: '#ffffff' } },
        { option: t('goodLuck'), style: { backgroundColor: '#F0F2F5', textColor: '#595959' } },
    ], [t]);

    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [canSpin, setCanSpin] = useState(initialStatus?.canSpin ?? true);
    const [history, setHistory] = useState<any[]>(initialHistory ?? []);
    const [loading, setLoading] = useState(!initialHistory);
    const [showResult, setShowResult] = useState(false);
    const [reward, setReward] = useState<any>(null);

    useEffect(() => {
        if (session?.accessToken && !initialHistory) {
            loadInitialData();
        }
    }, [session, initialHistory]);

    const loadInitialData = async () => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const [statusRes, historyRes] = await Promise.all([
                fetchSpinStatus(session.accessToken),
                fetchSpinHistory(session.accessToken)
            ]);
            if (statusRes?.data) setCanSpin(statusRes.data.canSpin);
            if (historyRes?.data) setHistory(historyRes.data);
        } catch (error) {
            console.error(error);
            message.error(t('loadDataError'));
        } finally {
            setLoading(false);
        }
    };

    const handleSpin = async () => {
        if (mustSpin || !canSpin || !session?.accessToken) return;
        try {
            const res = await performSpinApi(session.accessToken);
            if (res && res.data) {
                setPrizeNumber(res.data.prizeIndex);
                setReward(res.data.reward);
                setMustSpin(true);
                router.refresh()
            } else {
                message.error(res?.message || t('spinError'));
            }
        } catch (error) {
            message.error(t('spinError'));
        }
    };

    const handleStopSpinning = () => {
        setMustSpin(false);
        setCanSpin(false);
        setShowResult(true);
        loadInitialData();
    };

    return (
        <div className="lucky-wheel-simple">
            <div className="wheel-hero">
                <Title level={2} style={{ color: '#FF4D4F' }}>{t('title')}</Title>
                <Paragraph type="secondary">{t('description')}</Paragraph>
            </div>

            <Row gutter={[40, 40]} justify="center" align="top">
                <Col xs={24} lg={12}>
                    <WheelSection
                        wheelData={wheelData}
                        mustSpin={mustSpin}
                        prizeNumber={prizeNumber}
                        canSpin={canSpin}
                        onSpin={handleSpin}
                        onStopSpinning={handleStopSpinning}
                    />
                </Col>

                <Col xs={24} lg={10}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <HistoryCard history={history} loading={loading} />
                        <RulesCard />
                    </Space>
                </Col>
            </Row>

            <ResultModal
                visible={showResult}
                onClose={() => setShowResult(false)}
                reward={reward}
            />
        </div>
    );
}