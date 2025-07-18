import { auth, secrets, GoogleAuthProvider, signInWithCredential, UserCredential, GoogleSignin } from "../../../firebaseConfig";
import { useEffect } from "react";
import { Text, Image, Pressable, StyleSheet } from "react-native";
import { Alert } from "../alertMessageComponent";
import { Router } from "expo-router";
import { appStyles } from "../../../styles/appStyles";
import { Colors } from "../../../constants/Colors";
import { OAuthCredential } from "firebase/auth";
import { SignInResponse } from "@react-native-google-signin/google-signin";
import { AuthUserCredential } from "../../types/AuthUserCredential";
import { LogOut } from "../../../app/helpers/authHelper";

interface GoogleSignInButtonProps {
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

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
    router, onSignIn, onSignUp, setAlertMessageFunc, setAlertTypeFunc 
}) => {

    // Configure GoogleSignin ONCE (do not put inside render!)
    useEffect(() => {
        GoogleSignin?.configure({
            webClientId: secrets.webClientID,
            iosClientId: secrets.iosClientID,
            offlineAccess: true,
            scopes: ["profile", "email"],
        });
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            await GoogleSignin?.hasPlayServices();
            const userInfo: SignInResponse = await GoogleSignin?.signIn();
            const idToken = userInfo?.data?.idToken;
            const credential: OAuthCredential = GoogleAuthProvider?.credential(idToken);
            const userCredential: UserCredential = await signInWithCredential(auth, credential);
            
            const googleCredential: AuthUserCredential = (userCredential as any) as AuthUserCredential;
            
            const isNewUser: boolean | undefined = googleCredential?._tokenResponse?.isNewUser;
            const email = googleCredential?.user?.email || "";
            if (isNewUser === true) {
                await onSignUp(googleCredential, router, email, setAlertMessageFunc, setAlertTypeFunc);
                if (auth?.currentUser) {
                    router.replace({
                        pathname: '/ProfilePage',
                        params: { isSigningUp: 1 }, // Have to pass as number or string
                    });
                } else {
                    await LogOut(auth);
                }
            } else {
                const success: boolean = await onSignIn(googleCredential, router, email, setAlertMessageFunc, setAlertTypeFunc);
                if (success === true) {
                    router.replace("/LandingPage");
                } else {
                    await LogOut(auth);
                }
            }
        } catch (error) {
            console.warn("Error on Google Sign In/Up", error);
            setAlertMessageFunc("Error on Google Sign In/Up");
            setAlertTypeFunc(Alert.Error);
        }
    };

    return (
        <Pressable
            onPress={handleGoogleSignIn}
            style={styles.button}
        >
            <Image source={require("../../../assets/images/GoogleSignInButton.png")} style={styles.image}/>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        marginBottom: 0,
        height: 45,
        width: 225,
        borderRadius: 8,
        overflow:"hidden",
        ...appStyles.shadow
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    image: {
        height: 45,
        width: 225,
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