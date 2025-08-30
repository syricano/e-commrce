import CrudPage from './_CrudPage';
import { useLang } from '@/context/LangProvider';

export default function ManageCollections() {
  const { t } = useLang();
  return (
    <CrudPage
      title="ManageCollections"
      base="/collections"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'key', label: 'Key', editable: true, create: true },
        { key: 'type', label: 'Type', editable: true, create: true },
        { key: 'isActive', label: 'Active', type: 'bool', editable: true, create: true },
      ]}
    />
  );
}
