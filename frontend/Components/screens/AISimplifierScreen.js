
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios"; // 👈 added axios import

export default function AISimplifierScreen({ navigation }) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem("chatHistory");
      if (savedMessages) setMessages(JSON.parse(savedMessages));
    } catch (error) {
      console.log("Error loading chat history:", error);
    }
  };

  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem("chatHistory", JSON.stringify(newMessages));
    } catch (error) {
      console.log("Error saving chat history:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const msgDate = new Date(timestamp);
    const now = new Date();

    const isToday =
      msgDate.getDate() === now.getDate() &&
      msgDate.getMonth() === now.getMonth() &&
      msgDate.getFullYear() === now.getFullYear();

    const isYesterday =
      msgDate.getDate() === now.getDate() - 1 &&
      msgDate.getMonth() === now.getMonth() &&
      msgDate.getFullYear() === now.getFullYear();

    const timeString = msgDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return timeString;
    if (isYesterday) return `Yesterday, ${timeString}`;
    return (
      msgDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + `, ${timeString}`
    );
  };

  // 🔹 Updated handleSimplify with API call to Django
  const handleSimplify = async () => {
    if (!inputText.trim()) return;

    const now = new Date().toISOString();

    try {
      // ⚠️ Adjust this URL depending on your setup
      const response = await axios.post(
        "http://10.146.254.202:8000/simplifier/simplify/",
        {
          text: inputText,
        }
      );

      const simplified = response.data.simplified_text;

      const newMessage = {
        user: inputText,
        ai: simplified,
        timestamp: now,
      };

      const newMessages = [...messages, newMessage];
      setMessages(newMessages);
      saveMessages(newMessages);
      setInputText("");

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error calling simplifier API:", error);

      const newMessage = {
        user: inputText,
        ai: "⚠ Sorry, could not simplify right now. Please try again.",
        timestamp: now,
      };

      const newMessages = [...messages, newMessage];
      setMessages(newMessages);
      saveMessages(newMessages);
    }
  };

  const clearChatHistory = () => {
    Alert.alert("Clear Chat History", "Are you sure you want to delete all previous chats?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("chatHistory");
            setMessages([]);
          } catch (error) {
            console.log("Error clearing chat history:", error);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F5F5F5" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>AI Simplifier 🤖</Text>
        <TouchableOpacity onPress={clearChatHistory}>
          <Icon name="trash-outline" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView
        style={styles.chatContainer}
        ref={scrollRef}
        contentContainerStyle={{ padding: 16 }}
      >
        {messages.map((msg, index) => (
          <View key={index} style={styles.messageBlock}>
            <View style={styles.userBubble}>
              <Text style={styles.userText}>{msg.user}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(msg.timestamp)}</Text>
            </View>
            <View style={styles.aiBubble}>
              <Text style={styles.aiText}>{msg.ai}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(msg.timestamp)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Section */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Type something difficult..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.button} onPress={handleSimplify}>
          <Text style={styles.buttonText}>✨ Simplify</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FF9800",
  },
  headerText: { fontSize: 20, fontWeight: "bold", color: "white" },
  chatContainer: { flex: 1, backgroundColor: "#F5F5F5" },
  messageBlock: { marginBottom: 12 },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#FF9800",
    padding: 12,
    borderRadius: 16,
    maxWidth: "80%",
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    marginTop: 6,
    maxWidth: "80%",
    elevation: 2,
  },
  userText: { color: "#fff", fontSize: 15 },
  aiText: { color: "#333", fontSize: 15, lineHeight: 22 },
  timestamp: {
    fontSize: 10,
    color: "#555",
    marginTop: 4,
    textAlign: "right",
  },
  inputWrapper: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    marginRight: 8,
    backgroundColor: "#FAFAFA",
    maxHeight: 100,
  },
  button: {
    backgroundColor: "#FF9800",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 15, fontWeight: "bold" },
});
