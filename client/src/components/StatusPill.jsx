import React from 'react';

const StatusPill = ({ status }) => {
  let colorClasses = 'bg-gray-100 text-gray-800'; // Default Gray

  switch (status) {
    case 'Available':
    case 'On Duty':
    case 'Completed':
      colorClasses = 'bg-green-100 text-green-800 border-green-200';
      break;
    case 'On Trip':
    case 'Dispatched':
      colorClasses = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    case 'In Shop':
    case 'Suspended':
    case 'Cancelled':
      colorClasses = 'bg-red-100 text-red-800 border-red-200';
      break;
    case 'Draft':
    case 'Retired':
    case 'Off Duty':
      colorClasses = 'bg-gray-100 text-gray-800 border-gray-200';
      break;
    default:
      break;
  }

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${colorClasses}`}
    >
      {status}
    </span>
  );
};

export default StatusPill;
