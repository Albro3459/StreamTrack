"use client";

import React, { useEffect, useState } from "react";
import { View, Image, Text, TextInput, StyleSheet, ActivityIndicator, Pressable, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth } from "../firebaseConfig";
import { Router, useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "../constants/Colors";
import { AppleSignIn, AppleSignUp, LogOut, SignIn, SignUp } from "./helpers/authHelper";
import { appStyles } from "../styles/appStyles";
import AlertMessage, { Alert } from "./components/alertMessageComponent";
import { GoogleSignInButton } from "./components/auth/GoogleSignInButton";
import { AppleSignInButton } from "./components/auth/AppleSignInButton";

interface LoginPageParams {
    unauthorized?: number;
}

export default function LoginPage() {
    const router = useRouter();

    const { unauthorized } = useLocalSearchParams() as LoginPageParams;

    const [signing, setSigning] = useState<boolean>(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertType, setAlertType] = useState<Alert>(Alert.Error);

    // Main submit handler
    const handleAuth = async () => {
        setAlertMessage("");
        setAlertType(Alert.Error);
        try {
            if (!email.includes("@") || !email.includes(".")) {
                setAlertMessage("Invalid email. Enter a valid email address.");
                setAlertType(Alert.Error);
                return;
            }
            if (!password) {
                setAlertMessage("Missing password. Enter a password.");
                setAlertType(Alert.Error);
                return;
            }
            if (isSignUp) {
                if (password !== confirmPassword) {
                    setAlertMessage("Error: Passwords do not match.");
                    setAlertType(Alert.Error);
                    return;
                }
                if (password.length < 6) {
                    setAlertMessage("Error: Password must be at least 6 characters.");
                    setAlertType(Alert.Error);
                    return;
                }
                
                setSigning(true);
                await SignUp(auth, router, email?.trim(), password, setAlertMessage, setAlertType);
                if (auth?.currentUser) {
                    router.replace({
                        pathname: '/ProfilePage',
                        params: { isSigningUp: 1 }, // Have to pass as number or string
                    });
                } else {
                    await LogOut(auth);
                }                
            } else {
                setSigning(true);
                const success: boolean = await SignIn(auth, router, email?.trim(), password, setAlertMessage, setAlertType);
                if (success) {
                    router.replace("/LandingPage");
                } else {
                    await LogOut(auth);
                }
            }
        } catch (e: any) {
            setAlertMessage(`Sign ${isSignUp ? "Up" : "In"} Failed\n${e.message}`);
            setAlertType(Alert.Error);
        } finally {
            setSigning(false);
        }
    };

    useEffect(() => {
        if (Number(unauthorized)) {
            setAlertMessage("User was unauthorized")
            setAlertType(Alert.Error);
        }
    }, [unauthorized]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView 
                style={{ flex: 1, backgroundColor: Colors.backgroundColor }} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                // keyboardVerticalOffset={!isSignUp ? -80 : -50 /* When using a text title */}
            >
                <ScrollView 
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <AlertMessage
                            type={alertType}
                            message={alertMessage}
                            setMessage={setAlertMessage}
                            onIndex={true}
                        />
                        {/* <Text style={styles.title}>Stream Track</Text> */}
                        <Image
                            source={require("../assets/images/AppLogoClear.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        
                        <View style={[styles.inputContainer, { paddingBottom: isSignUp ? 4 : 10 } ]}>
                            <TextInput
                                style={appStyles.textInput}
                                placeholder="Email"
                                placeholderTextColor={Colors.italicTextColor}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <View style={appStyles.passwordContainter}>
                                <TextInput
                                    style={[appStyles.textInput, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Password"
                                    placeholderTextColor={Colors.italicTextColor}
                                    value={password}
                                    autoCapitalize="none"
                                    onChangeText={setPassword}
                                    onSubmitEditing={() => {!isSignUp && handleAuth()}}
                                    secureTextEntry={!showPassword}
                                />
                                {password.length > 0 && (
                                    <Pressable onPress={() => setShowPassword(prev => !prev)} style={{paddingRight: 10}}>
                                        <Icon
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={24}
                                            color={Colors.italicTextColor}
                                        />
                                    </Pressable>
                                )}
                            </View>
                            {isSignUp ? (
                                <View style={appStyles.passwordContainter}>
                                    <TextInput
                                        style={[appStyles.textInput, { flex: 1, marginBottom: 0 }]}
                                        placeholder="Confirm Password"
                                        placeholderTextColor={Colors.italicTextColor}
                                        value={confirmPassword}
                                        autoCapitalize="none"
                                        onChangeText={setConfirmPassword}
                                        onSubmitEditing={() => {isSignUp && handleAuth()}}
                                        secureTextEntry={!showConfirmPassword}
                                    />
                                    {confirmPassword.length > 0 && (
                                        <Pressable onPress={() => setShowConfirmPassword(prev => !prev)} style={{paddingRight: 10}}>
                                            <Icon
                                                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                                size={24}
                                                color={Colors.italicTextColor}
                                            />
                                        </Pressable>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.row}>
                                    <Pressable onPress={() => {setAlertMessage("Forgot Email Feature coming soon"); setAlertType(Alert.Info);}}>
                                        <Text style={styles.linkText}>Forgot Email?</Text>
                                    </Pressable>
                                    <Pressable onPress={() => {setAlertMessage("Forgot Password Feature coming soon"); setAlertType(Alert.Info);}}>
                                        <Text style={styles.linkText}>Forgot Password?</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                        <View style={appStyles.buttonContainer}>
                            <Pressable style={[appStyles.button, {marginBottom: 15}]} onPress={handleAuth}>
                                <Text style={appStyles.buttonText}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
                            </Pressable>
                            <Pressable
                                style={[appStyles.button, appStyles.secondaryButton, {marginBottom: 15}]}
                                onPress={() => setIsSignUp(!isSignUp)}
                            >
                                <Text style={[appStyles.buttonText, appStyles.secondaryButtonText]}>
                                    {isSignUp ? "Sign In" : "Sign Up"}
                                </Text>
                            </Pressable>

                            {/* <GoogleSignInButton
                                router={router}
                                onSignIn={GoogleSignIn}    
                                onSignUp={GoogleSignUp}       
                                setAlertMessageFunc={setAlertMessage}
                                setAlertTypeFunc={setAlertType}         
                            /> */}

                            <AppleSignInButton
                                router={router}
                                onSignIn={AppleSignIn}    
                                onSignUp={AppleSignUp}       
                                setAlertMessageFunc={setAlertMessage}
                                setAlertTypeFunc={setAlertType}         
                            />
                        </View>

                        {/* Overlay */}
                        {signing && (
                            <View style={appStyles.overlay}>
                                <ActivityIndicator size="large" color="#fff" />
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: Colors.backgroundColor,
    },
    logo: {
        alignSelf: "center",
        width: 1000,
        height: 300,
        marginTop: -90,
        marginBottom: -40,
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