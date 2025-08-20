import React from 'react';
import { PlaceholderScreen } from './PlaceholderScreen';

export const BackupScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Säkerhetskopiera"
      subtitle="Skapa en säkerhetskopia av din data"
      icon="🔄"
      description="Här kommer du att kunna skapa automatiska och manuella säkerhetskopior av all din data för att skydda mot dataförlust."
    />
  );
}; 