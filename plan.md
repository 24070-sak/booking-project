# Display Payment Information in Payment Tab

The user wants to display every payment operation in the "Payments" tab (`activeTab === 'payments'`). Currently, the code maps over `payments` and displays them in a table inside `.payment-summary`, but we will make sure the table is fully populated and visible.

## Proposed Changes

### [MODIFY] DashboardReservations.jsx
- The user essentially wants to ensure the `payments` array (which represents every payment operation) is displayed in the lower section (table or cards) when the "Paiements" tab is active. 
- The current code already maps over the `payments` list inside a table. I will need to ensure there are no bugs preventing its display, and ensure the `.model-body` styling or layout matches their request if they meant displaying the modal when clicking on a row.
- Add `onClick={() => setSelectedPayment(payment)}` to the `<tr>` in the payments table so the user can open the `selectedPayment` modal for *any* payment, allowing them to see all operations in the modal.

## Verification Plan
1. Open the dashboard.
2. Click on the "Paiements" tab.
3. Verify that a list of payments is displayed.
4. Click on a payment row.
5. Verify that a modal opens showing detailed information for that specific payment operation.
