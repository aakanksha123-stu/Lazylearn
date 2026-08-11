import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

const SessionSummaryScreen = ({ navigation, route }) => {

  // 📊 DATA FROM GAME
  const score = route?.params?.score || 0;
  const facts = route?.params?.facts || 0;
  const streak = route?.params?.streak || 0;

  return (
    <SafeAreaView style={styles.container}>

      {/* 🎉 TITLE */}
      <Text style={styles.title}>🎉 Session Complete!</Text>

      {/* 📊 CARD */}
      <View style={styles.card}>

        <View style={styles.row}>
          <Text style={styles.label}>Score</Text>
          <Text style={styles.value}>{score}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Facts Learned</Text>
          <Text style={styles.value}>{facts}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Best Streak</Text>
          <Text style={styles.value}>{streak}</Text>
        </View>

      </View>

      {/* 🔁 PLAY AGAIN */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("GameScreen")}
      >
        <Text style={styles.buttonText}>🔁 Play Again</Text>
      </TouchableOpacity>

      {/* 📖 VIEW FACTS (future feature) */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#4CAF50" }]}
        onPress={() => alert("Coming Soon 🚀")}
      >
        <Text style={styles.buttonText}>📖 View Facts</Text>
      </TouchableOpacity>

      {/* 🏠 HOME */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#555" }]}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Text style={styles.buttonText}>🏠 Back to Dashboard</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

export default SessionSummaryScreen;

// ============================
// 🎨 STYLES
// ============================
const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 20
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#F57C00"
  },

  card: {
    backgroundColor: "white",
    width: "100%",
    padding: 20,
    borderRadius: 16,
    elevation: 5,
    marginBottom: 30
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10
  },

  label: {
    fontSize: 16,
    color: "#666"
  },

  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333"
  },

  button: {
    backgroundColor: "#F57C00",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginVertical: 8,
    width: "100%",
    alignItems: "center"
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  }

});