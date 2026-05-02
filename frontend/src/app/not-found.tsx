import Link from 'next/link'
import { Button, Result } from 'antd'

export default function NotFound() {
    return (
        <Result
            status="404"
            title="404"
            subTitle="Trang bạn đang tìm kiếm không tồn tại."
            extra={
                <Link href="/">
                    <Button type="primary" size="large">
                        Quay về trang chủ
                    </Button>
                </Link>
            }
        />
    )
}