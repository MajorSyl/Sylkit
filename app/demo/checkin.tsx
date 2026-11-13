import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { createElement, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Btn, Card, DemoShell, demoStyles as d, Field, Wrap } from '../../src/components/DemoShell';
import { tx } from '../../src/i18n';
import { demoApi, useDemo } from '../../src/lib/demo';
import { colors } from '../../src/theme';
import { EVENT_TEXT, L, TIER } from './events';

// Door check-in: scan the ticket's QR with the phone camera (or type the code). Each ticket gets in
// exactly once; a second scan shows "already used" with the time it was used.

type Result = { result: 'ok' | 'already' | 'invalid' | 'wrong_event'; ticket?: { tier: string; name: string; checked_in?: string; event_id?: string } };

export default function CheckIn() {
  const { event = 'jazz' } = useLocalSearchParams<{ event?: string }>();
  const ev = EVENT_TEXT[event] ? event : 'jazz';
  const [code, setCode] = useState('');
  const [res, setRes] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [cam, setCam] = useState<'off' | 'on' | 'unsupported' | 'denied'>('off');
  const { data, reload } = useDemo<any>('events/list');
  const videoRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastRef = useRef<{ code: string; at: number }>({ code: '', at: 0 });

  const check = async (raw: string) => {
    const c = raw.trim();
    if (!c || busy) return;
    if (lastRef.current.code === c && Date.now() - lastRef.current.at < 2500) return; // same QR still in front of the camera
    lastRef.current = { code: c, at: Date.now() };
    setBusy(true);
    const r = await demoApi<Result>('events/checkin', { code: c, event: ev }).catch(() => null);
    setBusy(false);
    if (r && !r.error) {
      setRes(r);
      try {
        navigator.vibrate?.(r.result === 'ok' ? 80 : [60, 60, 60]);
      } catch {}
      reload();
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCam('off');
  };

  const start = async () => {
    const BD = (globalThis as any).BarcodeDetector;
    if (!BD || !navigator.mediaDevices?.getUserMedia) return setCam('unsupported');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCam('on');
      setTimeout(() => {
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        v.play();
        const det = new BD({ formats: ['qr_code'] });
        const tick = async () => {
          if (!streamRef.current) return;
          try {
            const codes = await det.detect(v);
            if (codes[0]?.rawValue) await check(codes[0].rawValue);
          } catch {}
          setTimeout(tick, 350);
        };
        tick();
      }, 50);
    } catch {
      setCam('denied');
    }
  };

  useEffect(() => stop, []);

  const e = data?.events?.find((x: any) => x.id === ev);
  const inside = e ? e.tiers.reduce((s: number, t: any) => s + t.inside, 0) : 0;
  const sold = e ? e.tiers.reduce((s: number, t: any) => s + t.sold, 0) : 0;

  const view = res
    ? {
        ok: { bg: '#079455', icon: 'checkmark-circle', title: tx('Welcome in', 'Adelante', 'Pode entrar') },
        already: { bg: '#DC6803', icon: 'alert-circle', title: tx('Already used', 'Ya fue usada', 'Já utilizado') },
        invalid: { bg: '#D92D20', icon: 'close-circle', title: tx('Not valid', 'No válida', 'Inválido') },
        wrong_event: { bg: '#D92D20', icon: 'swap-horizontal', title: tx('Ticket for another event', 'Entrada de otro evento', 'Ingresso de outro evento') },
      }[res.result]
    : null;

  return (
    <DemoShell title={tx('Door check-in', 'Control de acceso', 'Controle de acesso')} brand="Aurora Live" product="events">
      <Wrap style={{ paddingTop: 20, gap: 16, maxWidth: 560 }}>
        <View>
          <Text style={d.h1}>{tx('Door check-in', 'Control de acceso', 'Controle de acesso')}</Text>
          <Text style={d.sub}>{L(EVENT_TEXT[ev].name)} · {inside}/{sold} {tx('inside', 'dentro', 'dentro')}</Text>
        </View>

        {view ? (
          <View style={[styles.result, { backgroundColor: view.bg }]} accessibilityRole="alert" accessibilityLiveRegion="assertive">
            <Ionicons name={view.icon as any} size={56} color="#fff" />
            <Text style={styles.resTitle}>{view.title}</Text>
            {res?.ticket ? (
              <Text style={styles.resSub}>
                {res.ticket.name} · {L(TIER[res.ticket.tier] || ['', '', ''])}
                {res.result === 'already' && res.ticket.checked_in ? ` · ${new Date(res.ticket.checked_in).toLocaleTimeString()}` : ''}
                {res.result === 'wrong_event' && res.ticket.event_id ? ` · ${L(EVENT_TEXT[res.ticket.event_id].name)}` : ''}
              </Text>
            ) : null}
          </View>
        ) : null}

        <Card style={{ gap: 12 }}>
          {cam === 'on' && Platform.OS === 'web' ? (
            <View style={styles.camBox}>
              {createElement('video', { ref: videoRef, playsInline: true, muted: true, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })}
              <View style={styles.frame} pointerEvents="none" />
            </View>
          ) : null}
          {cam === 'on' ? (
            <Btn kind="alt" icon="stop-circle-outline" label={tx('Stop camera', 'Detener cámara', 'Parar câmera')} onPress={stop} />
          ) : (
            <Btn icon="camera-outline" label={tx('Scan with camera', 'Escanear con la cámara', 'Ler com a câmera')} onPress={start} />
          )}
          {cam === 'unsupported' ? <Text style={styles.note}>{tx('This browser can’t scan QR codes. Use Chrome on Android, or type the ticket code below.', 'Este navegador no puede escanear QR. Usa Chrome en Android o escribe el código abajo.', 'Este navegador não lê QR. Use o Chrome no Android ou digite o código abaixo.')}</Text> : null}
          {cam === 'denied' ? <Text style={styles.note}>{tx('Camera permission was not given. You can type the ticket code below.', 'No se dio permiso a la cámara. Puedes escribir el código abajo.', 'A câmera não foi permitida. Digite o código abaixo.')}</Text> : null}
          <View style={[d.row, { alignItems: 'flex-end' }]}>
            <Field label={tx('Ticket code', 'Código de la entrada', 'Código do ingresso')} value={code} onChangeText={setCode} placeholder="TXXXXXXXXX" autoCapitalize="characters" onSubmitEditing={() => check(code)} />
            <Btn label={tx('Check', 'Validar', 'Validar')} onPress={() => check(code)} disabled={busy || code.trim().length < 4} />
          </View>
        </Card>
        <Text style={styles.note}>{tx('Each ticket is accepted once. Scanning it again shows when it was used, so a screenshot can’t get two people in.', 'Cada entrada se acepta una sola vez. Si se escanea de nuevo muestra cuándo se usó: una captura de pantalla no deja pasar a dos personas.', 'Cada ingresso é aceito uma vez. Lido de novo, mostra quando foi usado: um print não deixa duas pessoas entrarem.')}</Text>
      </Wrap>
    </DemoShell>
  );
}

const styles = StyleSheet.create({
  result: { borderRadius: 22, padding: 24, alignItems: 'center', gap: 8 },
  resTitle: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  resSub: { color: 'rgba(255,255,255,0.92)', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  camBox: { width: '100%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
  frame: { position: 'absolute', left: '18%', right: '18%', top: '18%', bottom: '18%', borderWidth: 3, borderColor: 'rgba(255,255,255,0.9)', borderRadius: 18 } as any,
  note: { fontSize: 13, color: colors.muted, lineHeight: 19 },
});
