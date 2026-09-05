import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { findStaffByEmail } from "../api/rosterApi";
import { auth } from "../firebase/config";
import { normalizeClasses, normalizeRole } from "../utils/feedback";
import { AuthContext } from "./auth-context";

function readIdentity(user, claims = {}) {
  return {
    uid: user.uid,
    name: user.displayName || user.email || user.uid,
    email: user.email || "",
    role: normalizeRole(claims.role || claims.staffRole),
    classes: normalizeClasses(
      claims.classes || claims.assignedClasses || claims.classLabels
    ),
  };
}

async function resolveIdentity(user, claims = {}) {
  const identity = readIdentity(user, claims);
  const staff = await findStaffByEmail(user.email);

  if (!staff) {
    return identity;
  }

  return {
    ...identity,
    name: staff.name || identity.name,
    role: normalizeRole(staff.role) || identity.role,
    classes: normalizeClasses(staff.classes),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const identityRef = useRef(null);

  useEffect(() => {
    identityRef.current = identity;
  }, [identity]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setAuthError("");

      if (!nextUser) {
        identityRef.current = null;
        setUser(null);
        setIdentity(null);
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await nextUser.getIdTokenResult();
        const nextIdentity = await resolveIdentity(nextUser, tokenResult.claims);
        identityRef.current = nextIdentity;
        setUser(nextUser);
        setIdentity(nextIdentity);

        if (!nextIdentity.role) {
          setAuthError("Your account is not on the Contour staff roster.");
        }
      } catch {
        const fallback = readIdentity(nextUser);
        identityRef.current = fallback;
        setUser(nextUser);
        setIdentity(fallback);
        setAuthError("Signed in, but staff access details could not be loaded.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError("");
    await setPersistence(auth, browserLocalPersistence);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await credential.user.getIdToken();
  }, []);

  const logout = useCallback(async () => {
    setAuthError("");
    await signOut(auth);
  }, []);

  const getAccessContext = useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error("You need to sign in again to continue.");
    }

    const tokenResult = await auth.currentUser.getIdTokenResult();
    let profile = identityRef.current;

    if (!profile?.role) {
      profile = await resolveIdentity(auth.currentUser, tokenResult.claims);
    }

    identityRef.current = profile;

    return {
      token: tokenResult.token,
      ...profile,
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      identity,
      loading,
      authError,
      login,
      logout,
      getAccessContext,
    }),
    [user, identity, loading, authError, login, logout, getAccessContext]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
