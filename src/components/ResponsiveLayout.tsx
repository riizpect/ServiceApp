import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  maxWidth?: number;
  padding?: number;
  centered?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  maxWidth = 1200,
  padding = 20,
  centered = true,
}) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  
  const isWeb = Platform.OS === 'web';
  const isTablet = width > 768;
  const isDesktop = width > 1024;
  
  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: isWeb ? padding : 0,
    alignItems: centered && isWeb ? 'center' : 'stretch' as const,
  };
  
  const contentStyle = {
    width: '100%',
    maxWidth: isWeb ? Math.min(maxWidth, width - padding * 2) : '100%',
    flex: 1,
  };

  return (
    <View style={containerStyle}>
      <View style={contentStyle}>
        {children}
      </View>
    </View>
  );
};

// Responsiv grid-komponent
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  tabletColumns?: number;
  desktopColumns?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 1,
  gap = 16,
  tabletColumns = 2,
  desktopColumns = 3,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  const isDesktop = width > 1024;
  
  const currentColumns = isDesktop ? desktopColumns : isTablet ? tabletColumns : columns;
  
  const gridStyle = {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap,
    justifyContent: 'space-between',
  };
  
  const itemStyle = {
    flex: `0 0 calc(${100 / currentColumns}% - ${gap * (currentColumns - 1) / currentColumns}px)`,
    marginBottom: gap,
  };

  return (
    <View style={gridStyle}>
      {React.Children.map(children, (child) => (
        <View style={itemStyle}>
          {child}
        </View>
      ))}
    </View>
  );
};

// Responsiv sidebar-layout
interface ResponsiveSidebarLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  sidebarWidth?: number;
  collapsed?: boolean;
}

export const ResponsiveSidebarLayout: React.FC<ResponsiveSidebarLayoutProps> = ({
  sidebar,
  main,
  sidebarWidth = 280,
  collapsed = false,
}) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  
  const isWeb = Platform.OS === 'web';
  const isTablet = width > 768;
  const isDesktop = width > 1024;
  
  const showSidebar = isWeb && (isDesktop || (isTablet && !collapsed));
  
  const containerStyle = {
    flex: 1,
    flexDirection: 'row' as const,
    backgroundColor: colors.background,
  };
  
  const sidebarStyle = {
    width: showSidebar ? sidebarWidth : 0,
    backgroundColor: colors.surface,
    borderRightWidth: showSidebar ? 1 : 0,
    borderRightColor: colors.border,
    overflow: 'hidden',
  };
  
  const mainStyle = {
    flex: 1,
    marginLeft: showSidebar ? 0 : 0,
  };

  return (
    <View style={containerStyle}>
      <View style={sidebarStyle}>
        {showSidebar && sidebar}
      </View>
      <View style={mainStyle}>
        {main}
      </View>
    </View>
  );
}; 