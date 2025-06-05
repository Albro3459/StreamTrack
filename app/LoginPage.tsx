import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { useRouter } from "expo-router";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    // Main submit handler
    const handleAuth = async () => {
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
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                router.replace("/ProfilePage");
            } catch (e) {
                Alert.alert("Sign Up Failed", e.message);
            }
        } else {
            try {
                await signInWithEmailAndPassword(auth, "brodsky.alex22@gmail.com", "Alex3459");
                router.replace("/LandingPage");
            } catch (e) {
                Alert.alert("Sign In Failed", e.message);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Stream Track</Text>
            <View style={styles.inputContainer}>
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
                    secureTextEntry
                />
                {isSignUp && (
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                )}
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => Alert.alert("Forgot Email", "Feature coming soon")}>
                        <Text style={styles.linkText}>Forgot Email?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert("Forgot Password", "Feature coming soon")}>
                        <Text style={styles.linkText}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleAuth}>
                <Text style={styles.buttonText}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setIsSignUp(!isSignUp)}
            >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    {isSignUp ? "Back to Sign In" : "Sign Up Instead"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#f5f5fa",
    },
    title: {
        fontSize: 38,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 32,
        color: "#36454F"
    },
    inputContainer: {
        marginBottom: 32,
        backgroundColor: "white",
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
        backgroundColor: "#e6e6e6",
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: -5,
        marginBottom: 5,
    },
    linkText: {
        color: "#6478FF",
        fontSize: 13,
        fontStyle: "italic",
        textDecorationLine: "underline"
    },
    button: {
        backgroundColor: "#6478FF",
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: "center",
        marginBottom: 15,
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "600"
    },
    secondaryButton: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#6478FF",
    },
    secondaryButtonText: {
        color: "#6478FF"
    }
});
