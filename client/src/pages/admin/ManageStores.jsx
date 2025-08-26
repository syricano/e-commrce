// client/src/pages/admin/Stores.jsx
import CrudPage from './_CrudPage';
export default function Stores() {
  return (
    <CrudPage
      title="Stores"
      base="/stores"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name', editable: true, create: true },
        { key: 'slug', label: 'Slug', editable: true, create: true },
        { key: 'isActive', label: 'Active', type: 'bool', editable: true, create: true },
      ]}
    />
  );
}
