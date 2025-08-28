import CrudPage from './_CrudPage';

export default function ManageCollections() {
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
