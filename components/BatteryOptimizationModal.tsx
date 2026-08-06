import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { colors, typography } from '../lib/theme';
import { haptic } from '../lib/haptics';
import { Sheet } from './Sheet';
import { Battery, Settings, Shield } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function BatteryOptimizationModal({ visible, onClose }: Props) {
  const requestIgnoreBattery = async () => {
    haptic('light');
    if (Platform.OS !== 'android') return;
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
      );
    } catch {
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS,
        );
      } catch {
        // open general settings as fallback
        try {
          await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
          );
        } catch {
          // ignore
        }
      }
    }
  };

  const openBatterySettings = async () => {
    haptic('light');
    if (Platform.OS !== 'android') return;
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS,
      );
    } catch {
      // ignore
    }
  };

  return (
    <Sheet visible={visible} title="Optimalizace baterie" onClose={onClose}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Battery size={28} color={colors.medium} />
        </View>
        <Text style={styles.heroTitle}>Zajistěte spolehlivá připomenutí</Text>
        <Text style={styles.heroSub}>
          Android může aplikaci uspávat pro šetření baterie, což může zpozdit nebo zablokovat
          oznámení o úkolech. Vypněte optimalizaci baterie pro tuto aplikaci, aby připomenutí
          dorazila včas.
        </Text>
      </View>

      {Platform.OS === 'android' ? (
        <View style={{ gap: 10 }}>
          <Pressable
            onPress={requestIgnoreBattery}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
          >
            <Shield size={18} color={colors.text} />
            <Text style={styles.primaryBtnText}>Vypnout optimalizaci baterie</Text>
          </Pressable>
          <Pressable
            onPress={openBatterySettings}
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.7 }]}
          >
            <Settings size={18} color={colors.text2} />
            <Text style={styles.secondaryBtnText}>Otevřít nastavení baterie</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            Tato funkce je dostupná pouze na zařízeních s Androidem. Na iOS jsou oznámení
            povolena automaticky ze systémových nastavení.
          </Text>
        </View>
      )}

      <Pressable onPress={onClose} style={styles.closeBtn}>
        <Text style={styles.closeText}>Zavřít</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 8, marginBottom: 8 },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.medium + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { ...typography.h2, color: colors.text, fontSize: 20, textAlign: 'center' },
  heroSub: { ...typography.small, color: colors.text3, textAlign: 'center', lineHeight: 20 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  primaryBtnText: { ...typography.bodyM, color: colors.text, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.14)',
  },
  secondaryBtnText: { ...typography.bodyM, color: colors.text2 },
  noteBox: {
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.14)',
    borderRadius: 16,
    padding: 16,
  },
  noteText: { ...typography.small, color: colors.text3, textAlign: 'center' },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.14)',
    marginTop: 4,
  },
  closeText: { ...typography.bodyM, color: colors.text2 },
});
