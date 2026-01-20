// ===== Microfrontend config =====
// Replace these with your real domains
const MF = {
  onboardings: {
    name: "Onboardings",
    url: "https://onboardings.example.com/",
    origin: "https://onboardings.example.com",
  },
  support: {
    name: "Support",
    url: "https://support.example.com/",
    origin: "https://support.example.com",
  },
};

// ===== Minimal message contract =====
// Iframe -> Host:
// - MF_READY { name, contractVersion }
// - SET_TITLE { title }
// - ERROR { message }
//
// Host -> Iframe:
// - HOST_INIT { contractVersion }
//
// Note: Keep this versioned from day 1.
const CONTRACT_VERSION = 1;

// DOM refs
const frame = document.getElementById("mfFrame");
const loading = document.getElementById("loading");
const pageTitle = document.getElementById("pageTitle");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

const btnOnboardings = document.getElementById("btnOnboardings");
const btnSupport = document.getElementById("btnSupport");

let current = null; // {name,url,origin}
let readyTimeout = null;

function setStatus(state, text) {
  statusDot.classList.remove("ok", "err");

  if (state === "ok") statusDot.classList.add("ok");
  if (state === "err") statusDot.classList.add("err");

  statusText.textContent = text;
}

function setActiveButton(which) {
  btnOnboardings.classList.toggle("active", which === "onboardings");
  btnSupport.classList.toggle("active", which === "support");
}

function showLoading(show) {
  loading.classList.toggle("show", show);
}

function loadMicrofrontend(key) {
  const mf = MF[key];
  if (!mf) return;

  current = mf;
  setActiveButton(key);

  pageTitle.textContent = mf.name;
  showLoading(true);
  setStatus("pending", `Loading: ${mf.name}`);

  // Clear current iframe before loading a new one
  frame.src = "about:blank";

  // If MF does not send MF_READY, show error
  clearTimeout(readyTimeout);
  readyTimeout = setTimeout(() => {
    setStatus("err", `No response from: ${mf.name}`);
    showLoading(false);
  }, 8000);

  // Start loading
  frame.src = mf.url;
}

// Host -> Iframe (secure: targetOrigin)
function postToFrame(type, payload) {
  if (!current) return;
  if (!frame.contentWindow) return;

  const msg = {
    type,
    payload: payload ?? {},
    meta: {
      contractVersion: CONTRACT_VERSION,
      ts: Date.now(),
    },
  };

  frame.contentWindow.postMessage(msg, current.origin);
}

// Iframe -> Host (receive)
window.addEventListener("message", (event) => {
  // 1) Origin allowlist
  const allowedOrigins = new Set([MF.onboardings.origin, MF.support.origin]);
  if (!allowedOrigins.has(event.origin)) return;

  // 2) Only accept messages from the currently active MF
  if (!current || event.origin !== current.origin) return;

  const data = event.data;
  if (!data || typeof data !== "object") return;

  const { type, payload } = data;

  if (type === "MF_READY") {
    clearTimeout(readyTimeout);
    setStatus("ok", `Ready: ${current.name}`);
    showLoading(false);

    // Send init config to MF
    postToFrame("HOST_INIT", {
      contractVersion: CONTRACT_VERSION,
    });
    return;
  }

  if (type === "SET_TITLE") {
    const title = payload?.title;
    if (typeof title === "string" && title.length <= 60) {
      pageTitle.textContent = title;
    }
    return;
  }

  if (type === "ERROR") {
    setStatus("err", `Error in ${current.name}`);
    console.warn("MF error:", payload);
    showLoading(false);
    return;
  }
});

// Menu actions
btnOnboardings.addEventListener("click", () => loadMicrofrontend("onboardings"));
btnSupport.addEventListener("click", () => loadMicrofrontend("support"));

// Default module
loadMicrofrontend("onboardings");
