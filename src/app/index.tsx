import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Pixel art ───────────────────────────────────────────────────────────────
const PX = 10;

const PALETTE: Record<string, string | undefined> = {
  K: '#111111', // outline
  G: '#bdbdbd', // gray cat body
  D: '#888888', // dark gray shadow
  g: '#777777', // dark gray shadow (right-side, pupils)
  W: '#ffffff', // white (eyes)
  P: '#ff9999', // pink poptart
  L: '#ffbbcc', // light pink highlight
  B: '#cc9944', // tan crust
  F: '#ff6677', // blush
  N: '#cc3355', // nose
};

// ' ' = transparent; other chars map via PALETTE
const SPRITE = [
  '      KKKK                    ',
  '    KKDGGGDgKK                ',
  '   KGGGGGGGGGgK               ',
  '   KGKWKGGKWKgK    KBBBBBBBK  ',
  '  KGGGGGGGGGGGgKKKBPPPPPPPBK  ',
  '  KGGDGGGGDGGGgKBPPLPPPLPPBK  ',
  '  KGGGGGGGGGGGgKBPPPPPPPPPBK  ',
  '  KGGGGGGGGGGGgKBPPLPPPLPPBK  ',
  '  KGGGGGGGGGGGgKBPPPPPPPPPBK  ',
  '  KGGGGNFGGGGGgKBPPLPPPLPPBK  ',
  '  KGGGGGGGGGGGgKBPPPPPPPPPBK  ',
  '   KGGGGGGGGGgK  KBBBBBBBK    ',
  '    KKDGGGDgKK                ',
  '     K      K                 ',
  '    KK      KK   KK    KK     ',
];

// Poptart starts at row 3, ends at row 11 → 9 rows × PX = 90px height
// Rainbow should align with poptart body center
const SPRITE_H = SPRITE.length * PX;
const CAT_TOP = SH / 2 - SPRITE_H / 2;
const POPTART_START_ROW = 3;
const POPTART_END_ROW = 11;
const RAINBOW_CENTER_Y =
  CAT_TOP + POPTART_START_ROW * PX + ((POPTART_END_ROW - POPTART_START_ROW) * PX) / 2;

// ─── Rainbow ─────────────────────────────────────────────────────────────────
const RAINBOW = ['#ff0000', '#ff9900', '#ffff00', '#00cc00', '#0066ff', '#8800ff'];
const STRIPE_H = 12;
const RAINBOW_H = RAINBOW.length * STRIPE_H;
const RAINBOW_TOP = RAINBOW_CENTER_Y - RAINBOW_H / 2;

function Rainbow() {
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(offset, { toValue: -SW, duration: 700, useNativeDriver: true }),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { transform: [{ translateX: offset }], overflow: 'visible' },
      ]}>
      {[0, 1, 2].map(copy =>
        RAINBOW.map((color, i) => (
          <View
            key={`${copy}-${i}`}
            style={{
              position: 'absolute',
              left: copy * SW,
              top: RAINBOW_TOP + i * STRIPE_H,
              width: SW,
              height: STRIPE_H,
              backgroundColor: color,
            }}
          />
        )),
      )}
    </Animated.View>
  );
}

// ─── Stars ───────────────────────────────────────────────────────────────────
interface StarDef {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

// Pre-generate deterministic-ish star positions (random but stable across renders)
const STARS: StarDef[] = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: ((i * 137.5) % (SW * 0.6)),
  y: ((i * 93.7) % SH),
  size: 4 + (i % 4),
  delay: (i * 200) % 2000,
  duration: 400 + (i % 3) * 200,
}));

function Star({ x, y, size, delay, duration }: StarDef) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.4, duration, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        transform: [{ scale }],
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}>
      <View style={{ width: size / 5, height: size, backgroundColor: '#ffffff' }} />
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size / 5,
          backgroundColor: '#ffffff',
        }}
      />
    </Animated.View>
  );
}

// ─── Cat bob ─────────────────────────────────────────────────────────────────
function NyanCat() {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -6, duration: 150, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 6, duration: 150, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY: bob }] }}>
      {SPRITE.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {Array.from(row).map((char, colIdx) => {
            const color = PALETTE[char];
            return (
              <View
                key={colIdx}
                style={[styles.pixel, color ? { backgroundColor: color } : null]}
              />
            );
          })}
        </View>
      ))}
    </Animated.View>
  );
}

// ─── Scene ───────────────────────────────────────────────────────────────────
export default function NyanScreen() {
  const catLeft = SW * 0.35;

  return (
    <View style={styles.bg}>
      {STARS.map(s => (
        <Star key={s.id} {...s} />
      ))}
      <Rainbow />
      <View style={[styles.catWrap, { top: CAT_TOP, left: catLeft }]}>
        <NyanCat />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#0a0a2e',
    overflow: 'hidden',
  },
  catWrap: {
    position: 'absolute',
  },
  row: {
    flexDirection: 'row',
  },
  pixel: {
    width: PX,
    height: PX,
    backgroundColor: 'transparent',
  },
});
