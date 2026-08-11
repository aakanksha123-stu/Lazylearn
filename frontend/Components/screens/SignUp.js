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
import axios from 'axios';
import InputField from '../InputField';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://10.146.254.202:8000/auth/signup/';

const SignUp = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!username || !email || !password || !mobile) {
      Alert.alert('Validation Error', 'All fields are required!');
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        username,
        email,
        password,
        mobile,
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Account Created ✅');
        navigation.navigate('Login');
      } else {
        Alert.alert('Signup Failed', 'Please try again.');
      }
    } catch (error) {
      console.log('Signup Error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        JSON.stringify(error.response?.data) || 'Signup failed. Try again.'
      );
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
              <Text style={styles.boxHeaderText}>Register</Text>
              <Text style={styles.subtitle}>Create a new account</Text>

              <InputField placeholder="Create Username" value={username} onChangeText={setUsername} />
              <InputField placeholder="Mobile No." keyboardType="numeric" value={mobile} onChangeText={setMobile} />
              <InputField placeholder="Email" value={email} onChangeText={setEmail} />
              <InputField placeholder="Create Password" secureTextEntry={true} value={password} onChangeText={setPassword} />

              <TouchableOpacity style={styles.createBtn} onPress={handleSignUp}>
                <Text style={styles.btnText}>Sign Up</Text>
              </TouchableOpacity>

              <View style={styles.captionContainer}>
                <Text style={styles.captionText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.signupText}>Log In</Text>
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
    minHeight: height * 0.7,
  },
  boxHeaderText: {
    fontSize: width * 0.1,
    color: '#d88911',
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  subtitle: {
    color: '#eb9310',
    fontSize: width * 0.045,
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

export default SignUp;
