import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { auth } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { createUser } from "./helpers/StreamTrack/userHelper";
import { SignIn, SignUp } from "./helpers/authHelper";
import { appStyles } from "@/styles/appStyles";

export default function LoginPage() {
    const router = useRouter();

    const [signing, setSigning] = useState<boolean>(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    // Main submit handler
    const handleAuth = async () => {
        try {
            if (!email.includes("@") || !email.includes(".")) {
                Alert.alert("Invalid email", "Enter a valid email address.");
                return;
            }
            if (!password) {
                Alert.alert("Missing password", "Enter a password.");
                return;
            }
            if (isSignUp) {
                if (password !== confirmPassword) {
                    Alert.alert("Error", "Passwords do not match.");
                    return;
                }
                if (password.length < 6) {
                    Alert.alert("Error", "Password must be at least 6 characters.");
                    return;
                }
                
                setSigning(true);
                await SignUp(auth, email.trim(), password);
                router.replace({
                    pathname: '/ProfilePage',
                    params: { isSigningUp: 1 }, // Have to pass as number or string
                });
                
            } else {
                setSigning(true);
                await SignIn(auth, email.trim(), password);
                router.replace("/LandingPage");
            }
        } catch (e: any) {
            Alert.alert(`Sign ${isSignUp ? "Up" : "In"} Failed`, e.message);
        } finally {
            setSigning(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Stream Track</Text>
            
            <View style={[styles.inputContainer, { paddingBottom: isSignUp ? 4 : 10 } ]}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    onSubmitEditing={() => {!isSignUp && handleAuth()}}
                    secureTextEntry
                />
                {isSignUp ? (
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onSubmitEditing={() => {isSignUp && handleAuth()}}
                        secureTextEntry
                    />
                ) : (
                    <View style={styles.row}>
                        <TouchableOpacity onPress={() => Alert.alert("Forgot Email", "Feature coming soon")}>
                            <Text style={styles.linkText}>Forgot Email?</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Alert.alert("Forgot Password", "Feature coming soon")}>
                            <Text style={styles.linkText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleAuth}>
                    <Text style={styles.buttonText}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => setIsSignUp(!isSignUp)}
                >
                    <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Overlay */}
            {signing && (
                <View style={appStyles.overlay}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: Colors.backgroundColor,
    },
    title: {
        fontSize: 45,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 32,
        color: Colors.grayCell,
    },
    inputContainer: {
        marginBottom: 32,
        backgroundColor: Colors.altBackgroundColor,
        borderRadius: 15,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    input: {
        height: 50,
        borderRadius: 10,
        backgroundColor: Colors.grayCell,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        color: Colors.tabBarColor
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: -5,
        marginBottom: 5,
    },
    linkText: {
        color: Colors.italicTextColor,
        fontSize: 13,
        fontStyle: "italic",
        textDecorationLine: "underline"
    },
    buttonContainer: {
        alignItems: "center",
    },
    button: {
        backgroundColor: Colors.buttonColor,
        width: 140,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
        marginBottom: 15,
        shadowRadius: 10,
        shadowColor: "black",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
    },
    buttonText: {
        color: Colors.selectedTextColor,
        fontSize: 18,
        fontWeight: "600"
    },
    secondaryButton: {
        backgroundColor: Colors.altBackgroundColor,
        borderWidth: 1,
        borderColor: Colors.buttonColor,
    },
    secondaryButtonText: {
        color: Colors.buttonColor
    }
});