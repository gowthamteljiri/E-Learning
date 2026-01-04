import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("MEET JS LOADED");

const meetContainer = document.getElementById("meetContainer");

/* ================= RENDER EMPLOYEES ================= */
async function loadEmployees() {
  meetContainer.innerHTML = "";

  let isAdmin = sessionStorage.getItem("isAdmin") === "true";

  try {
    const snapshot = await getDocs(collection(db, "employees"));

    if (snapshot.empty) {
      meetContainer.innerHTML = "<p>No employees added yet.</p>";
      return;
    }

    snapshot.forEach(docSnap => {
      const emp = docSnap.data();

      const item = document.createElement("div");
      item.className = "employee-item";
      item.dataset.id = docSnap.id;

      item.innerHTML = `
        <img src="${emp.photoURL}" class="employee-avatar" />

        <div class="employee-card">
          ${
            isAdmin
              ? `<button class="delete-btn" title="Delete">🗑</button>`
              : ""
          }

          <img src="${emp.photoURL}" class="employee-photo-big" />
          <h3>${emp.name}</h3>
          <p>${emp.about}</p>

          <div class="stars">
            ${"★".repeat(emp.stars)}
            ${"☆".repeat(5 - emp.stars)}
          </div>
        </div>
      `;

      meetContainer.appendChild(item);
    });

  } catch (err) {
    console.error("Failed to load employees:", err);
    meetContainer.innerHTML = "<p>Error loading employees.</p>";
  }
}

/* ================= DELETE EMPLOYEE (ADMIN ONLY) ================= */
meetContainer.addEventListener("click", async (e) => {
  const deleteBtn = e.target.closest(".delete-btn");
  if (!deleteBtn) return;

  e.stopPropagation();

  if (sessionStorage.getItem("isAdmin") !== "true") {
    alert("Unauthorized");
    return;
  }

  const item = deleteBtn.closest(".employee-item");
  const id = item.dataset.id;

  if (!confirm("Delete this employee?")) return;

  try {
    await deleteDoc(doc(db, "employees", id));
    item.remove(); // ✅ no reload
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete employee");
  }
});

/* ================= MOBILE / HOVER SUPPORT ================= */
meetContainer.addEventListener("click", e => {
  const item = e.target.closest(".employee-item");
  if (!item) return;

  if (e.target.classList.contains("delete-btn")) return;

  item.classList.toggle("show");
});

/* ================= ADMIN MODE REACT ================= */
/* When admin mode is entered without reload */
window.addEventListener("storage", () => {
  loadEmployees();
});

/* ================= INIT ================= */
loadEmployees();
