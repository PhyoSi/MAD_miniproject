import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';

import { colors } from '@/src/constants/theme';
import { valuePoints } from './content';
import { landingLayout, landingPalette } from './tokens';

export default function ProblemSection() {
  return (
    <View style={styles.section}>
      <View style={styles.problemOrb} />
      <View style={styles.sectionInner}>
        <Text variant="headlineMedium" style={styles.sectionTitle}>
          Sound familiar?
        </Text>

        <View style={styles.cardGrid}>
          {valuePoints.map(point => (
            <ProblemCard
              key={point.problem}
              emoji={point.emoji}
              problem={point.problem}
              solution={point.solution}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

type ProblemCardProps = {
  emoji: string;
  problem: string;
  solution: string;
};

function ProblemCard({ emoji, problem, solution }: ProblemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable onHoverIn={() => setIsHovered(true)} onHoverOut={() => setIsHovered(false)} style={styles.cardPressable}>
      <Surface style={[styles.valueCard, isHovered && styles.valueCardHovered]} elevation={0}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text variant="titleMedium" style={styles.valueTitle}>
          {problem}
        </Text>
        <View style={styles.solutionDivider} />
        <Text variant="bodyMedium" style={styles.solutionText}>
          {solution}
        </Text>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: landingPalette.problemBackground,
    paddingVertical: 56,
    overflow: 'hidden',
  },
  sectionInner: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 20,
    gap: landingLayout.sectionGap + 8,
  },
  problemOrb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 999,
    right: -120,
    top: 30,
    backgroundColor: landingPalette.glowOrange,
    opacity: 0.18,
  },
  sectionTitle: {
    color: colors.text,
    textAlign: 'center',
    fontWeight: '800',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  cardPressable: {
    width: '32.2%',
    minWidth: 240,
  },
  valueCard: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: landingLayout.cardRadiusMd,
    backgroundColor: landingPalette.glassCard,
    borderWidth: 1,
    borderColor: landingPalette.cardBorderSoft,
    minHeight: 220,
  },
  valueCardHovered: {
    transform: [{ scale: 1.02 }],
    borderColor: landingPalette.cardBorderStrong,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  valueTitle: {
    color: colors.text,
    fontWeight: '700',
    lineHeight: 24,
  },
  solutionDivider: {
    height: 3,
    width: 68,
    borderRadius: 999,
    backgroundColor: landingPalette.gradientOrange,
    marginTop: 12,
    marginBottom: 12,
  },
  solutionText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
