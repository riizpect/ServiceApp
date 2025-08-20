import React from 'react';
import { PlaceholderScreen } from './PlaceholderScreen';

export const ImportDataScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Importera data"
      subtitle="Importera data från en fil"
      icon="📥"
      description="Här kommer du att kunna importera data från olika format och källor för att återställa säkerhetskopior eller lägga till ny data."
    />
  );
}; 