import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';

import { colors } from '@/src/constants/theme';
import { landingLayout, landingPalette } from './tokens';

type LandingCtaSectionProps = {
  isLaunching: boolean;
  onLaunch: () => void;
};

export default function LandingCtaSection({ isLaunching, onLaunch }: LandingCtaSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionInner}>
        <Surface style={styles.banner} elevation={0}>
          <View style={styles.bannerGlowOne} />
          <View style={styles.bannerGlowTwo} />

          <Text variant="headlineMedium" style={styles.title}>
            Ready to track your passions?
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Join HobbyIt and build consistent progress with every session you log.
          </Text>

          <Button
            mode="contained"
            style={styles.ctaButton}
            contentStyle={styles.ctaButtonContent}
            onPress={onLaunch}
            loading={isLaunching}
            disabled={isLaunching}
            labelStyle={styles.ctaButtonLabel}
          >
            {isLaunching ? 'Preparing App...' : '🚀 Launch HobbyIt Now'}
          </Button>
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: landingPalette.lightSectionBackground,
    paddingTop: 8,
    paddingBottom: 56,
  },
  sectionInner: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  banner: {
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#FDBA74',
    backgroundColor: landingPalette.gradientOrange,
    paddingVertical: 38,
    paddingHorizontal: 22,
    alignItems: 'center',
    gap: 10,
  },
  bannerGlowOne: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 999,
    top: -100,
    left: -40,
    backgroundColor: '#FDE68A',
    opacity: 0.22,
  },
  bannerGlowTwo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
    bottom: -120,
    right: -60,
    backgroundColor: landingPalette.gradientPink,
    opacity: 0.22,
  },
  title: {
    color: '#111827',
    textAlign: 'center',
    fontWeight: '800',
  },
  subtitle: {
    color: '#1F2937',
    textAlign: 'center',
    maxWidth: 700,
    lineHeight: 24,
    marginTop: 6,
  },
  ctaButton: {
    marginTop: 14,
    borderRadius: landingLayout.cardRadiusMd,
    backgroundColor: '#FFFFFF',
  },
  ctaButtonContent: {
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  ctaButtonLabel: {
    color: '#111827',
    fontWeight: '800',
  },
});
