import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { landingPalette } from './tokens';

export default function LandingFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>© 2026 HobbyIt — Built by Phyo Sithu</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: landingPalette.footerBackground,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#4B5563',
    textAlign: 'center',
    fontWeight: '500',
  },
});
