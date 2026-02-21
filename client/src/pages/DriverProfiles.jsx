import React, { useState, useEffect } from 'react';

const DriverProfiles = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    license_number: '',
    license_expiry: '',
    duty_status: 'Off Duty',
    safety_score: 100
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      // Replace with actual API call: axios.get('/api/drivers')
      const response = await fetch('/api/drivers');
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      } else {
        // Mock data fallback if API is not available
        setDrivers([
          { id: 1, name: 'John Doe', license_number: 'DL-12345', expiry_date: '2024-05-15', duty_status: 'On Duty', safety_score: 85, trip_completion_rate: 95 },
          { id: 2, name: 'Jane Smith', license_number: 'DL-67890', expiry_date: '2023-10-10', duty_status: 'Off Duty', safety_score: 55, trip_completion_rate: 80 },
          { id: 3, name: 'Mike Ross', license_number: 'DL-54321', expiry_date: '2026-08-22', duty_status: 'On Duty', safety_score: 95, trip_completion_rate: 99 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching drivers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replace with actual API call: axios.post('/api/drivers', formData)
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowAddForm(false);
        fetchDrivers();
        // toast.success('Driver added successfully')
      } else {
        // Mock successful addition
        setDrivers([...drivers, { ...formData, id: Date.now(), trip_completion_rate: 100 }]);
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding driver', error);
    }
  };

  const isExpiringSoon = (dateStr) => {
    const expiry = new Date(dateStr);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const isExpired = (dateStr) => {
    const expiry = new Date(dateStr);
    const now = new Date();
    return expiry < now;
  };

  const getSafetyBadgeColor = (score) => {
    if (score > 80) return 'bg-green-100 text-green-800';
    if (score > 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Profiles</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : 'Add Driver'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 border">
          <h2 className="text-lg font-semibold mb-4">Add New Driver</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded-md p-2" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input required type="text" name="license_number" value={formData.license_number} onChange={handleInputChange} className="w-full border rounded-md p-2" placeholder="DL-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input required type="date" name="license_expiry" value={formData.license_expiry} onChange={handleInputChange} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duty Status</label>
                <select name="duty_status" value={formData.duty_status} onChange={handleInputChange} className="w-full border rounded-md p-2">
                  <option value="On Duty">On Duty</option>
                  <option value="Off Duty">Off Duty</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Save Driver</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duty Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Safety Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Success</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No drivers found.</td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{driver.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.license_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{new Date(driver.license_expiry).toLocaleDateString()}</span>
                        {isExpired(driver.license_expiry) && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Expired
                          </span>
                        )}
                        {!isExpired(driver.license_expiry) && isExpiringSoon(driver.license_expiry) && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                            Expiring Soon
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${driver.duty_status === 'On Duty' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {driver.duty_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSafetyBadgeColor(driver.safety_score)}`}>
                        {driver.safety_score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.trip_completion_rate}%
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

export default DriverProfiles;
