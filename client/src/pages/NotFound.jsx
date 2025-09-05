import React from 'react'
import { useLang } from '@/context/LangProvider';

const NotFound = () => {
  const { t } = useLang();
  return (
    <div>{t('Not found') || 'Not found'}</div>
  )
}

export default NotFound
