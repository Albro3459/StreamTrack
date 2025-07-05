"use client";

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
                    style={appStyles.textInput}
                    placeholder="Email"
                    placeholderTextColor={Colors.italicTextColor}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                <TextInput
                    style={appStyles.textInput}
                    placeholder="Password"
                    placeholderTextColor={Colors.italicTextColor}
                    value={password}
                    onChangeText={setPassword}
                    onSubmitEditing={() => {!isSignUp && handleAuth()}}
                    secureTextEntry
                />
                {isSignUp ? (
                    <TextInput
                        style={appStyles.textInput}
                        placeholder="Confirm Password"
                        placeholderTextColor={Colors.italicTextColor}
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
            <View style={appStyles.buttonContainer}>
                <TouchableOpacity style={[appStyles.button, {marginBottom: 15}]} onPress={handleAuth}>
                    <Text style={appStyles.buttonText}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[appStyles.button, appStyles.secondaryButton]}
                    onPress={() => setIsSignUp(!isSignUp)}
                >
                    <Text style={[appStyles.buttonText, appStyles.secondaryButtonText]}>
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
        ...appStyles.inputContainer,
        marginBottom: 32,
        padding: 18,
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
});