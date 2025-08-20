import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryClass extends Component<Props & { colors: any }, State> {
  constructor(props: Props & { colors: any }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Här kan du lägga till analytics/logging senare
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.container, { backgroundColor: this.props.colors.background }]}>
          <View style={[styles.errorContainer, { backgroundColor: this.props.colors.surface }]}>
            <Text style={[styles.errorIcon, { color: this.props.colors.error }]}>⚠️</Text>
            <Text style={[styles.errorTitle, { color: this.props.colors.text }]}>
              Något gick fel
            </Text>
            <Text style={[styles.errorMessage, { color: this.props.colors.textSecondary }]}>
              Appen stötte på ett oväntat fel. Försök att starta om appen.
            </Text>
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: this.props.colors.primary }]}
              onPress={this.handleReset}
            >
              <Text style={[styles.resetButtonText, { color: this.props.colors.textInverse }]}>
                Försök igen
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Wrapper för att få tillgång till theme colors
export const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const { colors } = useTheme();
  return <ErrorBoundaryClass colors={colors}>{children}</ErrorBoundaryClass>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: 300,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 