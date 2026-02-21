import React, { useState, useEffect } from 'react';

const MaintenanceLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            // Replace with actual API call: axios.get('/api/maintenance')
            const response = await fetch('/api/maintenance');
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            } else {
                // Mock data fallback
                setLogs([
                    { id: 1, vehicle_name: 'Truck A-101', cost: 450.00, date: '2023-09-12', status: 'closed' },
                    { id: 2, vehicle_name: 'Van V-205', cost: 1200.50, date: '2024-01-05', status: 'open' },
                    { id: 3, vehicle_name: 'Truck B-303', cost: 340.00, date: '2024-03-20', status: 'open' },
                ]);
            }
        } catch (error) {
            console.error('Error fetching maintenance logs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseMaintenance = async (id) => {
        try {
            // Replace with actual API call: axios.patch(`/api/maintenance/${id}/close`)
            const response = await fetch(`/api/maintenance/${id}/close`, {
                method: 'PATCH',
            });
            if (response.ok) {
                fetchLogs();
            } else {
                // Mock success fallback
                setLogs(logs.map(log => log.id === id ? { ...log, status: 'closed' } : log));
            }
        } catch (error) {
            console.error('Error closing maintenance', error);
        }
    };

    const getStatusBadge = (status) => {
        if (status.toLowerCase() === 'open') {
            return 'bg-red-100 text-red-800';
        }
        return 'bg-green-100 text-green-800';
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Maintenance Logs</h1>
                <button
                    onClick={fetchLogs}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                    Refresh Logs
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost ($)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No maintenance logs found.</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{log.vehicle_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {parseFloat(log.cost).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(log.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(log.status)}`}>
                                                {log.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {log.status.toLowerCase() === 'open' ? (
                                                <button
                                                    onClick={() => handleCloseMaintenance(log.id)}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md"
                                                >
                                                    Close Maintenance
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">Closed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MaintenanceLogs;
