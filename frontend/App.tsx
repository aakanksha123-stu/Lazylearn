// App.tsx

import React, { useState, useEffect, createContext } from "react";
import {
  Platform,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AsyncStorage from "@react-native-async-storage/async-storage";
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from "react-native-gesture-handler";

import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from "@notifee/react-native";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// ==============================
// 🧠 GLOBAL GAME CONTEXT (NEW)
// ==============================
export const GameContext = createContext<any>(null);

// ==============================
// TYPES
// ==============================
type RootParamList = {
  Main: undefined;
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  SurveyForm: undefined;
  Notebook: undefined;
  AISimplifier: undefined;
  Profile: undefined;
  InterruptQuiz: undefined;
  GameScreen: undefined;
  GameSummary: undefined;
};

// ==============================
// SCREENS
// ==============================
import Home from "./Components/screens/Home";
import LogIn from "./Components/screens/LogIn";
import SignUp from "./Components/screens/SignUp";
import DashboardScreen from "./Components/screens/DashboardScreen";
import NotebookScreen from "./Components/screens/NotebookScreen";
import AISimplifierScreen from "./Components/screens/AISimplifierScreen";
import SurveyForm from "./Components/screens/SurveyForm";
import ProfileScreen from "./Components/screens/ProfileScreen";
import InterruptQuiz from "./Components/screens/InterruptQuiz";

import GameScreen from "./Components/screens/GameScreen";
import SessionSummaryScreen from "./Components/screens/SessionSummaryScreen";

// Services
import { UsageMonitorService } from "./Components/services/UsageMonitorService";

export const navigationRef = createNavigationContainerRef<RootParamList>();

const Stack = createNativeStackNavigator();

/* =============================
   Notification Setup
============================= */
const setupNotifications = async () => {
  try {
    if (Platform.OS === "android") {
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
        Alert.alert(
          "Permission Required",
          "Please allow notifications to receive reminders."
        );
        return;
      }

      await notifee.createChannel({
        id: "reminder-channel",
        name: "High Priority Reminders",
        importance: AndroidImportance.HIGH,
        vibration: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/* =============================
   APP ROOT
============================= */
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSurveyDone, setIsSurveyDone] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🎮 GAME STATE (NEW)
  const [gameState, setGameState] = useState({
    board: [],
    score: 0,
    steps: [],
  });

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await AsyncStorage.getItem("isAuthenticated");
      const survey = await AsyncStorage.getItem("isSurveyDone");

      setIsAuthenticated(auth === "true");
      setIsSurveyDone(survey === "true");

      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    setupNotifications();
  }, []);

  useEffect(() => {
    UsageMonitorService.setOnTrigger(() => {
      Alert.alert(
        "Quick Quiz Time! 🧠",
        "You've been scrolling for a while 😅",
        [
          { text: "Skip", style: "cancel" },
          {
            text: "Continue",
            onPress: () => {
              if (navigationRef.isReady()) {
                navigationRef.navigate("InterruptQuiz");
              }
            },
          },
        ]
      );
    });

    UsageMonitorService.init();

    return () => UsageMonitorService.stop();
  }, []);

  if (loading) return null;

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsAuthenticated(false);
    setIsSurveyDone(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 🧠 PROVIDE GAME CONTEXT */}
      <GameContext.Provider value={{ gameState, setGameState }}>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
              <>
                <Stack.Screen name="Main" component={MainScreen} />
                <Stack.Screen name="Home" component={Home} />

                <Stack.Screen name="Login">
                  {(props) => (
                    <LogIn
                      {...props}
                      setIsAuthenticated={async (val: boolean) => {
                        setIsAuthenticated(val);
                        if (val) {
                          await AsyncStorage.setItem("isAuthenticated", "true");
                        }
                      }}
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen name="Signup" component={SignUp} />
              </>
            ) : (
              <>
                <Stack.Screen name="Dashboard">
                  {(props) => (
                    <DashboardScreen {...props} onLogout={handleLogout} />
                  )}
                </Stack.Screen>

                <Stack.Screen name="SurveyForm">
                  {(props) => (
                    <SurveyForm
                      {...props}
                      setIsSurveyDone={async (val: boolean) => {
                        setIsSurveyDone(val);
                        if (val) {
                          await AsyncStorage.setItem("isSurveyDone", "true");
                        }
                      }}
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen name="Notebook" component={NotebookScreen} />
                <Stack.Screen name="AISimplifier" component={AISimplifierScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />

                <Stack.Screen name="InterruptQuiz" component={InterruptQuiz} />

                {/* 🎮 BRAINCANDY */}
                <Stack.Screen name="GameScreen" component={GameScreen} />
                <Stack.Screen name="GameSummary" component={SessionSummaryScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </GameContext.Provider>
    </GestureHandlerRootView>
  );
};

/* =============================
   MAIN SCREEN
============================= */
const MainScreen = ({ navigation }: { navigation: NativeStackNavigationProp<any> }) => (
  <ImageBackground
    source={require("./assets/background.jpg")}
    style={styles.background}
  >
    <View style={styles.main}>
      <Text style={styles.welcomeText}>
        Welcome to{" "}
        <Text style={{ fontSize: 45, fontWeight: "bold", color: "#ff9d00" }}>
          LazyLearn 📖
        </Text>
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.button}>START</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
);

/* =============================
   STYLES
============================= */
const styles = StyleSheet.create({
  main: {
    flex: 1,
    position: "absolute",
  },

  welcomeText: {
    fontSize: 40,
    color: "#ffb74d",
    textAlign: "center",
    marginTop: 40,
    padding: 40,
  },

  button: {
    width: 150,
    height: 60,
    backgroundColor: "#ff9d00",
    color: "#fff",
    fontSize: 30,
    textAlign: "center",
    padding: 10,
    marginLeft: 130,
    marginTop: 600,
    borderRadius: 40,
  },

  background: {
    flex: 1,
    justifyContent: "center",
  },
});

export default App;