import { Colors } from "@/constants/Colors";
import React from "react";
import { View, Text, StyleSheet, Pressable, StatusBar} from "react-native";

export enum Alert {
    Error = "error",
    Successs = "success"
}

interface AlertProps {
    type?: Alert;
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    onIndex?: boolean;
};

const AlertMessage: React.FC<AlertProps> = ({
    type = Alert.Error,
    message,
    setMessage,
    onIndex
}) => {
  if (!message) return null;

  return (
    <View style={[styles.overlay, styles[type], onIndex && styles.onIndex]}>
      <Text style={type === Alert.Successs ? styles.successText : styles.errorText}>{message}</Text>
        <Pressable onPress={() => setMessage("")} style={styles.closeBtn}>
          <Text style={[styles.closeText, type === Alert.Successs ? styles.successText : styles.errorText]}>X</Text>
        </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
    onIndex: {
        top: 60
    },
    overlay: {
        position: "absolute",
        top: StatusBar.currentHeight + 10,
        left: 20,
        right: 20,
        zIndex: 1000,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        elevation: 4,
        justifyContent: "space-between",
    },
    error: {
        backgroundColor: "#f72925",
    },
    success: {
        backgroundColor: "green",
    },
    errorText: {
        color: "white",
        flex: 1,
    },
    successText: {
        color: "black",
        flex: 1,
    },
    closeBtn: {
        marginLeft: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    closeText: {
        fontWeight: "bold",
        color: "black",
        fontSize: 16,
    },
});

export default AlertMessage;
