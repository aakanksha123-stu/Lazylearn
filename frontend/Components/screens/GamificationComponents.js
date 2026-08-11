import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PointsCounter = ({ points }) => (
  <View style={styles.gamifyBox}>
    <Text style={styles.label}>Points: {points} 🎉</Text>
    <Text>Coins: {Math.floor(points / 10)} 💰</Text> {/* Simple conversion */}
  </View>
);

export const GuiltMeter = ({ guiltLevel, avatar }) => (
  <View style={styles.gamifyBox}>
    <Text style={styles.label}>Guilt Meter: {guiltLevel}/100 {avatar}</Text>
    <View style={[styles.meter, { width: `${guiltLevel}%` }]} />
  </View>
);

export const BadgesDisplay = ({ badges }) => (
  <View style={styles.gamifyBox}>
    <Text style={styles.label}>Badges:</Text>
    {badges.map((badge, index) => (
      <Text key={index}>🏆 {badge}</Text>
    ))}
    {badges.length === 0 && <Text>No badges yet! Keep quizzing! 📚</Text>}
  </View>
);

// Leaderboard placeholder (fetch from Firebase in full impl)
export const Leaderboard = () => {
  // Use useEffect to fetch from Firebase Realtime DB: database().ref('leaderboards')
  return <Text>Leaderboard: Coming soon! 👥</Text>;
};

const styles = StyleSheet.create({
  gamifyBox: { backgroundColor: '#f0f8ff', padding: 15, borderRadius: 10, margin: 10, alignItems: 'center' },
  label: { fontSize: 16, fontWeight: 'bold' },
  meter: { height: 10, backgroundColor: 'red', borderRadius: 5 },
});