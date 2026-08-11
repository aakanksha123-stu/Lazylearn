import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StyleSheet,
  ToastAndroid,
  Platform,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = ({ navigation, onLogout }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [userData, setUserData] = useState({ name: '' });
  const [quizScore, setQuizScore] = useState(0);
  const [quizStats, setQuizStats] = useState({ correct: 0, total: 0 });

  // ✅ Fetch user data and quiz stats
  const fetchUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userSurvey');
      if (data) setUserData(JSON.parse(data));
    } catch (err) {
      console.log('Error fetching user data:', err);
    }
  };

  const fetchQuizStats = async () => {
    try {
      const score = await AsyncStorage.getItem('quizScore');
      const history = await AsyncStorage.getItem('quizHistory');
      setQuizScore(score ? Number(score) : 0);
      setQuizStats(history ? JSON.parse(history) : { correct: 0, total: 0 });
    } catch (err) {
      console.log('Error fetching quiz stats:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchQuizStats();

    // Refresh when Dashboard regains focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
      fetchQuizStats();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchUserData();
    fetchQuizStats();
    const focus = navigation.addListener('focus', () => {
      fetchQuizStats();
    });
    return focus;
  }, [navigation]);

  const showToast = msg => {
    if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
    else alert(msg);
  };

  const handleFeaturePress = item => {
    if (item.screen) navigation.navigate(item.screen);
    else showToast(`${item.title} coming soon!`);
  };

  // ✅ Define features dynamically (quiz stats update automatically)
  const features = [
    {
      id: '1',
      title: 'Notebook Reminder',
      desc: 'Write tasks with time & get notified.',
      icon: <Icon name="book-outline" size={28} color="#6A1B9A" />,
      screen: 'Notebook',
    },
    {
      id: '2',
      title: 'Smart Interrupt Quiz 🎯',
      desc: `Score: ${quizScore} | Accuracy: ${
        quizStats.total
          ? Math.round((quizStats.correct / quizStats.total) * 100)
          : 0
      }%`,
      icon: <Icon name="help-circle-outline" size={28} color="#2E7D32" />,
      screen: 'InterruptQuiz',
    },
    {
      id: '3',
      title: 'AI Simplifier',
      desc: 'Convert tough text into memes/emojis.',
      icon: <MaterialIcon name="auto-awesome" size={28} color="#EF6C00" />,
      screen: 'AISimplifier',
    },
    // ⭐ NEW FEATURE
    {
      id: '4',
      title: 'BrainCandy ',
      desc: 'Match candies. Unlock knowledge.',
      icon: <FontAwesome5 name="brain" size={26} color="#1565C0" />,
      screen: 'GameScreen',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Hello, {userData.name || 'User'}! 👋
        </Text>
        {/* <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            style={{ marginRight: 12 }}
          >
            <Icon name="person-circle-outline" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout}>
            <Icon name="log-out-outline" size={28} color="white" />
          </TouchableOpacity>
        </View> */}
      </View>

      {/* Features List */}
      <FlatList
        data={features}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleFeaturePress(item)}
          >
            <View style={styles.icon}>{item.icon}</View>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsSheetOpen(true)}>
        <Icon name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSheetOpen}
        onRequestClose={() => setIsSheetOpen(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Quick Actions</Text>

            <TouchableOpacity
              onPress={() => {
                setIsSheetOpen(false);
                navigation.navigate('Notebook', { token: userToken });
              }}
              style={styles.sheetButton}
            >
              <Text style={styles.sheetButtonText}>📝 Add Reminder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsSheetOpen(false);
                navigation.navigate('InterruptQuiz');
              }}
              style={styles.sheetButton}
            >
              <Text style={styles.sheetButtonText}>🎯 Start Smart Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsSheetOpen(false)}
              style={styles.sheetButton}
            >
              <Text style={styles.sheetButtonText}>❌ Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Icon name="home-outline" size={24} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="person-outline" size={24} color="white" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF9800',
  },
  headerText: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
  },
  icon: { marginRight: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  desc: { fontSize: 13, color: '#555', marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#F57C00',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  sheetButton: { paddingVertical: 12 },
  sheetButtonText: { fontSize: 16 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F57C00',
    paddingVertical: 10,
  },
  navItem: { alignItems: 'center' },
  navText: { color: 'white', fontSize: 12, marginTop: 2 },
});

export default DashboardScreen;
