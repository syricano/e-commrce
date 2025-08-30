import CrudPage from './_CrudPage';

export default function ManageInvoices() {
  return (
    <CrudPage
      title="Invoices"
      base="/payments"
      inputSize="sm"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'orderId', label: 'Order' },
        { key: 'provider', label: 'Provider' },
        { key: 'transactionId', label: 'Txn ID' },
        { key: 'status', label: 'Status' },
        { key: 'amount', label: 'Amount' },
        { key: 'currency', label: 'Currency' },
        { key: 'capturedAt', label: 'Captured At' },
      ]}
      showRowActions={false}
    />
  );
}

