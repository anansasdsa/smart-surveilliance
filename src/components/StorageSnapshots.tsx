import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SnapshotFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: any;
}

export const StorageSnapshots = () => {
  const [snapshots, setSnapshots] = useState<SnapshotFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching snapshots from theftsnapshots bucket...');

        // List all files in the theftsnapshots bucket
        const { data, error } = await supabase.storage
          .from('theftsnapshots')
          .list('theft_snapshots', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) {
          console.error('Error fetching snapshots:', error);
          setError(error.message);
          return;
        }

        console.log('📸 Found snapshots:', data);
        setSnapshots(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Failed to fetch snapshots');
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, []);

  const getImageUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('theftsnapshots')
      .getPublicUrl(`theft_snapshots/${fileName}`);
    return data.publicUrl;
  };

  const handleImageClick = (fileName: string) => {
    const imageUrl = getImageUrl(fileName);
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Storage Snapshots</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading snapshots from storage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-4">Storage Snapshots - Error</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Storage Snapshots ({snapshots.length} images)
      </h2>
      
      {snapshots.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No snapshots found in storage bucket</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="relative group cursor-pointer"
              onClick={() => handleImageClick(snapshot.name)}
            >
              <img
                src={getImageUrl(snapshot.name)}
                alt={snapshot.name}
                className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                onError={(e) => {
                  console.error('Failed to load image:', snapshot.name);
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0IDg4LjU0NCA4MSA5OSA4MUMxMDkuNDU2IDgxIDExOCA4OS41NDQgMTE4IDEwMEMxMTggMTEwLjQ1NiAxMDkuNDU2IDExOSA5OSAxMTlDOC41NDQgMTE5IDgwIDExMC40NTYgODAgMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTYwIDEwMEMxNjAgODkuNTQ0IDE2OC41NDQgODEgMTc5IDgxQzE4OS40NTYgODEgMTk4IDg5LjU0NCAxOTggMTAwQzE5OCAxMTAuNDU2IDE4OS40NTYgMTE5IDE3OSAxMTlDMTY4LjU0NCAxMTkgMTYwIDExMC40NTYgMTYwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyMCAxMDBDMTIwIDg5LjU0NCAxMjguNTQ0IDgxIDEzOSA4MUMxNDkuNDU2IDgxIDE1OCA4OS41NDQgMTU4IDEwMEMxNTggMTEwLjQ1NiAxNDkuNDU2IDExOSAxMzkgMTE5QzEyOC41NDQgMTE5IDEyMCAxMTAuNDU2IDEyMCAxMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white rounded-lg px-2 py-1 text-xs text-gray-700">
                    Click to view
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-600 truncate">{snapshot.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(snapshot.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Full size snapshot"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 