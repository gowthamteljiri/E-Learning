import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {

  const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  const folderList = document.querySelector(".training-folders");
  const videoList = document.querySelector(".training-videos ul");
  const player = document.getElementById("videoFrame");
  const title = document.getElementById("videoTitle");
  const desc = document.getElementById("videoDesc");

  /* ================= LOAD FOLDERS ================= */
  async function loadFolders() {
    folderList.innerHTML = "<h3>Training Modules</h3>";
    videoList.innerHTML = "<li class='placeholder'>Select a training module</li>";
    player.src = "";
    title.textContent = "Select a video";
    desc.textContent = "";

    const folderSnap = await getDocs(collection(db, "trainingFolders"));

    if (folderSnap.empty) {
      folderList.innerHTML += "<div>No folders found</div>";
      return;
    }

    folderSnap.forEach(folderDoc => {
      const folder = folderDoc.data();

      const row = document.createElement("div");
      row.className = "folder-row";

      row.innerHTML = `
        <span class="folder-name">${folder.name}</span>
        ${isAdmin
          ? `<button class="delete-btn" title="Delete folder">🗑</button>`
          : ""
        }
      `;

      // Load videos on click
      row.onclick = () => {
        loadVideos(folder.name);
      };

      // ADMIN: Delete folder + its videos
      if (isAdmin) {
        row.querySelector(".delete-btn").onclick = async (e) => {
          e.stopPropagation();

          if (!confirm(`Delete folder "${folder.name}" and all its videos?`))
            return;

          // Delete all videos in this folder
          const q = query(
            collection(db, "trainingVideos"),
            where("folder", "==", folder.name)
          );

          const videoSnap = await getDocs(q);
          for (const v of videoSnap.docs) {
            await deleteDoc(doc(db, "trainingVideos", v.id));
          }

          // Delete folder
          await deleteDoc(doc(db, "trainingFolders", folderDoc.id));

          loadFolders();
        };
      }

      folderList.appendChild(row);
    });
  }

  /* ================= LOAD VIDEOS ================= */
  async function loadVideos(folderName) {
    videoList.innerHTML = "";

    const q = query(
      collection(db, "trainingVideos"),
      where("folder", "==", folderName)
    );

    const videoSnap = await getDocs(q);

    if (videoSnap.empty) {
      videoList.innerHTML =
        "<li class='placeholder'>No videos in this folder</li>";
      return;
    }

    videoSnap.forEach(videoDoc => {
      const video = videoDoc.data();

      const li = document.createElement("li");
      li.className = "video-row";

      li.innerHTML = `
        <span class="video-name">${video.name}</span>
        ${isAdmin
          ? `<button class="delete-btn" title="Delete video">🗑</button>`
          : ""
        }
      `;

      // Play video
      li.onclick = () => {
        player.src = video.url;
        title.textContent = video.name;
        desc.textContent = `Training video for ${folderName}`;
      };

      // ADMIN: Delete video
      if (isAdmin) {
        li.querySelector(".delete-btn").onclick = async (e) => {
          e.stopPropagation();

          if (!confirm(`Delete video "${video.name}"?`)) return;

          await deleteDoc(doc(db, "trainingVideos", videoDoc.id));
          loadVideos(folderName);
        };
      }

      videoList.appendChild(li);
    });
  }

  /* ================= FULLSCREEN ================= */
  const fsBtn = document.getElementById("fsBtn");
  const playerContainer = document.getElementById("playerContainer");

  fsBtn.onclick = () => {
    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  /* INIT */
  loadFolders();
});
