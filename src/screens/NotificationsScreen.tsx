import React from 'react';
import { PlaceholderScreen } from './PlaceholderScreen';

export const NotificationsScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Notifikationer"
      subtitle="Hantera påminnelser och notifikationer"
      icon="🔔"
      description="Här kommer du att kunna hantera alla notifikationer och påminnelser, inklusive push-notifikationer, e-postaviseringar och app-interna meddelanden."
    />
  );
}; 