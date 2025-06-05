import { auth } from "@/firebaseConfig";
import { getIdToken, onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useUserDataStore } from "./stores/userStore";
import Heart from "./components/heartComponent";
import { Colors } from "@/constants/Colors";

export default function LandingPage() {

  const [user, setUser] = useState<User | null>();

  const { userData, fetchUserData } = useUserDataStore(); 

  const [heartColor, setHeartColor] = useState<string>(Colors.selectedHeartColor);

  useEffect(() => {
        const fetchInitialUserData = async () => {
            if (user && !userData) {
                const token = await user.getIdToken();
                await fetchUserData(token);
            }
        };
        fetchInitialUserData();
    }, [user, userData, fetchUserData]);

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
          const fetchUserData = async () => {
              if (user) {
                  setUser(user);
              }
          };
          fetchUserData();
      });
      return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Landing Page!</Text>
      <Heart 
        heartColor={heartColor}
        size={25}
        onPress={() => setHeartColor(heartColor === Colors.unselectedHeartColor ? Colors.selectedHeartColor : Colors.unselectedHeartColor)}
      />
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
