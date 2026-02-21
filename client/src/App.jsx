import React from 'react'
import TripDispatcher from './pages/TripDispatcher'
import FleetHealthScore from './components/FleetHealthScore'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Temporary Navigation Header for testing integration */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">FleetFlow Setup</span>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
             <FleetHealthScore />
          </div>
        </div>
        
        <TripDispatcher />
      </main>
    </div>
  )
}

export default App
