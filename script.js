// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB9wOo2N7ZIutzUOr8KRoodJjJNYqXAtB4",
  authDomain: "task-apps-3301a.firebaseapp.com",
  databaseURL: "https://task-apps-3301a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "task-apps-3301a",
  storageBucket: "task-apps-3301a.appspot.com",
  messagingSenderId: "964789555266",
  appId: "1:964789555266:web:23a982b2a2e3a7a58edddb"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Navigasi Halaman
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  if (pageId === 'inputPage') {
    document.getElementById('btnInput').classList.add('active');
  } else {
    document.getElementById('btnList').classList.add('active');
  }
}

// Tambah Tugas
const form = document.getElementById("taskForm");
form.addEventListener("submit", function(e) {
  e.preventDefault();
  const password = prompt("Masukkan password untuk menambah tugas:");
  if (password !== "1111") return alert("Password salah!");

  const jamMulai = document.getElementById("jamMulai").value;
  const jamSelesai = document.getElementById("jamSelesai").value;
  const durasi = hitungDurasi(jamMulai, jamSelesai);
  if (durasi < 0) return alert("Jam selesai tidak boleh lebih awal dari jam mulai!");

  const data = {
    nama: document.getElementById("nama").value,
    area: document.getElementById("area").value,
    tipe: document.getElementById("tipe").value,
    shift: document.getElementById("shift").value,
    tanggal: document.getElementById("tanggal").value,
    jamMulai,
    jamSelesai,
    durasi,
    due: document.getElementById("due").value,
    pembuat: document.getElementById("pembuat").value,
    penerima: document.getElementById("penerima").value,
    selesai: false,
    timestamp: Date.now()
  };

  db.ref("tasks").push(data);
  form.reset();
  alert("Tugas berhasil ditambahkan!");
});

function hitungDurasi(jamMulai, jamSelesai) {
  const [jm, mm] = jamMulai.split(":").map(Number);
  const [js, ms] = jamSelesai.split(":").map(Number);
  const mulai = jm * 60 + mm;
  const selesai = js * 60 + ms;
  return ((selesai - mulai) / 60).toFixed(2);
}

// Tampilkan Tugas
const taskList = document.getElementById("taskList");
db.ref("tasks").on("value", (snapshot) => {
  const tasks = snapshot.val();
  taskList.innerHTML = "";

  if (tasks) {
    const items = Object.entries(tasks).sort((a, b) => b[1].timestamp - a[1].timestamp);
    items.forEach(([id, task]) => {
      const card = document.createElement("div");
      card.className = "task-card";
      if (task.selesai) card.classList.add("selesai");

      card.innerHTML = `
        <strong>${task.nama}</strong>
        <small>📍 Area: ${task.area}</small>
        <small>📂 Tipe: ${task.tipe}</small>
        <small>⏱️ Shift: ${task.shift}</small>
        <small>📅 ${task.tanggal} (${task.jamMulai} - ${task.jamSelesai}) | Durasi: ${task.durasi} jam</small>
        <small>⏰ Due: ${task.due}</small>
        <small>👤 ${task.pembuat} ➡️ ${task.penerima}</small>
        <button class="delete-btn" onclick="deleteTask('${id}')">Hapus</button>
        ${!task.selesai ? `<button class="selesai-btn" onclick="selesaikanTugas('${id}')">✅ Selesai</button>` : ""}
      `;
      taskList.appendChild(card);
    });
  }
});

function deleteTask(id) {
  const password = prompt("Masukkan password untuk menghapus tugas:");
  if (password !== "1111") return alert("Password salah!");
  db.ref("tasks/" + id).remove();
}

function selesaikanTugas(id) {
  const password = prompt("Masukkan password untuk menyelesaikan tugas:");
  if (password !== "1111") return alert("Password salah!");
  db.ref("tasks/" + id).update({ selesai: true });
}

document.getElementById("deleteAllBtn").addEventListener("click", () => {
  const password = prompt("Masukkan password untuk menghapus semua tugas:");
  if (password !== "1111") return alert("Password salah!");
  if (confirm("Yakin ingin menghapus semua tugas?")) {
    db.ref("tasks").remove();
  }
});

