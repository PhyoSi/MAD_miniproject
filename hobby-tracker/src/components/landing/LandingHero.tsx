import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';

import { colors } from '@/src/constants/theme';
import { heroStats } from './content';
import { landingLayout, landingPalette } from './tokens';

type LandingHeroProps = {
  fadeAnim: Animated.Value;
  riseAnim: Animated.Value;
  ctaAnim: Animated.Value;
  currentCatchphrase: string;
  isLaunching: boolean;
  onLaunch: () => void;
  onLearnMore: () => void;
};

export default function LandingHero({
  fadeAnim,
  riseAnim,
  ctaAnim,
  currentCatchphrase,
  isLaunching,
  onLaunch,
  onLearnMore,
}: LandingHeroProps) {
  const { width, height } = useWindowDimensions();
  const catchphraseAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const isWide = width >= 980;

  useEffect(() => {
    catchphraseAnim.setValue(0);
    Animated.timing(catchphraseAnim, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start();
  }, [catchphraseAnim, currentCatchphrase]);

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();
    return () => floatLoop.stop();
  }, [floatingAnim]);

  const catchphraseOpacity = catchphraseAnim;
  const catchphraseTranslate = catchphraseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  const ctaScale = ctaAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.045],
  });

  const ctaTranslateY = ctaAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const ctaRotate = ctaAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-1deg'],
  });

  const floatY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const heroMinHeight = Math.max(640, height * 0.92);

  return (
    <View style={[styles.heroSection, { minHeight: heroMinHeight }]}> 
      <View style={[styles.glowOrb, styles.glowOrbTop]} />
      <View style={[styles.glowOrb, styles.glowOrbBottom]} />

      <Animated.View
        style={[
          styles.heroContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: riseAnim }],
            flexDirection: isWide ? 'row' : 'column',
          },
        ]}
      >
        <View style={styles.leftPane}>
          <Surface style={styles.kickerBadge} elevation={0}>
            <Text variant="labelLarge" style={styles.kicker}>
              🔥 Track. Streak. Achieve.
            </Text>
          </Surface>

          <Text variant="displayMedium" style={styles.heroTitle}>
            Your Hobbies, <Text style={styles.heroTitleAccent}>One Place</Text>
          </Text>

          <Animated.Text
            style={[
              styles.heroSubTitle,
              {
                opacity: catchphraseOpacity,
                transform: [{ translateY: catchphraseTranslate }],
              },
            ]}
          >
            {currentCatchphrase}
          </Animated.Text>

          <Text variant="bodyLarge" style={styles.heroBody}>
            HobbyIt helps you organize every passion, log sessions in moments, and maintain
            consistency with meaningful progress stats.
          </Text>

          <View style={styles.ctaRow}>
            <Animated.View
              style={{
                transform: [{ scale: ctaScale }, { translateY: ctaTranslateY }, { rotate: ctaRotate }],
              }}
            >
              <Button
                mode="contained"
                style={styles.launchButton}
                contentStyle={styles.launchButtonContent}
                onPress={onLaunch}
                loading={isLaunching}
                disabled={isLaunching}
              >
                {isLaunching ? 'Preparing App...' : '🚀 Launch App'}
              </Button>
            </Animated.View>

            <Button
              mode="outlined"
              style={styles.learnButton}
              textColor={colors.text}
              onPress={onLearnMore}
            >
              Learn More ↓
            </Button>
          </View>

          <View style={styles.metricRow}>
            {heroStats.map(item => (
              <Surface key={item.label} style={styles.metricCard} elevation={0}>
                <Text variant="titleMedium" style={styles.metricValue}>
                  {item.value}
                </Text>
                <Text variant="bodySmall" style={styles.metricLabel}>
                  {item.label}
                </Text>
              </Surface>
            ))}
          </View>
        </View>

        <View style={styles.rightPane}>
          <Animated.View style={[styles.illustrationCard, { transform: [{ translateY: floatY }] }]}>
            <Text variant="titleLarge" style={styles.illustrationTitle}>
              Hobby Tracker
            </Text>
            <View style={styles.illustrationPanel}>
              <Text style={styles.illustrationHeading}>Today</Text>
              <Text style={styles.illustrationItem}>🎸 Guitar • 35 min</Text>
              <Text style={styles.illustrationItem}>📚 Reading • 20 min</Text>
              <Text style={styles.illustrationItem}>🏃 Running • 25 min</Text>
            </View>
            <View style={styles.streakChip}>
              <Text style={styles.streakText}>🔥 8 day streak</Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    backgroundColor: landingPalette.heroBackground,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.24,
  },
  glowOrbTop: {
    width: 360,
    height: 360,
    backgroundColor: landingPalette.glowOrange,
    top: -120,
    left: -80,
  },
  glowOrbBottom: {
    width: 380,
    height: 380,
    backgroundColor: landingPalette.glowPink,
    bottom: -140,
    right: -100,
  },
  heroContent: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 28,
    paddingHorizontal: 20,
    paddingVertical: 44,
  },
  leftPane: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
  },
  rightPane: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  kickerBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: landingPalette.cardBorderSoft,
    backgroundColor: landingPalette.glassCard,
    marginBottom: 14,
  },
  kicker: {
    letterSpacing: 0.4,
    color: colors.text,
    fontWeight: '700',
  },
  heroTitle: {
    color: colors.text,
    fontWeight: '800',
    lineHeight: 64,
  },
  heroTitleAccent: {
    color: colors.accent,
  },
  heroSubTitle: {
    color: colors.warning,
    marginTop: 12,
    minHeight: 30,
    fontSize: 22,
    fontWeight: '700',
  },
  heroBody: {
    color: colors.textSecondary,
    marginTop: 14,
    maxWidth: 620,
    lineHeight: 24,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
  },
  metricRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    minWidth: 140,
    borderRadius: landingLayout.cardRadiusMd,
    borderWidth: 1,
    borderColor: landingPalette.metricCardBorder,
    backgroundColor: landingPalette.glassCard,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  metricValue: {
    color: colors.accent,
    fontWeight: '700',
  },
  metricLabel: {
    color: colors.text,
    marginTop: 4,
  },
  launchButton: {
    borderRadius: 12,
    backgroundColor: landingPalette.gradientOrange,
    borderWidth: 1,
    borderColor: landingPalette.cardBorderStrong,
    alignSelf: 'flex-start',
  },
  launchButtonContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  learnButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: landingPalette.cardBorderSoft,
    backgroundColor: landingPalette.glassCard,
  },
  illustrationCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: landingLayout.heroRadius,
    borderWidth: 1,
    borderColor: landingPalette.cardBorderStrong,
    backgroundColor: '#121D30',
    padding: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  illustrationTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 12,
  },
  illustrationPanel: {
    borderRadius: landingLayout.cardRadiusMd,
    backgroundColor: '#1A2944',
    borderWidth: 1,
    borderColor: landingPalette.cardBorderSoft,
    padding: 12,
    gap: 6,
  },
  illustrationHeading: {
    color: colors.accent,
    fontWeight: '700',
  },
  illustrationItem: {
    color: colors.text,
    fontSize: 15,
  },
  streakChip: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: '#293245',
    borderWidth: 1,
    borderColor: landingPalette.cardBorderSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakText: {
    color: colors.text,
    fontWeight: '700',
  },
});
