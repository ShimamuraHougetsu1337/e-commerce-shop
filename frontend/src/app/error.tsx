'use client';

import { Result, Button } from 'antd';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Error({ error, reset }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations('ErrorPage');
    useEffect(() => {
        console.error('Next.js caught an error:', error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-[70vh] bg-[#f5f7fa] p-4">
            <div className="bg-white px-8 py-10 rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full transition-all hover:shadow-md">
                <Result
                    status="500"
                    title={<span className="text-2xl font-bold text-gray-800">{t('serverErrorTitle')}</span>}
                    subTitle={
                        <span className="text-gray-500 text-base">
                            {t('serverErrorDesc')}
                        </span>
                    }
                />
            </div>
        </div>
    );
}