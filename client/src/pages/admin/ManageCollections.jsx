import CrudPage from './_CrudPage';
import { useLang } from '@/context/LangProvider';

export default function ManageCollections() {
  const { t } = useLang();

  // Keep as plain strings so CrudPage renders <option> correctly
  const typeOptions = ['manual', 'rule'];

  return (
    <CrudPage
      title={t('ManageCollections') || 'Manage Collections'}
      base="/collections"
      columns={[
        { key: 'id',       label: (t('ID') || 'ID') },
        { key: 'key',      label: (t('Key') || 'Key'), editable: true, create: true },
        { key: 'type',     label: (t('Type') || 'Type'), type: 'select', options: typeOptions, editable: true, create: true },
        { key: 'isActive', label: (t('Active') || 'Active'), type: 'bool', editable: true, create: true },
      ]}
    />
  );
}
