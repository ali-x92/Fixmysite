import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => {};
    try {
      const client = getSupabaseBrowserClient();
      client.auth.getSession().then(({ data }) => {
        if (active) {
          setSession(data.session);
          setReady(true);
        }
      });
      ({
        data: {
          subscription: { unsubscribe },
        },
      } = client.auth.onAuthStateChange((_event, nextSession) => {
        if (active) {
          setSession(nextSession);
          setReady(true);
        }
      }));
    } catch {
      if (active) setReady(true);
    }
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { session, ready };
}
