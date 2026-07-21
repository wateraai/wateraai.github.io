// Updates the nav to reflect whether someone is signed in, and —
// on chat.html only — lets people chat as a guest while nudging
// them to sign in with a popup every 2 minutes.
// Safe to load on any page — silently does nothing if the
// Supabase config in supabase-config.js hasn't been filled in yet,
// and does nothing at all if the relevant elements aren't present.
import { supabase } from "./supabase-client.js";

const LOGIN_NUDGE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
let loginNudgeInterval = null;

function onChatPage() {
  return window.location.pathname.endsWith("chat.html") || window.location.href.includes("/chat.html");
}

/* ---------------------------------------------------------
   Guest login-nudge modal (chat.html only)
   Reuses the site's existing .modal-overlay/.modal styles.
--------------------------------------------------------- */
function injectLoginNudgeModal() {
  if (document.getElementById("login-nudge-modal")) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "login-nudge-modal";
  overlay.innerHTML = `
    <div class="modal" style="max-width:400px;">
      <button class="modal-close" data-close="login-nudge-modal">✕</button>
      <span class="eyebrow">Water AI</span>
      <h2 style="font-size:20px;">Save this conversation?</h2>
      <p class="sub">You're chatting as a guest. Sign in or create a free account so your chats and plan follow you across devices.</p>
      <div class="modal-actions">
        <a class="btn btn-ghost" href="login/login.html" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">Sign In</a>
        <a class="btn btn-primary" href="login/signup.html" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">Sign Up</a>
      </div>
      <p class="auth-switch" style="margin-top:14px;"><a href="#" data-close="login-nudge-modal">Continue as guest</a></p>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      overlay.classList.remove("show");
    })
  );
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("show");
  });
}

function showLoginNudge() {
  const overlay = document.getElementById("login-nudge-modal");
  if (overlay) overlay.classList.add("show");
}

function startLoginNudgeLoop(hasSession) {
  if (loginNudgeInterval) {
    clearInterval(loginNudgeInterval);
    loginNudgeInterval = null;
  }
  if (hasSession) return; // signed-in users never see the nudge

  injectLoginNudgeModal();
  // First nudge appears after one interval, then repeats — never
  // interrupts the very first message someone sends.
  loginNudgeInterval = setInterval(() => {
    if (!document.querySelector(".modal-overlay.show")) {
      showLoginNudge();
    }
  }, LOGIN_NUDGE_INTERVAL_MS);
}

async function renderAuthState() {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (err) {
    console.warn("Water AI: Supabase not configured yet.", err);
    return;
  }

  // Guests are always allowed on chat.html — no redirect to login.
  // Instead, show a dismissible sign-in reminder every 2 minutes.
  if (onChatPage()) {
    startLoginNudgeLoop(!!session);

    supabase.auth.onAuthStateChange((_event, newSession) => {
      startLoginNudgeLoop(!!newSession);
    });
  }

  // chat.html elements
  const chip = document.getElementById("auth-chip");
  const chipEmail = document.getElementById("auth-chip-email");
  const signinLink = document.getElementById("auth-signin-link");
  const signoutBtn = document.getElementById("auth-signout-btn");
  const sidebarEmail = document.getElementById("sidebar-user-email");

  if (chip && signinLink) {
    if (session) {
      chip.hidden = false;
      signinLink.hidden = true;
      // Always show the account's email, never a generic username.
      if (chipEmail) chipEmail.textContent = session.user.email || "";
    } else {
      chip.hidden = true;
      signinLink.hidden = false;
    }
  }
  if (sidebarEmail) {
    sidebarEmail.textContent = session ? session.user.email || "" : "Guest";
    sidebarEmail.title = session ? session.user.email || "" : "Signed out — chats stay on this device only";
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
    navSignin.textContent = session.user.email || "Account";
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
