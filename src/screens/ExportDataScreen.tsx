import React from 'react';
import { PlaceholderScreen } from './PlaceholderScreen';

export const ExportDataScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Exportera data"
      subtitle="Exportera din data till en fil"
      icon="📤"
      description="Här kommer du att kunna exportera all din data till olika format som CSV, JSON eller PDF för säkerhetskopiering eller analys."
    />
  );
}; 