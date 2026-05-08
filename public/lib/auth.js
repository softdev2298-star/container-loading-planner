/* auth.js — wrapper centralizzato sopra Supabase */

const SUPABASE_URL  = "https://idjjxfbaquosftziarvn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_3uVK_qHhT30SC6CIC9Ar9g_4fLdzRdd";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/* ---------- AUTH ---------- */
export async function currentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await currentUser();
  if (!user) {
    window.location.href = "/login.html?redirect=" + encodeURIComponent(location.pathname + location.search);
    return null;
  }
  // Dopo login/registrazione: gestisce companion creation o invite acceptance
  await processPendingActions(user);
  return user;
}

async function processPendingActions(user) {
  // 1) Se c'è un invito pendente, accettalo
  const pendingInvite = localStorage.getItem("pendingInvite");
  if (pendingInvite) {
    localStorage.removeItem("pendingInvite");
    try {
      const { data, error } = await supabase.rpc("accept_invitation", { p_token: pendingInvite });
      if (error) console.warn("Errore accettazione invito:", error.message);
    } catch (e) { console.warn(e); }
  }

  // 2) Se c'è una company da creare (signup nuovo), creala
  const pendingCompany = localStorage.getItem("pendingCompany");
  if (pendingCompany) {
    try {
      const c = JSON.parse(pendingCompany);
      // Verifica che l'utente non abbia già una company
      const { data: existing } = await supabase
        .from("companies")
        .select("id")
        .limit(1);
      if (!existing || !existing.length) {
        await supabase.from("companies").insert({
          name: c.name,
          country: c.country,
          created_by: user.id
        });
      }
      localStorage.removeItem("pendingCompany");
    } catch (e) { console.warn(e); }
  }
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/";
}

/* ---------- COMPANY ---------- */
export async function getMyCompany() {
  const { data, error } = await supabase
    .from("company_members")
    .select("role, companies(id, name, country, created_by)")
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return { ...data.companies, role: data.role };
}

export async function isAdmin() {
  const c = await getMyCompany();
  return c && c.role === "admin";
}

export async function listTeamMembers(companyId) {
  // Recupera membri tramite RPC custom o join. Non posso join con auth.users via API anon.
  // Quindi ritorno solo user_id e role; la mail la prendo da auth.uid solo per l'utente corrente.
  const { data, error } = await supabase
    .from("company_members")
    .select("id, user_id, role, created_at")
    .eq("company_id", companyId);
  if (error) throw error;
  return data || [];
}

export async function listInvitations(companyId) {
  const { data, error } = await supabase
    .from("invitations")
    .select("id, email, accepted, created_at, expires_at, token")
    .eq("company_id", companyId)
    .eq("accepted", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createInvitation(companyId, email) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 14);
  const user = await currentUser();
  const { data, error } = await supabase
    .from("invitations")
    .insert({ company_id: companyId, email: email.toLowerCase().trim(), invited_by: user.id, expires_at: expires.toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInvitation(invitationId) {
  const { error } = await supabase.from("invitations").delete().eq("id", invitationId);
  if (error) throw error;
}

export async function removeMember(memberId) {
  const { error } = await supabase.from("company_members").delete().eq("id", memberId);
  if (error) throw error;
}

/* ---------- PROJECTS ---------- */
export async function listProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, container_key, updated_at, created_at, owner")
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
  const company = await getMyCompany();

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
      .insert({
        name, container_key, payload,
        owner: user.id,
        company_id: company?.id || null
      })
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

/* ---------- SHARING ---------- */
export async function createShareLink(projectId) {
  const user = await currentUser();
  // Controlla se esiste già un link
  const { data: existing } = await supabase
    .from("shared_links")
    .select("token")
    .eq("project_id", projectId)
    .maybeSingle();
  if (existing) return existing.token;

  const { data, error } = await supabase
    .from("shared_links")
    .insert({ project_id: projectId, created_by: user.id })
    .select("token")
    .single();
  if (error) throw error;
  return data.token;
}

export async function revokeShareLink(projectId) {
  const { error } = await supabase
    .from("shared_links")
    .delete()
    .eq("project_id", projectId);
  if (error) throw error;
}

export async function loadProjectByToken(token) {
  // Step 1: trova il project_id dal token
  const { data: link, error: linkErr } = await supabase
    .from("shared_links")
    .select("project_id, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (linkErr || !link) return null;
  if (link.expires_at && new Date(link.expires_at) < new Date()) return null;

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name, container_key, payload, updated_at")
    .eq("id", link.project_id)
    .single();
  if (error) return null;
  return project;
}
