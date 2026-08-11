import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import InputField from '../InputField';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://10.146.254.202:8000/auth/login/';

const LogIn = ({ navigation, setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      const response = await axios.post(API_URL, { username, password });

      if (response.data.access) {
        Alert.alert('Success', 'Login successful');
        setIsAuthenticated(true);
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      console.log(error.response?.data || error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background2.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.main}>
            <Text style={styles.headerText}>LazyLearn📖</Text>
            <Text style={styles.slogan}>"Study Slow. Learn Smart."</Text>

            <View style={styles.boxContainer}>
              <Text style={styles.boxHeaderText}>Login</Text>

              <InputField
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />
              <InputField
                placeholder="Password"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity style={styles.createBtn} onPress={handleLogin}>
                <Text style={styles.btnText}>Login</Text>
              </TouchableOpacity>

              <View style={styles.captionContainer}>
                <Text style={styles.captionText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.signupText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  main: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerText: {
    fontSize: width * 0.12,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: height * 0.05,
  },
  slogan: {
    fontSize: width * 0.045,
    color: '#fff',
    marginBottom: height * 0.05,
  },
  boxContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 100,
    width: width * 0.9,
    paddingVertical: height * 0.05,
    alignItems: 'center',
    minHeight: height * 0.65,
  },
  boxHeaderText: {
    fontSize: width * 0.1,
    color: '#e28e11',
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  createBtn: {
    backgroundColor: '#eb9310',
    borderRadius: 30,
    width: '80%',
    height: height * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  btnText: {
    color: '#fff',
    fontSize: width * 0.055,
    fontWeight: '600',
  },
  captionContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  captionText: {
    color: '#e28e11',
    fontSize: width * 0.045,
  },
  signupText: {
    color: '#d88911',
    fontWeight: 'bold',
    fontSize: width * 0.045,
    textDecorationLine: 'underline',
  },
});

export default LogIn;
