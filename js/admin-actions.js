import { db } from "./firebase.js";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= HTML TEMPLATES ================= */
const MODAL_HTML = `
<div class="admin-popup" id="adminActionPopup">
  <div class="admin-popup-box">
    <h2 id="actionTitle">Add New</h2>
    
    <!-- MENU -->
    <div id="actionMenu">
      <div class="admin-actions" style="flex-direction: column; gap: 10px;">
        <button id="btnNewFolder">📁 Training Folder</button>
        <button id="btnNewVideo">🎬 Training Video</button>
        <button id="btnNewEmployee">👤 New Employee</button>
        <button id="btnLogout" class="ghost" style="border-color: crimson; color: crimson;">Logout Admin</button>
        <button id="btnCloseAction" class="ghost">Cancel</button>rder-color: crimson; color: crimson;">Logout Admin</button>
        <button id="btnCloseAction" class="ghost">Cancel</button>
      </div>
    </div>

    <!-- FOLDER FORM -->
    <div id="formFolder" style="display:none; text-align: left;">
      <label>Folder Name</label>
      <input type="text" id="inpFolderName" placeholder="Ex: Onboarding">
      <div class="admin-actions">
        <button id="subFolder">Create</button>
        <button class="ghost back-btn">Back</button>
      </div>
    </div>

    <!-- VIDEO FORM -->
    <div id="formVideo" style="display:none; text-align: left;">
      <label>Select Folder</label>
      <select id="inpVideoFolder" style="width:100%; padding:12px; margin-bottom:16px; border-radius:12px; border:1px solid #ddd;">
        <option>Loading...</option>
      </select>
      
      <label>Video Name</label>
      <input type="text" id="inpVideoName" placeholder="Ex: Welcome to CFC">
      
      <label>Google Drive Preview URL</label>
      <input type="text" id="inpVideoUrl" placeholder="https://drive.google.com/file/d/...">

      <div class="admin-actions">
        <button id="subVideo">Add Video</button>
        <button class="ghost back-btn">Back</button>
      </div>
    </div>

    <!-- EMPLOYEE FORM -->
    <div id="formEmployee" style="display:none; text-align: left;">
      <label>Full Name</label>
      <input type="text" id="inpEmpName" placeholder="Ex: John Doe">
      
      <label>Role / About</label>
      <input type="text" id="inpEmpAbout" placeholder="Ex: Senior Developer">
      
      <label>Stars (1-5)</label>
      <input type="number" id="inpEmpStars" min="1" max="5" value="5">

      <label>Photo URL (Right click image -> Copy Image Link)</label>
      <input type="text" id="inpEmpPhoto" placeholder="https://... or images/your-file.jpg">

      <div class="admin-actions">
        <button id="subEmployee">Add Employee</button>
        <button class="ghost back-btn">Back</button>
      </div>
    </div>

  </div>
</div>
`;

/* ================= INIT ================= */
export function initAdminActions() {
    if (document.getElementById("adminActionPopup")) return;

    // Inject Modal
    document.body.insertAdjacentHTML("beforeend", MODAL_HTML);

    // Bind Events
    bindEvents();
}

export function openAdminMenu() {
    const popup = document.getElementById("adminActionPopup");
    if (popup) {
        resetForms();
        popup.classList.add("show");
    }
}

function closePopup() {
    const popup = document.getElementById("adminActionPopup");
    if (popup) popup.classList.remove("show");
}

/* ================= UI LOGIC ================= */
function bindEvents() {
    const popup = document.getElementById("adminActionPopup");

    // Main Menu Buttons
    document.getElementById("btnNewFolder").onclick = () => showForm("formFolder");
    document.getElementById("btnNewVideo").onclick = () => {
        showForm("formVideo");
        loadFolderOptions();
    };
    document.getElementById("btnNewEmployee").onclick = () => showForm("formEmployee");
    document.getElementById("btnLogout").onclick = () => {
        if (confirm("Logout from Admin Mode?")) {
            sessionStorage.removeItem("isAdmin");
            location.reload();
        }
    };
    document.getElementById("btnCloseAction").onclick = closePopup;

    // Back Buttons
    popup.querySelectorAll(".back-btn").forEach(btn => {
        btn.onclick = () => {
            resetForms();
            document.getElementById("actionMenu").style.display = "block";
            document.getElementById("actionTitle").innerText = "Add New";
        };
    });

    // SUBMIT HANDLERS
    document.getElementById("subFolder").onclick = createFolder;
    document.getElementById("subVideo").onclick = createVideo;
    document.getElementById("subEmployee").onclick = createEmployee;
}

function showForm(formId) {
    document.getElementById("actionMenu").style.display = "none";
    document.getElementById(formId).style.display = "block";
    document.getElementById("actionTitle").innerText =
        formId === "formFolder" ? "New Folder" :
            formId === "formVideo" ? "New Video" : "New Employee";
}

function resetForms() {
    const popup = document.getElementById("adminActionPopup");
    popup.querySelectorAll("input, select").forEach(i => i.value = "");
    document.getElementById("inpEmpStars").value = 5;

    ["formFolder", "formVideo", "formEmployee"].forEach(id => {
        document.getElementById(id).style.display = "none";
    });
    document.getElementById("actionMenu").style.display = "block";
    document.getElementById("actionTitle").innerText = "Add New";
}

/* ================= FIRESTORE ACTIONS ================= */

// 1. CREATE FOLDER
async function createFolder() {
    const name = document.getElementById("inpFolderName").value.trim();
    if (!name) return alert("Enter folder name");

    const btn = document.getElementById("subFolder");
    btn.innerText = "Creating...";

    try {
        await addDoc(collection(db, "trainingFolders"), {
            name: name,
            createdAt: Date.now()
        });
        alert("Folder created!");
        closePopup();
        location.reload(); // Refresh to show
    } catch (err) {
        console.error(err);
        alert("Error creating folder");
    } finally {
        btn.innerText = "Create";
    }
}

// 2. LOAD FOLDER OPTIONS (For Video)
async function loadFolderOptions() {
    const select = document.getElementById("inpVideoFolder");
    select.innerHTML = "<option>Loading...</option>";

    try {
        const q = query(collection(db, "trainingFolders"), orderBy("createdAt"));
        const snap = await getDocs(q);

        select.innerHTML = "";
        if (snap.empty) {
            select.innerHTML = "<option value=''>No Folders Found</option>";
            return;
        }

        snap.forEach(doc => {
            const data = doc.data();
            const opt = document.createElement("option");
            opt.value = data.name;
            opt.innerText = data.name;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error(err);
        select.innerHTML = "<option>Error loading folders</option>";
    }
}

// 3. CREATE VIDEO
async function createVideo() {
    const folder = document.getElementById("inpVideoFolder").value;
    const name = document.getElementById("inpVideoName").value.trim();
    const url = document.getElementById("inpVideoUrl").value.trim();

    if (!folder || !name || !url) return alert("Fill all fields");

    // Convert Drive URL to Preview URL if needed
    let finalUrl = url;
    if (url.includes("drive.google.com") && url.includes("/view")) {
        finalUrl = url.replace("/view", "/preview");
    }

    const btn = document.getElementById("subVideo");
    btn.innerText = "Adding...";

    try {
        await addDoc(collection(db, "trainingVideos"), {
            folder,
            name,
            url: finalUrl,
            createdAt: Date.now()
        });
        alert("Video added!");
        closePopup();
        location.reload();
    } catch (err) {
        console.error(err);
        alert("Error adding video");
    } finally {
        btn.innerText = "Add Video";
    }
}

// 4. CREATE EMPLOYEE
async function createEmployee() {
    const name = document.getElementById("inpEmpName").value.trim();
    const about = document.getElementById("inpEmpAbout").value.trim();
    const stars = document.getElementById("inpEmpStars").value;
    const photoURL = document.getElementById("inpEmpPhoto").value.trim();

    if (!name || !about || !photoURL) return alert("Fill all fields");

    const btn = document.getElementById("subEmployee");
    btn.innerText = "Adding...";

    try {
        await addDoc(collection(db, "employees"), {
            name,
            about,
            stars: parseInt(stars) || 5,
            photoURL,
            createdAt: Date.now()
        });
        alert("Employee added!");
        closePopup();
        location.reload();
    } catch (err) {
        console.error(err);
        alert("Error adding employee");
    } finally {
        btn.innerText = "Add Employee";
    }
}
