"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { auth, db } from "@/lib/firebase";

type UserDoc = {
  email: string;
  createdAt?: unknown;
  profileCount?: number;
  plan?: string;
  active?: boolean;
};

export default function DashboardPage() {
  const router = useRouter();

  const [fbUser, setFbUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [status, setStatus] = useState<
    "loading-auth" | "loading-doc" | "ready" | "no-doc" | "signed-out" | "error"
  >("loading-auth");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFbUser(null);
        setStatus("signed-out");
        router.replace("/login");
        return;
      }

      setFbUser(user);
      setStatus("loading-doc");

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setUserDoc(null);
          setStatus("no-doc");
          return;
        }

        setUserDoc(snap.data() as UserDoc);
        setStatus("ready");
      } catch (e: any) {
        setError(e?.message ?? "Unknown error loading user doc");
        setStatus("error");
      }
    });

    return () => unsub();
  }, [router]);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Phase 1: Auth + Firestore user record verification
      </p>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
          maxWidth: 720,
        }}
      >
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Auth Status</h2>
        <p>
          <strong>Status:</strong> {status}
        </p>

        {fbUser && (
          <>
            <p>
              <strong>UID:</strong> {fbUser.uid}
            </p>
            <p>
              <strong>Email:</strong> {fbUser.email}
            </p>
          </>
        )}

        {status === "no-doc" && (
          <p style={{ color: "crimson" }}>
            User is logged in, but no Firestore user document exists at{" "}
            <code>users/{`{uid}`}</code>.
            <br />
            This usually means the register flow didn’t create the doc (or you
            logged in with an older account created before we added doc
            creation).
          </p>
        )}

        {status === "error" && (
          <p style={{ color: "crimson" }}>
            Error loading Firestore user doc: <code>{error}</code>
          </p>
        )}
      </section>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
          maxWidth: 720,
        }}
      >
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Firestore User Doc</h2>

        {status === "loading-auth" || status === "loading-doc" ? (
          <p>Loading...</p>
        ) : userDoc ? (
          <pre
            style={{
              background: "#f7f7f7",
              padding: 12,
              borderRadius: 10,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(userDoc, null, 2)}
          </pre>
        ) : (
          <p>No user doc loaded.</p>
        )}
      </section>
    </main>
  );
}
