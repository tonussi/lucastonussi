import { Navigate } from 'react-router'

// Purchasing Inventory is the home page now; keep the old URL working.
export default function PurchasingInventoryRedirect() {
  return <Navigate to="/" replace />
}
