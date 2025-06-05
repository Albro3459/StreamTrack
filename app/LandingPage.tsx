import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function LandingPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Landing Page!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5fa"
  },
  text: {
    fontSize: 22,
    color: "#36454F"
  }
});
