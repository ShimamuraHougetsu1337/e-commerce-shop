"use client";

import { Button, Typography } from 'antd';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const Wheel = dynamic(() => import('react-custom-roulette').then((mod) => mod.Wheel), { ssr: false });

const { Text } = Typography;

interface WheelSectionProps {
    wheelData: any[];
    mustSpin: boolean;
    prizeNumber: number;
    canSpin: boolean;
    onSpin: () => void;
    onStopSpinning: () => void;
}

export default function WheelSection({ wheelData, mustSpin, prizeNumber, canSpin, onSpin, onStopSpinning }: WheelSectionProps) {
    const t = useTranslations('Gamification');

    return (
        <div className="wheel-container">
            <div className="wheel-frame">
                <Wheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={wheelData}
                    onStopSpinning={onStopSpinning}
                    outerBorderColor="#FFE58F"
                    outerBorderWidth={12}
                    innerBorderColor="#FFC53D"
                    innerBorderWidth={25}
                    radiusLineColor="#ffffff"
                    radiusLineWidth={3}
                    fontSize={22}
                    textDistance={65}
                    perpendicularText={true}
                    pointerProps={{
                        style: { transform: 'rotate(0deg)' }
                    }}
                />
            </div>

            {(!canSpin && !mustSpin) ? (
                <div className="out-of-spins-container">
                    <Text strong style={{ fontSize: 16, color: '#595959', display: 'block' }}>
                        {t('alreadySpun')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                        Hãy quay lại vào ngày mai để nhận thêm lượt nhé!
                    </Text>
                </div>
            ) : (
                <Button
                    type="primary"
                    size="large"
                    onClick={onSpin}
                    disabled={mustSpin}
                    className="spin-button"
                >
                    {mustSpin ? t('spinning') : t('spinNow')}
                </Button>
            )}
        </div>
    );
}
