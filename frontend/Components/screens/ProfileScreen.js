import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const isFocused = useIsFocused();

  // Fetch user data whenever screen is focused
  useEffect(() => {
    const fetchData = async () => {
      const data = await AsyncStorage.getItem('userSurvey');
      if (data) setUserData(JSON.parse(data));
    };
    if (isFocused) fetchData();
  }, [isFocused]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Icon name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.contentWrapper}>
        {userData ? (
          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{userData.name}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Class:</Text>
              <Text style={styles.value}>{userData.selectedClass}</Text>
            </View>

            {userData.branch && (
              <View style={styles.card}>
                <Text style={styles.label}>Branch:</Text>
                <Text style={styles.value}>{userData.branch}</Text>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.label}>Subject:</Text>
              <Text style={styles.value}>{userData.subject}</Text>
            </View>

            {/* Edit Details Button */}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('SurveyForm', {
                  initialData: userData, // prefill form
                  fromProfile: true, // ✅ tell SurveyForm we came from Profile
                  setIsSurveyDone: async () => {
                    const updatedData = await AsyncStorage.getItem(
                      'userSurvey',
                    );
                    if (updatedData) setUserData(JSON.parse(updatedData));
                  },
                })
              }
            >
              <View style={styles.editBtn}>
                <Text style={styles.btnText}>Edit Details</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.infoText}>No profile data found.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SurveyForm')}>
              <View style={styles.editBtn}>
                <Text style={styles.btnText}>Fill Survey</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Logout Button */}
      <TouchableOpacity style={styles.floatingLogoutBtn} onPress={handleLogout}>
        <View style={styles.floatingLogoutBtnInner}>
          <Icon name="log-out-outline" size={28} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FF9800',
  },
  headerText: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  contentWrapper: { flex: 1, padding: 20 },
  content: {},
  card: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
  value: { fontSize: 16, color: '#555', marginTop: 5 },
  editBtn: {
    backgroundColor: '#ff9d00',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  infoText: { fontSize: 16, textAlign: 'center', marginTop: 20 },
  floatingLogoutBtn: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    right: 20,
  },
  floatingLogoutBtnInner: {
    backgroundColor: '#ff9d00',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default ProfileScreen;
