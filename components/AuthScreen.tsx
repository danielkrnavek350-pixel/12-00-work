import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../lib/theme';
import { haptic } from '../lib/haptics';
import { useAuth } from '../lib/auth';
import { Sheet } from './Sheet';
import { Cloud, LogIn, UserPlus } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AuthScreen({ visible, onClose }: Props) {
  const { signIn, signUp, enterGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setBusy(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGuest = () => {
    haptic('light');
    enterGuest();
    reset();
    onClose();
  };

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Vyplňte e-mail a heslo.');
      return;
    }
    setBusy(true);
    setError(null);
    const fn = mode === 'login' ? signIn : signUp;
    const { error: err } = await fn(email.trim(), password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    haptic('success');
    reset();
    onClose();
  };

  return (
    <Sheet visible={visible} title={mode === 'login' ? 'Přihlášení' : 'Registrace'} onClose={handleClose}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Cloud size={28} color={colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Synchronizace s cloudem</Text>
        <Text style={styles.heroSub}>
          {mode === 'login'
            ? 'Přihlaste se pro zálohu a synchronizaci úkolů napříč zařízeními.'
            : 'Vytvořte účet pro cloudovou zálohu vašich úkolů.'}
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>E-mail</Text>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          placeholder="vas@email.cz"
          style={webStyles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Heslo</Text>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          placeholder="••••••••"
          style={webStyles.input}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={submit}
        disabled={busy}
        style={({ pressed }) => [styles.primaryBtn, busy && styles.primaryBtnDisabled, pressed && { opacity: 0.85 }]}
      >
        {mode === 'login' ? <LogIn size={18} color={colors.text} /> : <UserPlus size={18} color={colors.text} />}
        <Text style={styles.primaryBtnText}>
          {busy ? 'Pracuji…' : mode === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          haptic('light');
          setMode(mode === 'login' ? 'register' : 'login');
          setError(null);
        }}
        style={styles.switchBtn}
      >
        <Text style={styles.switchText}>
          {mode === 'login' ? 'Nemáte účet? Zaregistrovat se' : 'Máte už účet? Přihlásit se'}
        </Text>
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>nebo</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable onPress={handleGuest} style={({ pressed }) => [styles.guestBtn, pressed && { opacity: 0.7 }]}>
        <Text style={styles.guestText}>Pokračovat bez účtu (místní data)</Text>
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
    backgroundColor: colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { ...typography.h2, color: colors.text, fontSize: 20 },
  heroSub: { ...typography.small, color: colors.text3, textAlign: 'center' },
  field: { gap: 8 },
  label: {
    ...typography.smallM,
    color: colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorBox: {
    backgroundColor: colors.high + '1A',
    borderRadius: 12,
    padding: 12,
  },
  errorText: { ...typography.small, color: colors.high },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { ...typography.bodyM, color: colors.text, fontWeight: '700' },
  switchBtn: { alignItems: 'center', paddingVertical: 8 },
  switchText: { ...typography.small, color: colors.primary },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  dividerText: { ...typography.small, color: colors.text4 },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.14)',
  },
  guestText: { ...typography.bodyM, color: colors.text2 },
});

const webStyles = {
  input: {
    width: '100%',
    backgroundColor: colors.surface2,
    color: colors.text,
    border: 'none',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 15,
    fontFamily: 'inherit',
    outline: 'none',
  },
};
