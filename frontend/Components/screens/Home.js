import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Home = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../../assets/background2.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.main}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>LazyLearn📖</Text>
          <Text style={styles.slogan}>"Study Slow. Learn Smart."</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.createBtn}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.btnText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: height * 0.1,
  },
  headerText: {
    fontSize: width * 0.12,
    fontWeight: 'bold',
    color: '#fff',
  },
  slogan: {
    fontSize: width * 0.045,
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  createBtn: {
    backgroundColor: '#ff9d00',
    borderRadius: 30,
    width: width * 0.7,
    height: height * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  btnText: {
    color: '#fff',
    fontSize: width * 0.06,
    fontWeight: '600',
  },
  captionContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  captionText: {
    color: '#fff',
    fontSize: width * 0.045,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.045,
    textDecorationLine: 'underline',
  },
});

export default Home;
