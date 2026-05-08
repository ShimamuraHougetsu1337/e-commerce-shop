import { Button, Result } from 'antd'
import Link from 'next/link'
import { useTranslations } from 'next-intl';

export default function NotFound() {
    const t = useTranslations('NotFoundPage');
    return (
        <Result
            status="404"
            title="404"
            subTitle={t('pageNotFound')}
            extra={
                <Link href="/">
                    <Button type="primary" size="large">
                        {t('backToHome')}
                    </Button>
                </Link>
            }
        />
    )
}