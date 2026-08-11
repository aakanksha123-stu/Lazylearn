import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";

export default function FactModal({
  visible,
  close,
  fact,
  subject,
  loading
}) {

  return (
    <Modal visible={visible} transparent animationType="fade">

      <View style={styles.overlay}>

        <View style={styles.card}>

          {/* TITLE */}
          <Text style={styles.title}>💡 Quick Fact</Text>

          {/* SUBJECT */}
          <Text style={styles.subject}>
            Subject: {subject}
          </Text>

          {/* FACT OR LOADING */}
          {loading ? (
            <ActivityIndicator size="large" color="#FF9800" />
          ) : (
            <Text style={styles.fact}>
              {fact}
            </Text>
          )}

          {/* BUTTON */}
          {!loading && (
            <TouchableOpacity style={styles.btn} onPress={close}>
              <Text style={styles.btnText}>Got It ✔</Text>
            </TouchableOpacity>
          )}

        </View>

      </View>

    </Modal>
  );
}

// =======================
// 🎨 STYLES
// =======================
const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  },

  card: {
    backgroundColor: "white",
    padding: 25,
    width: "85%",
    borderRadius: 16,
    alignItems: "center",
    elevation: 5
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F57C00",
    marginBottom: 10
  },

  subject: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10
  },

  fact: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 15,
    color: "#333"
  },

  btn: {
    backgroundColor: "#FF9800",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10
  },

  btnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  }

});