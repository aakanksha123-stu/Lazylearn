import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';

const Btn = (bgColor,btnLabel,textColor) => {
  return (
  <TouchableOpacity style={styles.createBtn}>
    <Text style={styles.btnText}>{btnLabel}</Text>
  </TouchableOpacity>
);
};

const styles = StyleSheet.create({
  createBtn: {
    backgroundColor: bgColor,
    borderRadius: 100,
    alignItems: 'center'
  },
  btnText:{
    color:textColor,
    fontSize:25,
    fontWeight:"500"
  }
});

export default Btn;
