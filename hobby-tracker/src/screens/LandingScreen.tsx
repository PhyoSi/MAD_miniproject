import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  FeatureSection,
  LandingCtaSection,
  LandingFooter,
  LandingHero,
  ProblemSection,
  catchphrases,
} from '@/src/components/landing';
import { landingLayout } from '@/src/components/landing/tokens';

import { colors } from '@/src/constants/theme';

type LandingScreenProps = {
  isLaunching: boolean;
  onLaunch: () => void;
};

export default function LandingScreen({ isLaunching, onLaunch }: LandingScreenProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const riseAnim = useRef(new Animated.Value(12)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [featuresY, setFeaturesY] = useState(0);

  const isWide = width >= 1024;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(riseAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, riseAnim]);

  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % catchphrases.length);
    }, 2800);

    return () => clearInterval(phraseTimer);
  }, []);

  useEffect(() => {
    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(ctaAnim, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ctaAnim, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    drift.start();

    return () => drift.stop();
  }, [ctaAnim]);

  const featureColumns = useMemo(() => (isWide ? 3 : width >= 740 ? 2 : 1), [isWide, width]);

  const handleLearnMore = () => {
    scrollRef.current?.scrollTo({ y: Math.max(featuresY - 12, 0), animated: true });
  };

  const handleFeaturesLayout = (event: LayoutChangeEvent) => {
    setFeaturesY(event.nativeEvent.layout.y);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.glow, styles.glowOne]} />
      <View style={[styles.glow, styles.glowTwo]} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LandingHero
          fadeAnim={fadeAnim}
          riseAnim={riseAnim}
          ctaAnim={ctaAnim}
          currentCatchphrase={catchphrases[phraseIndex]}
          isLaunching={isLaunching}
          onLaunch={onLaunch}
          onLearnMore={handleLearnMore}
        />
        <View onLayout={handleFeaturesLayout}>
          <FeatureSection isWide={isWide} featureColumns={featureColumns} />
        </View>
        <ProblemSection />
        <LandingCtaSection isLaunching={isLaunching} onLaunch={onLaunch} />
        <LandingFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  glow: {
    position: 'absolute',
    borderRadius: landingLayout.glowRadius,
    opacity: landingLayout.glowOpacity,
  },
  glowOne: {
    width: 260,
    height: 260,
    backgroundColor: colors.primary,
    top: -80,
    right: -80,
  },
  glowTwo: {
    width: 320,
    height: 320,
    backgroundColor: colors.secondary,
    bottom: -130,
    left: -140,
  },
});
