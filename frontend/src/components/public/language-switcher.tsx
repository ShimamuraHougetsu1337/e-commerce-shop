'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setUserLocale } from '@/app/actions/locale';
import { useLocale } from 'next-intl';
import { Dropdown, Button } from 'antd';
import { GlobalOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();

  function onSelectChange(newLocale: string) {
    if (newLocale === locale) return;
    startTransition(() => {
      setUserLocale(newLocale).then(() => {
        router.refresh();
      });
    });
  }

  const items: MenuProps['items'] = [
    {
      key: 'vi',
      label: 'Tiếng Việt',
      disabled: isPending,
    },
    {
      key: 'en',
      label: 'English',
      disabled: isPending,
    },
  ];

  return (
    <Dropdown 
      menu={{ 
        items, 
        onClick: (e) => onSelectChange(e.key),
        selectedKeys: [locale]
      }} 
      placement="bottomRight"
      trigger={['click']}
      disabled={isPending}
    >
      <Button type="text" style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <GlobalOutlined style={{ fontSize: 18 }} />
        <span style={{ fontWeight: 500 }}>{locale.toUpperCase()}</span>
        <DownOutlined style={{ fontSize: 12, marginLeft: 2 }} />
      </Button>
    </Dropdown>
  );
}
