'use client';

import { useEffect } from 'react';
import { Result } from 'antd';

export default function Error({ error, reset }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Next.js caught an error:', error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-[70vh] bg-[#f5f7fa]">
            <Result
                status="500"
                title="500 - Server Error"
                subTitle="Sorry, something went wrong on our end. Please try again later."
            >
            </Result>
        </div>
    );
}
