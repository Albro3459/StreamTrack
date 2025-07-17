import { Auth, auth, secrets, AuthSession, Google, GoogleAuthProvider, signInWithCredential, UserCredential } from "../../../firebaseConfig";
import { useEffect } from "react";
import { Text, Image, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Alert } from "../alertMessageComponent";
import { Router } from "expo-router";
import { appStyles } from "@/styles/appStyles";
import { Colors } from "@/constants/Colors";

const redirectUri = (AuthSession.makeRedirectUri as any)({
    useProxy: false
});

interface GoogleSignInButtonProps {
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

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
    router, onSignIn, onSignUp, setAlertMessageFunc, setAlertTypeFunc 
}) => {
    const [request, response, promptAsync] = Google?.useIdTokenAuthRequest({
            clientId: secrets.clientID,
            iosClientId: secrets.clientID,
            scopes: ["profile", "email"], // default and required
            redirectUri
    });

    useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider?.credential(id_token);
            signInWithCredential(auth, credential)
                .then((userCredential: UserCredential) => {
                    const isNewUser = (userCredential as any).additionalUserInfo?.isNewUser; // Have to force it
                    if (isNewUser) {
                        onSignUp(userCredential, router, userCredential?.user?.email, setAlertMessageFunc, setAlertTypeFunc);
                    } else {
                        onSignIn(userCredential, router, userCredential?.user?.email, setAlertMessageFunc, setAlertTypeFunc);
                    }
                })
                .catch((error: any) => {
                    console.warn("Error on Google Sign In/Up", error);
                    setAlertMessageFunc("Error on Google Sign In/Up");
                    setAlertTypeFunc(Alert.Error);
                });
        }
    }, [response]);

    return (
        <Pressable
            disabled={!request}
            onPress={() => promptAsync()}
            style={[styles.button, (!request) && styles.buttonDisabled]}
            // activeOpacity={0.8}
        >
            <Image source={require("../../../assets/images/GoogleLogo.webp")} style={styles.logo} />
            <Text style={styles.text}>Sign in with Google</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
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
        ...appStyles.shadow
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    logo: {
        width: 20,
        height: 20,
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