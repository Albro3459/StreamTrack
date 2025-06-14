import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export const SignIn = async (auth: Auth, email: string, password: string) => {
    if (!auth) return;
    if (!email.includes('@') || !email.includes('.')) {
        return;
    }
    await signInWithEmailAndPassword(auth, email, password);
};

export const LogOut = async (auth: Auth) => {
    if (!auth) return;
    await signOut(auth);
};

export const SignUp = async (auth: Auth, email: string, password: string) => {
    if (!auth) return;
    if (!email.includes('@') || !email.includes('.')) {
        return;
    }
    await createUserWithEmailAndPassword(auth, email, password);
};

export default {};