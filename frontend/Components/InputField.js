import { StyleSheet, TextInput } from 'react-native';
import React from 'react';

const InputField = props => {
  return (
    <TextInput
      {...props}
      style={styles.inputBox}
      placeholderTextColor={'#e28e11'}
    ></TextInput>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    borderRadius: 100,
    color: '#e28e11',
    paddingHorizontal: 20,
    width: '78%',
    backgroundColor: '#ccc',
    marginVertical: 20,
    fontSize: 18,
  },
});

export default InputField;
