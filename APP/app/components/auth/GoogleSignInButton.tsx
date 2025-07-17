// import { Auth, auth, secrets, AuthSession, Google, GoogleAuthProvider, signInWithCredential, UserCredential } from "../../../firebaseConfig";
// import { useEffect } from "react";
// import { Button } from "react-native";
// import { Alert } from "../alertMessageComponent";
// import { Router } from "expo-router";

// const redirectUri = (AuthSession.makeRedirectUri as any)({
//     useProxy: false
// });

// interface GoogleSignInButtonProps {
//     router: Router, 
    
//     onSignIn: (
//                 userCreds: UserCredential, router: Router, email: string,
//                 setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
//                 setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
//             ) => Promise<boolean>;
//     onSignUp: (
//                 userCreds: UserCredential, router: Router, email: string,
//                 setAlertMessageFunc?: React.Dispatch<React.SetStateAction<string>>, 
//                 setAlertTypeFunc?: React.Dispatch<React.SetStateAction<Alert>>
//             ) => Promise<void>;

//     setAlertMessageFunc: React.Dispatch<React.SetStateAction<string>>;
//     setAlertTypeFunc: React.Dispatch<React.SetStateAction<Alert>>;
// }

// const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
//     router, onSignIn, onSignUp, setAlertMessageFunc, setAlertTypeFunc 
// }) => {
//     const [request, response, promptAsync] = Google?.useIdTokenAuthRequest({
//             clientId: secrets.clientID,
//             iosClientId: secrets.clientID,
//             scopes: ["profile", "email"], // default and required
//             redirectUri
//     });

//     useEffect(() => {
//         if (response?.type === "success") {
//             const { id_token } = response.params;
//             const credential = GoogleAuthProvider?.credential(id_token);
//             signInWithCredential(auth, credential)
//                 .then((userCredential: UserCredential) => {
//                     const isNewUser = (userCredential as any).additionalUserInfo?.isNewUser; // Have to force it
//                     if (isNewUser) {
//                         onSignUp(userCredential, router, userCredential?.user?.email, setAlertMessageFunc, setAlertTypeFunc);
//                     } else {
//                         onSignIn(userCredential, router, userCredential?.user?.email, setAlertMessageFunc, setAlertTypeFunc);
//                     }
//                 })
//                 .catch((error: any) => {
//                     console.warn("Error on Google Sign In/Up", error);
//                     setAlertMessageFunc("Error on Google Sign In/Up");
//                     setAlertTypeFunc(Alert.Error);
//                 });
//         }
//     }, [response]);

//     return (
//         <Button
//             title="Sign in with Google"
//             disabled={!request}
//             onPress={() => promptAsync()}
//         />
//     );
// };

export default {};