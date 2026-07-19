// Updates the nav to reflect whether someone is signed in.
// Safe to load on any page — silently does nothing if the
// Supabase config in supabase-config.js hasn't been filled in yet,
// and does nothing at all if the relevant elements aren't present.
import { supabase } from "./supabase-client.js";

async function renderAuthState() {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (err) {
    console.warn("Water AI: Supabase not configured yet.", err);
    return;
  }

  // chat.html elements
  const chip = document.getElementById("auth-chip");
  const chipEmail = document.getElementById("auth-chip-email");
  const signinLink = document.getElementById("auth-signin-link");
  const signoutBtn = document.getElementById("auth-signout-btn");

  if (chip && signinLink) {
    if (session) {
      chip.hidden = false;
      signinLink.hidden = true;
      if (chipEmail) chipEmail.textContent = session.user.email || "Account";
    } else {
      chip.hidden = true;
      signinLink.hidden = false;
    }
  }
  if (signoutBtn) {
    signoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "index.html";
    });
  }

  // index.html elements
  const navSignin = document.getElementById("nav-signin-link");
  const navCta = document.getElementById("nav-cta-link");
  if (navSignin && navCta && session) {
    navSignin.textContent = "Sign Out";
    navSignin.href = "#";
    navSignin.addEventListener("click", async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      window.location.reload();
    });
    navCta.textContent = "Open Chat";
    navCta.href = "chat.html";
  }
}

renderAuthState();
