import { Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  variant?: 'default' | 'subtle';
}

export function GalaxyBackground({ children, variant = 'default' }: Props) {
  const colors =
    variant === 'subtle'
      ? ['#040108', '#0A0418', '#0D0620']
      : ['#040108', '#18082B', '#2C0B3B'];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});
