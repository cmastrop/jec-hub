"use client";

import { useState, useEffect, useCallback } from "react";
import type { Profile } from "@/lib/types/database";
import type { Ministry, MinistryMemberRole } from "@/lib/types/cms";

export interface MinistryAssignment {
  role: MinistryMemberRole;
  ministry: Pick<Ministry, "id" | "slug" | "name_en" | "name_es"> | null;
}

type UserProfile = Pick<Profile, "id" | "email" | "full_name" | "role"> & {
  ministries?: MinistryAssignment[];
};

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

  const role = profile?.role ?? null;
  const ministries = profile?.ministries ?? [];

  // pastor y admin tienen acceso global; lider gestiona su ministerio
  const isPastor = role === "pastor";
  const isAdmin = role === "admin" || role === "pastor";
  const isLeader = role === "lider_ministerio";

  const canManage = useCallback(
    (ministrySlug: string) => {
      if (role === "admin" || role === "pastor") return true;
      if (role !== "lider_ministerio") return false;
      return ministries.some(
        (m) =>
          m.ministry?.slug === ministrySlug &&
          (m.role === "lider" || m.role === "colaborador")
      );
    },
    [role, ministries]
  );

  return {
    user: profile,
    role,
    ministries,
    isAdmin,
    isPastor,
    isLeader,
    canManage,
    loading,
  };
}
