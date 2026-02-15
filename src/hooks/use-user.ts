"use client";

import { useState, useEffect } from "react";
import type { Profile } from "@/lib/types/database";

type UserProfile = Pick<Profile, "id" | "email" | "full_name" | "role">;

let cachedProfile: UserProfile | null = null;
let fetchPromise: Promise<UserProfile | null> | null = null;

export function clearUserCache() {
  cachedProfile = null;
  fetchPromise = null;
}

async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch("/api/me");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function useUser() {
  const [profile, setProfile] = useState<UserProfile | null>(cachedProfile);
  const [loading, setLoading] = useState(!cachedProfile);

  useEffect(() => {
    if (cachedProfile) {
      setProfile(cachedProfile);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetchProfile();
    }

    fetchPromise.then((p) => {
      cachedProfile = p;
      setProfile(p);
      setLoading(false);
    });
  }, []);

  return {
    user: profile,
    isAdmin: profile?.role === "admin",
    loading,
  };
}
