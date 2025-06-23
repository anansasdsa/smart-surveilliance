import React, { useState } from 'react';
import { ImageZoomModal } from './ImageZoomModal';

interface TheftAlert {
  id: number;
  time: string;
  snapshot: string;
  location: string;
  confidence: number;
}

interface TheftAlertLogProps {
  alerts: TheftAlert[];
}

export const TheftAlertLog = ({ alerts }: TheftAlertLogProps) => {
  const [selectedImage, setSelectedImage] = useState<{src: string, alt: string} | null>(null);
  
  console.log('TheftAlertLog received alerts:', alerts);
  console.log('Number of alerts to render:', alerts.length);

  const handleImageClick = (imageSrc: string, alertId: number) => {
    setSelectedImage({
      src: imageSrc,
      alt: `Theft alert snapshot #${alertId}`
    });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Fix image URL by removing trailing question mark
  const getCleanImageUrl = (url: string) => {
    if (!url) return '';
    // Remove trailing question mark that causes 400 errors
    return url.replace(/\?$/, '');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Theft Alert Log ({alerts.length} alerts)</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Snapshot
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                  No theft alerts found
                </td>
              </tr>
            ) : (
              alerts.map((alert) => {
                const cleanImageUrl = getCleanImageUrl(alert.snapshot);
                console.log('Rendering alert:', alert);
                console.log('Original URL:', alert.snapshot);
                console.log('Clean URL:', cleanImageUrl);
                
                return (
                  <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={cleanImageUrl}
                        alt="Theft alert snapshot"
                        className="h-12 w-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick(cleanImageUrl, alert.id)}
                        onError={(e) => {
                          console.log('Image failed to load:', cleanImageUrl);
                          console.error('Image error:', e);
                        }}
                        onLoad={() => console.log('Image loaded successfully:', cleanImageUrl)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedImage && (
        <ImageZoomModal
          isOpen={!!selectedImage}
          onClose={closeModal}
          imageSrc={selectedImage.src}
          imageAlt={selectedImage.alt}
        />
      )}
    </div>
  );
};
