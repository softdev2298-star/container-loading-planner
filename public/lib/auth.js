/* auth.js — wrapper centralizzato sopra Supabase
   ================================================
   IMPORTANTE: prima di pubblicare in produzione, modifica le costanti
   qui sotto con i valori del TUO progetto Supabase (vedi DEPLOY.md).
*/

// === CONFIGURAZIONE SUPABASE ===
// Progetto: container-loading-planner (eu-west-1)
const SUPABASE_URL  = "https://idjjxfbaquosftziarvn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_3uVK_qHhT30SC6CIC9Ar9g_4fLdzRdd";

// Carico il client Supabase via CDN (no npm install necessario)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/* ---------- helpers ---------- */

/** Ritorna l'utente loggato o null. */
export async function currentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Reindirizza a /login.html se non autenticato. */
export async function requireAuth() {
  const user = await currentUser();
  if (!user) {
    window.location.href = "/login.html?redirect=" + encodeURIComponent(location.pathname);
    return null;
  }
  return user;
}

/** Logout e redirect a homepage. */
export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/";
}

/* ---------- progetti CRUD ---------- */

export async function listProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, container_key, updated_at, created_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function loadProject(id) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveProject({ id, name, container_key, payload }) {
  const user = await currentUser();
  if (!user) throw new Error("Non autenticato");

  if (id) {
    const { data, error } = await supabase
      .from("projects")
      .update({ name, container_key, payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("projects")
      .insert({ name, container_key, payload, owner: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function deleteProject(id) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
