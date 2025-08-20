import React from 'react';
import { PlaceholderScreen } from './PlaceholderScreen';

export const AboutScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Om ServiceApp"
      subtitle="Version 1.0.0 - Ferno Norden"
      icon="ℹ️"
      description="ServiceApp är en professionell app för servicepersonal hos Ferno Norden. Appen hjälper dig att hantera serviceärenden, kunder och produkter på ett effektivt sätt."
    />
  );
}; 