/* ================= ADMIN MODE ================= */
import { initAdminActions, openAdminMenu } from "./admin-actions.js";

const ADMIN_PASSWORD = "MR@CFC!";

/* ================= HELPERS ================= */
function getPopup() {
  return document.getElementById("adminPopup");
}
function getFab() {
  return document.getElementById("adminFab");
}
function getPassInput() {
  return document.getElementById("adminPass");
}
function getEnterBtn() {
  return document.getElementById("enterAdminBtn");
}
function getCancelBtn() {
  return document.getElementById("cancelAdminBtn");
}

/* ================= SHOW ADMIN POPUP ================= */
window.showAdminPopup = function () {
  const popup = getPopup();
  const passInput = getPassInput();

  if (!popup) {
    console.warn("Admin popup not found in DOM");
    return;
  }

  popup.classList.add("show");
  if (passInput) passInput.value = "";
};

/* ================= INIT ADMIN UI ================= */
function enableAdminUI() {
  const fab = getFab();
  if (sessionStorage.getItem("isAdmin") === "true") {
    if (fab) fab.style.display = "flex";
    initAdminActions(); // Init the modals
  }
}

/* ================= BIND EVENTS AFTER DOM LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {

  const enterBtn = getEnterBtn();
  const cancelBtn = getCancelBtn();
  const fab = getFab();

  if (enterBtn) {
    enterBtn.onclick = () => {
      const passInput = getPassInput();
      if (!passInput) return alert("Password input missing");

      if (passInput.value !== ADMIN_PASSWORD) {
        alert("Wrong password");
        return;
      }

      sessionStorage.setItem("isAdmin", "true");
      const popup = getPopup();
      if (popup) popup.classList.remove("show");

      enableAdminUI();
      alert("Admin mode activated");
      location.reload(); // Reload to refresh UI checks in other scripts
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      const popup = getPopup();
      if (popup) popup.classList.remove("show");
    };
  }

  if (fab) {
    fab.onclick = () => {
      openAdminMenu();
    };
  }

  enableAdminUI();
});
