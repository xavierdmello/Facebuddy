'use client';

import { useState } from 'react';

export default function EthStorageUploader() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function initialize() {
    try {
      setIsInitializing(true);
      setError(null);

      console.log('Initiating API call to /api/ethstorage/initialize');
      const response = await fetch('/api/ethstorage/initialize', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize');
      }

      setContractAddress(data.contractAddress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize ETHStorage';
      console.error('Initialization error:', err);
      setError(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[600px] p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-bold">ETHStorage File Upload</h2>

      {/* Initialize Button */}
      <div className="flex flex-col gap-4">
        <button
          onClick={initialize}
          disabled={isInitializing}
          className={`px-4 py-2 rounded-lg ${
            isInitializing
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isInitializing ? 'Initializing...' : 'Initialize ETHStorage'}
        </button>

        {contractAddress && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            <p className="font-medium">Contract deployed successfully!</p>
            <p className="text-sm break-all mt-1">Address: {contractAddress}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
