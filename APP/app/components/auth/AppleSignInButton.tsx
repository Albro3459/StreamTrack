import * as AppleAuthentication from 'expo-apple-authentication';
import { useState } from "react";
import { Text, Image, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { auth, OAuthProvider, signInWithCredential, UserCredential } from "../../../firebaseConfig";
import { Alert } from "../alertMessageComponent";
import { Router } from "expo-router";
import { appStyles } from "@/styles/appStyles";
import { Colors } from "@/constants/Colors";

interface AppleSignInButtonProps {
    router: Router, 
    onSignIn: (
        userCreds: UserCredential, router: Router, email: string,
        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => Promise<boolean>;
    onSignUp: (
        userCreds: UserCredential, router: Router, email: string,
        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => Promise<void>;
    setAlertMessageFunc: React.Dispatch<React.SetStateAction<string>>;
    setAlertTypeFunc: React.Dispatch<React.SetStateAction<Alert>>;
}

export const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({ 
    router, onSignIn, onSignUp, setAlertMessageFunc, setAlertTypeFunc 
}) => {
    const [loading, setLoading] = useState(false);

    const handleAppleSignIn = async () => {
        setLoading(true);
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            // Firebase expects both identityToken and nonce
            const { identityToken } = credential;
            if (!identityToken) {
                setAlertMessageFunc("Apple Sign In failed");
                setAlertTypeFunc(Alert.Error);
                return;
            }

            const provider = new OAuthProvider('apple.com');
            const firebaseCredential = provider.credential({ idToken: identityToken });

            signInWithCredential(auth, firebaseCredential)
                .then((userCredential: UserCredential) => {
                    const isNewUser = (userCredential as any).additionalUserInfo?.isNewUser;
                    if (isNewUser) {
                        onSignUp(userCredential, router, userCredential?.user?.email, setAlertMessageFunc, setAlertTypeFunc);
                    } else {
                        onSignIn(userCredential, router, userCredential?.user?.email, setAlertMessageFunc, setAlertTypeFunc);
                    }
                })
                .catch((error: any) => {
                    setAlertMessageFunc("Error on Apple Sign In/Up");
                    setAlertTypeFunc(Alert.Error);
                })
                .finally(() => setLoading(false));
        } catch (e: any) {
            if (e.code !== "ERR_CANCELED") {
                setAlertMessageFunc("Apple Sign In Error");
                setAlertTypeFunc(Alert.Error);
            }
            setLoading(false);
        }
    };

    return (
        <Pressable
            onPress={handleAppleSignIn}
            style={[appleStyles.button, loading && appleStyles.buttonDisabled]}
            disabled={loading}
        >
            <Image source={require("../../../assets/images/AppleLogo.png")} style={appleStyles.logo} />
            <Text style={appleStyles.text}>Sign in with Apple</Text>
        </Pressable>
    );
};

const appleStyles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
        height: 45,
        width: 225,
        backgroundColor: Colors.selectedTextColor,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.grayCell,
        paddingLeft: 15,
        paddingRight: 10,
        ...appStyles.shadow,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    logo: {
        width: 25,
        height: 25,
        marginRight: 12,
        resizeMode: 'contain',
        backgroundColor: 'transparent',
    },
    text: {
        fontWeight: '600',
        fontSize: 16,
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
});

export default {};
