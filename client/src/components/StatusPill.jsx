import React from 'react';

const statusColorMap = {
  // Vehicle statuses
  'Available': 'green',
  'On Trip': 'blue',
  'In Shop': 'red',
  'Retired': 'gray',
  // Driver statuses
  'On Duty': 'green',
  'Off Duty': 'gray',
  'Suspended': 'red',
  // Trip statuses
  'Draft': 'gray',
  'Dispatched': 'blue',
  'Completed': 'green',
  'Cancelled': 'red',
  // Maintenance
  'Open': 'amber',
  'Closed': 'green',
};

export default function StatusPill({ status }) {
  const color = statusColorMap[status] || 'gray';
  return (
    <span className={`status-pill ${color}`}>
      {status}
    </span>
  );
}
