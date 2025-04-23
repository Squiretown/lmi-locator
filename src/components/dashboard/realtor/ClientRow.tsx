
import React from 'react';
import { ClientRowData } from './types';

export const ClientRow: React.FC<ClientRowData> = ({ name, status, interest, eligible, contact }) => (
  <tr className="border-t">
    <td className="p-3 font-medium">{name}</td>
    <td className="p-3">
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        status === 'Active' ? 'bg-green-100 text-green-800' :
        status === 'New Lead' ? 'bg-blue-100 text-blue-800' :
        status === 'Closing' ? 'bg-purple-100 text-purple-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {status}
      </span>
    </td>
    <td className="p-3">{interest}</td>
    <td className="p-3">
      <span className={`inline-flex items-center rounded-full w-2 h-2 ${
        eligible ? 'bg-green-500' : 'bg-red-500'
      }`}></span>
      <span className="ml-1.5">{eligible ? 'Yes' : 'No'}</span>
    </td>
    <td className="p-3 text-muted-foreground">{contact}</td>
  </tr>
);
