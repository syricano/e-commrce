// client/src/pages/admin/ManageStores.jsx
import CrudPage from './_CrudPage';
export default function Stores() {
  return (
    <CrudPage
      title="Stores"
      base="/stores"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'ownerUserId', label: 'Owner', editable: true, create: true },
        { key: 'name', label: 'Name', editable: true, create: true },
        { key: 'slug', label: 'Slug', editable: true, create: true },
        { key: 'email', label: 'Email', editable: true, create: true },
        { key: 'phone', label: 'Phone', editable: true, create: true },
        { key: 'address', label: 'Address', editable: true, create: true },
        { key: 'status', label: 'Status', editable: true, create: true },
        { key: 'invoiceEmail', label: 'Invoice Email', editable: true, create: true },
        { key: 'autoInvoice', label: 'Auto Invoice', type: 'bool', editable: true, create: true },
      ]}
    />
  );
}
