import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Btn, Card, DemoShell, demoStyles as d, Field, Notice, Pill, Stat, Wrap } from '../../src/components/DemoShell';
import { Photo } from '../../src/components/Photo';
import { tx, useLang } from '../../src/i18n';
import { demoApi, demoPublic, fmtDate, money, useDemo } from '../../src/lib/demo';
import { pickPhotos } from '../../src/lib/photos';
import { useClientWidth } from '../../src/lib/useClientWidth';
import { colors } from '../../src/theme';

// Construction demo: projects with phases, budget vs spent, daily site reports, and a private
// progress link for the client (no internal costs shown).

const PHASE: Record<string, [string, string, string]> = {
  foundation: ['Foundation', 'Cimentación', 'Fundação'],
  structure: ['Structure', 'Estructura', 'Estrutura'],
  installations: ['Installations', 'Instalaciones', 'Instalações'],
  finishes: ['Finishes', 'Acabados', 'Acabamentos'],
};
const WEATHER: Record<string, { icon: string; label: [string, string, string] }> = {
  sunny: { icon: 'sunny-outline', label: ['Sunny', 'Soleado', 'Ensolarado'] },
  cloudy: { icon: 'cloud-outline', label: ['Cloudy', 'Nublado', 'Nublado'] },
  rain: { icon: 'rainy-outline', label: ['Rain', 'Lluvia', 'Chuva'] },
  storm: { icon: 'thunderstorm-outline', label: ['Storm', 'Tormenta', 'Tempestade'] },
};
const L = (a: [string, string, string]) => tx(a[0], a[1], a[2]);

export default function ConstructionDemo() {
  const { share } = useLocalSearchParams<{ share?: string }>();
  const [tab, setTab] = useState(share ? 'client' : 'projects');
  const [shareCode, setShare] = useState(share || '');
  return (
    <DemoShell
      title={tx('Construction management', 'Gestión de obras', 'Gestão de obras')}
      brand="Horizonte Construcciones"
      product="construction"
      tab={tab}
      onTab={setTab}
      tabs={[
        { id: 'projects', label: tx('Projects', 'Obras', 'Obras'), icon: 'construct-outline' },
        { id: 'client', label: tx('Client portal', 'Portal del cliente', 'Portal do cliente'), icon: 'person-outline' },
      ]}
    >
      {tab === 'projects' ? <Projects onShare={(c) => { setShare(c); setTab('client'); }} /> : <Client code={shareCode} />}
    </DemoShell>
  );
}

function Projects({ onShare }: { onShare: (c: string) => void }) {
  const { lang } = useLang();
  const width = useClientWidth() || 375;
  const { data, reload } = useDemo<any>('construction/list');
  const [sel, setSel] = useState(0);
  const [note, setNote] = useState('');
  const [crew, setCrew] = useState('12');
  const [weather, setWeather] = useState('sunny');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const photos = pickPhotos('construction', 4);

  if (!data) return <Wrap style={{ paddingTop: 24 }}><Text style={d.sub}>{tx('Loading projects…', 'Cargando obras…', 'Carregando obras…')}</Text></Wrap>;
  const p = data.projects[sel];
  const over = p.tasks.find((t: any) => t.spent > t.cost); // a task that went over its budget

  const toggle = async (t: any) => {
    setBusy(true);
    await demoApi('construction/task', { id: t.id, done: !t.done }).catch(() => null);
    setBusy(false);
    reload();
  };
  const report = async () => {
    setBusy(true);
    const r = await demoApi('construction/report', { project: p.id, note, crew: Number(crew), weather }).catch(() => ({ error: 'x' }) as any);
    setBusy(false);
    if (!r.error) {
      setNote('');
      setOk(true);
      reload();
      setTimeout(() => setOk(false), 2500);
    }
  };

  return (
    <Wrap style={{ paddingTop: 20, gap: 16 }}>
      <View style={d.row}>
        {data.projects.map((x: any, i: number) => (
          <Pressable key={x.id} onPress={() => setSel(i)} style={[styles.pTab, sel === i && styles.pTabOn]} accessibilityRole="tab" accessibilityState={{ selected: sel === i }}>
            <Text style={[styles.pTabText, sel === i && { color: '#fff' }]} numberOfLines={1}>{x.name}</Text>
          </Pressable>
        ))}
      </View>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <View style={{ flexDirection: width >= 900 ? 'row' : 'column' }}>
          <Photo photo={photos[sel % photos.length]} width={width >= 900 ? 420 : width - 32} ratio={1.6} style={width >= 900 ? { width: 420 } : undefined} />
          <View style={{ padding: 18, gap: 8, flex: 1 }}>
            <Text style={d.h2}>{p.name}</Text>
            <Text style={styles.meta}>{p.client} · {p.site} · {fmtDate(p.start, lang)} → {fmtDate(p.due, lang)}</Text>
            <View style={styles.bigTrack}><View style={[styles.bigFill, { width: `${p.progress}%` }]} /></View>
            <Text style={styles.prog}>{p.progress}% {tx('complete', 'completado', 'concluído')}</Text>
            <View style={d.row}>
              <Btn small icon="share-social-outline" kind="alt" label={tx('Client progress link', 'Enlace de avance para el cliente', 'Link de progresso para o cliente')} onPress={() => onShare(p.share)} />
            </View>
          </View>
        </View>
      </Card>

      <View style={[d.row, { alignItems: 'stretch' }]}>
        <Stat label={tx('Contract budget', 'Presupuesto del contrato', 'Orçamento do contrato')} value={money(p.budget)} />
        <Stat label={tx('Planned cost', 'Costo planificado', 'Custo planejado')} value={money(p.planned)} />
        <Stat label={tx('Spent so far', 'Gastado a la fecha', 'Gasto até agora')} value={money(p.spent)} tone={over ? '#B54708' : '#067647'} />
        <Stat label={tx('Margin', 'Margen', 'Margem')} value={`${Math.round(((p.budget - p.planned) / p.budget) * 100)}%`} />
      </View>
      {over ? <Notice tone="error" text={`${over.name}: ${tx('over budget by', 'excedido en', 'acima do orçamento em')} ${money(over.spent - over.cost)}`} /> : null}

      <View style={{ flexDirection: width >= 900 ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        <Card style={{ flex: 1.3, gap: 4, width: width >= 900 ? undefined : '100%' }}>
          <Text style={[d.h2, { marginBottom: 6 }]}>{tx('Phases and tasks', 'Fases y tareas', 'Fases e tarefas')}</Text>
          {p.tasks.map((t: any) => {
            const pct = t.cost ? Math.min(140, Math.round((t.spent / t.cost) * 100)) : 0;
            return (
              <View key={t.id} style={styles.task}>
                <Pressable onPress={() => toggle(t)} disabled={busy} accessibilityRole="checkbox" accessibilityState={{ checked: !!t.done }} accessibilityLabel={t.name} style={[styles.check, t.done && styles.checkOn]}>
                  {t.done ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}
                </Pressable>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={[d.row, { justifyContent: 'space-between' }]}>
                    <Text style={[styles.taskName, t.done && { color: colors.muted }]}>{t.name}</Text>
                    <Pill label={L(PHASE[t.phase])} />
                  </View>
                  <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, pct)}%`, backgroundColor: pct > 100 ? '#F04438' : '#84ADFF' }]} /></View>
                  <Text style={styles.meta}>{money(t.spent)} / {money(t.cost)} · {tx('due', 'vence', 'prazo')} {fmtDate(t.due, lang)}</Text>
                </View>
              </View>
            );
          })}
        </Card>

        <Card style={{ flex: 1, gap: 10, width: width >= 900 ? undefined : '100%' }}>
          <Text style={d.h2}>{tx('Daily site report', 'Reporte diario de obra', 'Relatório diário de obra')}</Text>
          <Field label={tx('What happened today', 'Qué se hizo hoy', 'O que foi feito hoje')} value={note} onChangeText={setNote} multiline placeholder={tx('Walls on level 3 finished…', 'Se terminaron las paredes del nivel 3…', 'Paredes do nível 3 concluídas…')} />
          <View style={[d.row, { alignItems: 'flex-end' }]}>
            <Field label={tx('Crew on site', 'Personal en obra', 'Equipe na obra')} value={crew} onChangeText={setCrew} keyboardType="number-pad" />
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {Object.entries(WEATHER).map(([k, w]) => (
                <Pressable key={k} onPress={() => setWeather(k)} style={[styles.wBtn, weather === k && styles.wOn]} accessibilityRole="radio" accessibilityState={{ checked: weather === k }} accessibilityLabel={L(w.label)}>
                  <Ionicons name={w.icon as any} size={18} color={weather === k ? '#fff' : colors.text} />
                </Pressable>
              ))}
            </View>
          </View>
          {ok ? <Notice tone="ok" text={tx('Report saved. The client sees it in their portal.', 'Reporte guardado. El cliente lo ve en su portal.', 'Relatório salvo. O cliente vê no portal.')} /> : null}
          <Btn label={tx('Save report', 'Guardar reporte', 'Salvar relatório')} onPress={report} disabled={busy || note.trim().length < 3} />
          {p.reports.map((r: any, i: number) => (
            <View key={i} style={styles.rep}>
              <Ionicons name={(WEATHER[r.weather]?.icon || 'sunny-outline') as any} size={16} color={colors.muted} />
              <View style={{ flex: 1 }}>
                <Text style={styles.repText}>{r.note}</Text>
                <Text style={styles.meta}>{fmtDate(r.at, lang)} · {r.crew} {tx('workers', 'trabajadores', 'trabalhadores')}</Text>
              </View>
            </View>
          ))}
        </Card>
      </View>
    </Wrap>
  );
}

function Client({ code: initial }: { code: string }) {
  const { lang } = useLang();
  const { data } = useDemo<any>(initial ? null : 'construction/list');
  const code = initial || data?.projects?.[0]?.share || '';
  const [p, setP] = useState<any>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (!code) return;
    demoPublic(`construction/share/${code}`).then((r) => (r.error ? setErr(true) : setP(r.project))).catch(() => setErr(true));
  }, [code]);
  if (err) return <Wrap style={{ paddingTop: 24 }}><Notice tone="error" text={tx('This progress link is not valid.', 'Este enlace de avance no es válido.', 'Este link de progresso não é válido.')} /></Wrap>;
  if (!p) return <Wrap style={{ paddingTop: 24 }}><Text style={d.sub}>{tx('Loading…', 'Cargando…', 'Carregando…')}</Text></Wrap>;
  const phases = Object.keys(PHASE).map((k) => {
    const ts = p.tasks.filter((t: any) => t.phase === k);
    return { k, total: ts.length, done: ts.filter((t: any) => t.done).length };
  }).filter((x) => x.total);
  return (
    <Wrap style={{ paddingTop: 20, gap: 16, maxWidth: 820 }}>
      <Notice text={tx('This is what your client sees: progress and site reports, without your internal costs.', 'Esto es lo que ve tu cliente: avance y reportes, sin tus costos internos.', 'Isto é o que seu cliente vê: progresso e relatórios, sem seus custos internos.')} />
      <Card style={{ gap: 10 }}>
        <Text style={styles.kicker}>{tx('Project progress', 'Avance de la obra', 'Progresso da obra')}</Text>
        <Text style={d.h1}>{p.name}</Text>
        <Text style={styles.meta}>{p.site} · {tx('Delivery', 'Entrega', 'Entrega')} {fmtDate(p.due, lang, { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        <View style={styles.bigTrack}><View style={[styles.bigFill, { width: `${p.progress}%` }]} /></View>
        <Text style={styles.prog}>{p.progress}%</Text>
        <View style={{ gap: 8, marginTop: 6 }}>
          {phases.map((x) => (
            <View key={x.k} style={[d.row, { justifyContent: 'space-between' }]}>
              <Text style={styles.taskName}>{L(PHASE[x.k])}</Text>
              <Pill label={x.done === x.total ? tx('Done', 'Listo', 'Concluído') : `${x.done}/${x.total}`} tone={x.done === x.total ? '#067647' : '#1849A9'} bg={x.done === x.total ? '#ECFDF3' : '#EFF4FF'} />
            </View>
          ))}
        </View>
      </Card>
      <Card style={{ gap: 6 }}>
        <Text style={d.h2}>{tx('Site reports', 'Reportes de obra', 'Relatórios de obra')}</Text>
        {p.reports.map((r: any, i: number) => (
          <View key={i} style={styles.rep}>
            <Ionicons name={(WEATHER[r.weather]?.icon || 'sunny-outline') as any} size={16} color={colors.muted} />
            <View style={{ flex: 1 }}>
              <Text style={styles.repText}>{r.note}</Text>
              <Text style={styles.meta}>{fmtDate(r.at, lang, { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
            </View>
          </View>
        ))}
      </Card>
    </Wrap>
  );
}

const styles = StyleSheet.create({
  pTab: { paddingHorizontal: 14, minHeight: 38, justifyContent: 'center', borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0', maxWidth: 360 },
  pTabOn: { backgroundColor: colors.text, borderColor: colors.text },
  pTabText: { fontSize: 13.5, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12.5, color: colors.muted },
  bigTrack: { height: 12, borderRadius: 999, backgroundColor: '#F2F4F7', overflow: 'hidden', marginTop: 6 },
  bigFill: { height: '100%', backgroundColor: '#F79009', borderRadius: 999 },
  prog: { fontSize: 14, fontWeight: '800', color: colors.text },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: '#B54708', textTransform: 'uppercase' },
  task: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F2F4F7', alignItems: 'flex-start' },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: '#D0D5DD', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkOn: { backgroundColor: '#079455', borderColor: '#079455' },
  taskName: { fontSize: 14.5, fontWeight: '700', color: colors.text, flexShrink: 1 },
  track: { height: 6, borderRadius: 999, backgroundColor: '#F2F4F7', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  wBtn: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, borderColor: '#EAECF0', alignItems: 'center', justifyContent: 'center' },
  wOn: { backgroundColor: colors.text, borderColor: colors.text },
  rep: { flexDirection: 'row', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F2F4F7' },
  repText: { fontSize: 14, color: colors.text, lineHeight: 20 },
});
