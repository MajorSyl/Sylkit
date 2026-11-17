import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { tx } from '../i18n';
import { colors } from '../theme';
import { Field, formStyles } from './Field';

// "Cancel this order": the customer can cancel on their own until they pay (new, quoted, accepted).
// Two steps so nobody cancels by accident; the reason is optional. Calls POST /api/order/cancel
// (worker/orders.js), which checks the status again on the server and alerts Sylkit.
export const CANCELLABLE = ['new', 'quoted', 'accepted'];

export function CancelOrder({ token, status, onDone, compact }: { token: string; status: string; onDone: () => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!CANCELLABLE.includes(status)) return null;

  const REASONS = [
    tx('Changed my mind', 'Cambié de opinión', 'Mudei de ideia'),
    tx('Too expensive', 'Muy caro', 'Muito caro'),
    tx('Ordered by mistake', 'Lo pedí por error', 'Pedi por engano'),
    tx('Found another option', 'Encontré otra opción', 'Encontrei outra opção'),
  ];

  const confirm = async () => {
    setBusy(true);
    setError('');
    const r = await fetch('/api/order/cancel', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, reason }) })
      .then((x) => x.json())
      .catch(() => ({ error: 'network' }));
    setBusy(false);
    if (r?.ok) {
      setOpen(false);
      return onDone();
    }
    setError(
      r?.error === 'cannot_cancel'
        ? tx('This order can no longer be cancelled here because a payment was reported. Message us and we will help.', 'Este pedido ya no se puede cancelar aquí porque se reportó un pago. Escríbenos y te ayudamos.', 'Este pedido não pode mais ser cancelado aqui porque um pagamento foi informado. Fale conosco.')
        : tx('We could not cancel it. Please try again.', 'No pudimos cancelarlo. Intenta de nuevo.', 'Não conseguimos cancelar. Tente de novo.'),
    );
  };

  if (!open)
    return (
      <Pressable onPress={() => setOpen(true)} style={[styles.link, compact && { alignSelf: 'flex-start' }]} accessibilityRole="button">
        <Ionicons name="close-circle-outline" size={16} color="#B42318" />
        <Text style={styles.linkText}>{tx('Cancel this order', 'Cancelar este pedido', 'Cancelar este pedido')}</Text>
      </Pressable>
    );

  return (
    <View style={styles.box}>
      <Text style={styles.title}>{tx('Cancel this order?', '¿Cancelar este pedido?', 'Cancelar este pedido?')}</Text>
      <Text style={styles.muted}>{tx('Nothing has been charged. You can order again any time.', 'No se ha cobrado nada. Puedes volver a pedir cuando quieras.', 'Nada foi cobrado. Você pode pedir de novo quando quiser.')}</Text>
      <View style={styles.chips}>
        {REASONS.map((r) => (
          <Pressable key={r} onPress={() => setReason(reason === r ? '' : r)} style={[styles.chip, reason === r && styles.chipOn]} accessibilityRole="button" accessibilityState={{ selected: reason === r }}>
            <Text style={[styles.chipText, reason === r && { color: '#fff' }]}>{r}</Text>
          </Pressable>
        ))}
      </View>
      <Field label={tx('Reason (optional)', 'Motivo (opcional)', 'Motivo (opcional)')} value={reason} onChangeText={setReason} maxLength={300} />
      {error ? <Text style={formStyles.error}>{error}</Text> : null}
      <View style={styles.row}>
        <Pressable onPress={() => setOpen(false)} style={styles.keep} accessibilityRole="button" disabled={busy}>
          <Text style={styles.keepText}>{tx('Keep my order', 'Mantener mi pedido', 'Manter meu pedido')}</Text>
        </Pressable>
        <Pressable onPress={confirm} style={styles.danger} accessibilityRole="button" disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.dangerText}>{tx('Yes, cancel order', 'Sí, cancelar pedido', 'Sim, cancelar pedido')}</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 6 },
  linkText: { color: '#B42318', fontWeight: '700', fontSize: 14 },
  box: { backgroundColor: '#FFFBFA', borderWidth: 1, borderColor: '#FECDCA', borderRadius: 16, padding: 18, gap: 12 },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  muted: { fontSize: 14, color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#D5DCEA', backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' },
  keep: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F2F4F7' },
  keepText: { fontWeight: '700', color: colors.text },
  danger: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#B42318', minWidth: 160, alignItems: 'center' },
  dangerText: { fontWeight: '800', color: '#fff' },
});
