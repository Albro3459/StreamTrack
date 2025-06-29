import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { createUser } from "./StreamTrack/userHelper";
import { CACHE, ClearCache, FetchCache } from "./cacheHelper";

export const SignIn = async (auth: Auth, email: string, password: string) => {
    ClearCache(CACHE.USER);
    if (!auth) return;
    if (!email.includes('@') || !email.includes('.')) {
        return;
    }
    await signInWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    const token = await user?.getIdToken() ?? null;
    token && FetchCache(token);
};

export const LogOut = async (auth: Auth) => {
    ClearCache(CACHE.USER);
    if (!auth) return;
    await signOut(auth);
};

export const SignUp = async (auth: Auth, email: string, password: string) => {
    ClearCache(CACHE.USER);
    if (!auth) return;
    if (!email.includes('@') || !email.includes('.')) {
        return;
    }
    await createUserWithEmailAndPassword(auth, email, password);

    const user = auth.currentUser;
    const token = await user?.getIdToken() ?? null;
    await createUser(token);
    token && FetchCache(token);
};

export default {};