import React, { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '../hooks/useAnalytics';

interface Notification {
  id: string;
  type: 'theft' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  theft_alert_id?: string;
}

interface NotificationsPanelProps {
  children: React.ReactNode;
}

export const NotificationsPanel = ({ children }: NotificationsPanelProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { getRecentTheftAlerts } = useAnalytics();

  // Load read status from localStorage
  const getReadStatus = (): Set<string> => {
    try {
      const readIds = localStorage.getItem('notification_read_ids');
      return readIds ? new Set(JSON.parse(readIds)) : new Set();
    } catch (error) {
      console.error('Error loading read status from localStorage:', error);
      return new Set();
    }
  };

  // Save read status to localStorage
  const saveReadStatus = (readIds: Set<string>) => {
    try {
      localStorage.setItem('notification_read_ids', JSON.stringify(Array.from(readIds)));
    } catch (error) {
      console.error('Error saving read status to localStorage:', error);
    }
  };

  // Load real notifications from Supabase with read status from localStorage
  useEffect(() => {
    const loadNotifications = async () => {
      console.log('Loading real theft notifications from Supabase...');
      
      try {
        // Get recent theft alerts to create notifications
        const alerts = await getRecentTheftAlerts(10);
        
        if (alerts && alerts.length > 0) {
          // Get read status from localStorage
          const readIds = getReadStatus();

          const theftNotifications: Notification[] = alerts.map(alert => ({
            id: alert.id,
            theft_alert_id: alert.id,
            type: 'theft' as const,
            title: 'Theft Alert Detected',
            message: `Suspicious hand movement detected in ${alert.camera_id || 'Show Table Zone'}`,
            time: new Date(alert.timestamp || '').toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(',', ''),
            read: readIds.has(alert.id)
          }));
          
          setNotifications(theftNotifications);
          console.log('Loaded real theft notifications with read status:', theftNotifications);
        } else {
          console.log('No theft alerts found - no notifications to display');
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
    
    // Refresh notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000);
    
    return () => clearInterval(interval);
  }, [getRecentTheftAlerts]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    console.log('Marking all notifications as read');
    
    try {
      // Get current read status
      const readIds = getReadStatus();
      
      // Add all notification IDs to read set
      notifications.forEach(notification => {
        if (notification.theft_alert_id) {
          readIds.add(notification.theft_alert_id);
        }
      });
      
      // Save updated read status
      saveReadStatus(readIds);
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      console.log('Successfully marked all notifications as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const markAsRead = (id: string, theftAlertId?: string) => {
    console.log('Marking notification as read:', id);
    
    try {
      if (theftAlertId) {
        // Get current read status
        const readIds = getReadStatus();
        
        // Add this notification to read set
        readIds.add(theftAlertId);
        
        // Save updated read status
        saveReadStatus(readIds);
      }

      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      
      console.log('Successfully marked notification as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          {children}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs text-white font-medium">{unreadCount}</span>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Security Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No security alerts</p>
                <p className="text-xs">Real theft notifications will appear here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                  onClick={() => markAsRead(notification.id, notification.theft_alert_id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {notification.type === 'theft' ? (
                        <AlertTriangle size={16} className="text-red-500" />
                      ) : (
                        <Bell size={16} className="text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{notification.time}</span>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="pt-2 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-sm hover:bg-red-50 text-red-600" 
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
