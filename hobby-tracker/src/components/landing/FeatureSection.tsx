import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';

import { colors } from '@/src/constants/theme';
import { features } from './content';
import { landingLayout, landingPalette } from './tokens';

type FeatureSectionProps = {
  isWide: boolean;
  featureColumns: number;
};

export default function FeatureSection({ isWide, featureColumns }: FeatureSectionProps) {
  const cardWidth = isWide ? `${100 / featureColumns - 1.4}%` : '100%';

  return (
    <View style={styles.section}>
      <View style={styles.sectionInner}>
        <Text variant="headlineMedium" style={styles.sectionTitle}>
          Everything you need to stay consistent
        </Text>
        <View style={styles.featureGrid}>
          {features.map(feature => (
            <FeatureCard key={feature.title} feature={feature} width={cardWidth} />
          ))}
        </View>
      </View>
    </View>
  );
}

type FeatureCardProps = {
  feature: {
    icon: string;
    title: string;
    description: string;
  };
  width: string;
};

function FeatureCard({ feature, width }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable onHoverIn={() => setIsHovered(true)} onHoverOut={() => setIsHovered(false)} style={{ width }}>
      <Surface style={[styles.featureCard, isHovered && styles.featureCardHovered]} elevation={0}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>{feature.icon}</Text>
        </View>
        <Text variant="titleMedium" style={styles.featureTitle}>
          {feature.title}
        </Text>
        <Text variant="bodyMedium" style={styles.featureDescription}>
          {feature.description}
        </Text>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: landingPalette.lightSectionBackground,
    paddingVertical: 56,
  },
  sectionInner: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 20,
    gap: landingLayout.sectionGap + 8,
  },
  sectionTitle: {
    color: '#111827',
    textAlign: 'center',
    fontWeight: '800',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  featureCard: {
    borderRadius: landingLayout.cardRadiusLg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    minHeight: 188,
  },
  featureCardHovered: {
    transform: [{ translateY: -4 }],
    shadowColor: '#111827',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: landingPalette.gradientOrange,
    borderWidth: 1,
    borderColor: landingPalette.gradientPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 22,
  },
  featureTitle: {
    color: '#111827',
    fontWeight: '700',
  },
  featureDescription: {
    color: '#4B5563',
    marginTop: 8,
    lineHeight: 21,
  },
});
