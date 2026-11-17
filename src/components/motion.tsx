import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, PressableProps, StyleProp, View, ViewStyle } from 'react-native';

// Small, calm motion used across Sylkit (React Native Animated, no extra libraries):
//  - Reveal: content fades and rises into place the first time it scrolls into view.
//  - PressScale: a pressable that sinks slightly while pressed and springs back.
//  - Lift: on desktop, a card rises a few pixels with a softer shadow while hovered.
//  - glass / glassDark: frosted-glass surfaces (translucent + background blur on the web).
// Everything respects "reduce motion" and never hides content if JavaScript is slow:
// pages are rendered visible on the server and only animate after they load.

const native = Platform.OS !== 'web';

function reducedMotion() {
  try {
    return Platform.OS === 'web' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function Reveal({ children, delay = 0, style, distance = 18, mount }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle>; distance?: number; mount?: boolean }) {
  const ref = useRef<View>(null);
  const progress = useRef(new Animated.Value(1)).current; // visible on the server and before hydration
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (reducedMotion()) return;
    const node = ref.current as unknown as Element | null;
    const run = () => Animated.timing(progress, { toValue: 1, duration: 520, delay, easing: Easing.out(Easing.cubic), useNativeDriver: native }).start();
    if (mount || Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined' || !node || typeof (node as any).getBoundingClientRect !== 'function') {
      progress.setValue(0);
      setArmed(true);
      run();
      return;
    }
    // Only animate what is still below the fold; what the visitor already sees stays put.
    const r = node.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) return;
    progress.setValue(0);
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const animated = armed
    ? { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }, { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) }] }
    : null;
  return (
    <Animated.View ref={ref as any} style={[style, animated]}>
      {children}
    </Animated.View>
  );
}

type PressScaleProps = PressableProps & { style?: StyleProp<ViewStyle>; to?: number; children?: ReactNode };

export function PressScale({ style, to = 0.97, children, onPressIn, onPressOut, ...rest }: PressScaleProps) {
  const s = useRef(new Animated.Value(1)).current;
  const go = (v: number) => Animated.spring(s, { toValue: v, speed: 40, bounciness: v === 1 ? 7 : 0, useNativeDriver: native }).start();
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        go(to);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        go(1);
        onPressOut?.(e);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale: s }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

// Hover lift for desktop cards. Returns handlers for a Pressable and the animated style for its child.
export function useLift(height = 4) {
  const v = useRef(new Animated.Value(0)).current;
  const to = (x: number) => Animated.timing(v, { toValue: x, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: native }).start();
  return {
    onHoverIn: () => to(1),
    onHoverOut: () => to(0),
    style: { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -height] }) }] },
    shadow: { opacity: v },
  };
}

// Frosted glass. On the web the blur is real (backdrop-filter); on phones the translucency still reads well.
export const glass = {
  backgroundColor: 'rgba(255,255,255,0.68)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(18px) saturate(170%)',
  WebkitBackdropFilter: 'blur(18px) saturate(170%)',
  boxShadow: '0 8px 30px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.7)',
} as any;

export const glassDark = {
  backgroundColor: 'rgba(12,16,28,0.42)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.22)',
  backdropFilter: 'blur(14px) saturate(160%)',
  WebkitBackdropFilter: 'blur(14px) saturate(160%)',
} as any;

// A soft halo that breathes a few times around the help bubble, then rests.
export function useHalo(times = 3) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reducedMotion()) return;
    const one = Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: native }),
      Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: native }),
      Animated.delay(900),
    ]);
    const loop = Animated.sequence([Animated.delay(1600), Animated.loop(one, { iterations: times })]);
    loop.start();
    return () => loop.stop();
  }, []);
  return {
    opacity: v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.45, 0] }),
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
  };
}
