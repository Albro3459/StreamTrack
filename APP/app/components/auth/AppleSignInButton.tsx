import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from "react";
import { Text, Image, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { auth, OAuthProvider, signInWithCredential, UserCredential } from "../../../firebaseConfig";
import { Alert } from "../alertMessageComponent";
import { Router } from "expo-router";
import { appStyles } from "../../../styles/appStyles";
import { Colors } from "../../../constants/Colors";
import { AuthUserCredential } from '../../types/AuthUserCredential';
import { LogOut } from '../../../app/helpers/authHelper';

interface AppleSignInButtonProps {
    router: Router, 
    onSignIn: (
        userCreds: AuthUserCredential, router: Router, email: string,
        setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
        setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
    ) => Promise<boolean>;
    onSignUp: (
        userCreds: AuthUserCredential, router: Router, email: string,
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
            const credential = await AppleAuthentication?.signInAsync({
                requestedScopes: [
                    AppleAuthentication?.AppleAuthenticationScope?.FULL_NAME,
                    AppleAuthentication?.AppleAuthenticationScope?.EMAIL,
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
                .then(async (userCredential: UserCredential) => {
                    const appleCredential = (userCredential as any) as AuthUserCredential;
                    const isNewUser: boolean | undefined = appleCredential?._tokenResponse?.isNewUser;
                    if (isNewUser === true) {
                        await onSignUp(appleCredential, router, appleCredential?.user?.email, setAlertMessageFunc, setAlertTypeFunc);
                        if (auth?.currentUser) {
                            router.replace({
                                pathname: '/ProfilePage',
                                params: { isSigningUp: 1 }, // Have to pass as number or string
                            });
                        } else {
                            await LogOut(auth);
                        }
                    } else {
                        const success: boolean = await  onSignIn(appleCredential, router, appleCredential?.user?.email, setAlertMessageFunc, setAlertTypeFunc);
                        if (success === true) {
                            router.replace("/LandingPage");
                        } else {
                            await LogOut(auth);
                        }
                    }
                })
                .catch((error: any) => {
                    console.warn("Error on Apple Sign In/Up", error);
                    setAlertMessageFunc("Error on Apple Sign In/Up");
                    setAlertTypeFunc(Alert.Error);
                })
                .finally(() => {setLoading(false);});
        } catch (e: any) {
            const cancelCodes = ["ERR_REQUEST_CANCELED", "ERR_CANCELED", "ERR_REQUEST_UNKNOWN"];
            if (!cancelCodes.includes(e.code)) {
                console.warn("Apple Sign In Error", e);
                setAlertMessageFunc("Apple Sign In Error");
                setAlertTypeFunc(Alert.Error);
            }
            setLoading(false);
        }
    };

    return (
        <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={8}
            style={[appleStyles.button, loading && appleStyles.buttonDisabled]}
            onPress={handleAppleSignIn}
        />
    );
};

const appleStyles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
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
