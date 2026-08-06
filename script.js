// =======================================================
// Telecom Group Chattogram City
// script.js
// Part - 1
// Supabase Version
// =======================================================

import { supabase } from "./supabase.js";

// ==========================================
// Global Variables
// ==========================================

const form = document.querySelector("form");
const table = document.querySelector("table");

// ==========================================
// Alert
// ==========================================

function showAlert(message) {
  alert(message);
}

// ==========================================
// Loading Button
// ==========================================

function startLoading() {
  const btn = document.querySelector("button[type='submit']");

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = "⏳ অপেক্ষা করুন...";
  }
}

function stopLoading() {
  const btn = document.querySelector("button[type='submit']");

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = "আবেদন জমা দিন";
  }
}

// ==========================================
// Upload File
// ==========================================

async function uploadFile(file, bucket) {

  if (!file) return "";

  const fileName = Date.now() + "_" + file.name;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// ==========================================
// Duplicate Mobile Check
// ==========================================

async function mobileExists(mobile) {

  const { data, error } = await supabase
    .from("members")
    .select("id")
    .eq("mobile", mobile);

  if (error) throw error;

  return data.length > 0;
}

// ==========================================
// Duplicate NID Check
// ==========================================

async function nidExists(nid) {

  const { data, error } = await supabase
    .from("members")
    .select("id")
    .eq("nid", nid);

  if (error) throw error;

  return data.length > 0;
}                                    // ==========================================
// Part - 2
// Register Member
// ==========================================

async function registerMember() {

  try {

    startLoading();

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const email = document.getElementById("email").value.trim();
    const dob = document.getElementById("dob").value;
    const shop = document.getElementById("shop").value.trim();
    const address = document.getElementById("address").value.trim();
    const map = document.getElementById("map").value.trim();
    const business = document.getElementById("business").value;
    const nid = document.getElementById("nid").value.trim();
    const agree = document.getElementById("agree").checked;

    const photo = document.getElementById("photo").files[0];
    const shopImage = document.getElementById("shopImage").files[0];
    const tradeLicense = document.getElementById("tradeLicense").files[0];
    const nidImage = document.getElementById("nidImage").files[0];

    // Validation
    if (!name) return showAlert("পূর্ণ নাম লিখুন");
    if (mobile.length !== 11) return showAlert("সঠিক মোবাইল নম্বর লিখুন");
    if (!shop) return showAlert("দোকানের নাম লিখুন");
    if (!business) return showAlert("ব্যবসার ধরন নির্বাচন করুন");
    if (nid.length !== 17) return showAlert("১৭ সংখ্যার NID লিখুন");
    if (!agree) return showAlert("ঘোষণাপত্রে টিক দিন");

    // Duplicate Check
    if (await mobileExists(mobile))
      return showAlert("এই মোবাইল নম্বর আগে থেকেই নিবন্ধিত");

    if (await nidExists(nid))
      return showAlert("এই NID আগে থেকেই নিবন্ধিত");

    // Upload Files
    const photoURL = await uploadFile(photo, "member-photo");
    const shopImageURL = await uploadFile(shopImage, "shop-photo");
    const tradeLicenseURL = await uploadFile(tradeLicense, "trade-license");
    const nidImageURL = await uploadFile(nidImage, "nid-photo");

    // Member ID
    const memberId = "TG-" + Date.now();

    // Save Database
    const { error } = await supabase
      .from("members")
      .insert([{
        memberid: memberId,
        name,
        mobile,
        whatsapp,
        email,
        dob,
        shop,
        address,
        map,
        business,
        nid,
        photo: photoURL,
        shopimage: shopImageURL,
        tradelicense: tradeLicenseURL,
        nidimage: nidImageURL,
        status: "Pending"
      }]);

    if (error) throw error;

    showAlert("✅ আবেদন সফলভাবে জমা হয়েছে");

    form.reset();

  } catch (error) {

    console.error(error);
    alert(JSON.stringify(error,null,2));

  } finally {

    stopLoading();

  }

}

// ==========================================
// Submit Event
// ==========================================

if (form) {

  form.addEventListener("submit", function (e) {

    e.preventDefault();

    registerMember();

  });

}                                    // ==========================================
// Part - 3
// Admin Dashboard
// ==========================================

async function loadMembers() {

  if (!table) return;

  try {

    table.innerHTML = `
      <tr>
        <th>Member ID</th>
        <th>নাম</th>
        <th>মোবাইল</th>
        <th>ব্যবসা</th>
        <th>স্ট্যাটাস</th>
        <th>Action</th>
      </tr>
    `;

    const { data: members, error } = await supabase
      .from("members")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    let total = 0;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    members.forEach((member) => {

      total++;

      if (member.status === "Pending") pending++;
      if (member.status === "Approved") approved++;
      if (member.status === "Rejected") rejected++;

      table.innerHTML += `
        <tr>

          <td>${member.memberid || "-"}</td>
          <td>${member.name}</td>
          <td>${member.mobile}</td>
          <td>${member.business}</td>
          <td>${member.status}</td>

          <td>

            <button onclick="viewMember(${member.id})">👁️</button>

            <button onclick="approveMember(${member.id})">✅</button>

            <button onclick="rejectMember(${member.id})">❌</button>

            <button onclick="editMember(${member.id})">✏️</button>

            <button onclick="deleteMember(${member.id})">🗑️</button>

          </td>

        </tr>
      `;

    });

    const stats = document.querySelectorAll("b");

    if (stats.length >= 4) {

      stats[0].textContent = total;
      stats[1].textContent = pending;
      stats[2].textContent = approved;
      stats[3].textContent = rejected;

    }

  } catch (err) {

    console.error(err);

    showAlert(err.message);

  }

}

// ==========================================
// Auto Load Dashboard
// ==========================================

if (table) {

  loadMembers();

}                                    // ==========================================
// Part - 4
// Member Actions
// ==========================================

// View Member
async function viewMember(id) {

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    showAlert(error.message);
    return;
  }

  document.getElementById("memberDetails").innerHTML = `
    <p><b>Member ID:</b> ${data.memberid || "-"}</p>
    <p><b>নাম:</b> ${data.name || ""}</p>
    <p><b>মোবাইল:</b> ${data.mobile || ""}</p>
    <p><b>WhatsApp:</b> ${data.whatsapp || ""}</p>
    <p><b>Email:</b> ${data.email || ""}</p>
    <p><b>জন্ম তারিখ:</b> ${data.dob || ""}</p>
    <p><b>দোকানের নাম:</b> ${data.shop || ""}</p>
    <p><b>ঠিকানা:</b> ${data.address || ""}</p>
    <p><b>ব্যবসা:</b> ${data.business || ""}</p>
    <p><b>NID:</b> ${data.nid || ""}</p>
    <p><b>স্ট্যাটাস:</b> ${data.status || ""}</p>

    ${data.photo ? `<img src="${data.photo}" width="120"><br>` : ""}
    ${data.shopimage ? `<img src="${data.shopimage}" width="120"><br>` : ""}
    ${data.nidimage ? `<img src="${data.nidimage}" width="120"><br>` : ""}
    ${data.tradelicense ? `<a href="${data.tradelicense}" target="_blank">📄 Trade License</a>` : ""}
  `;

  document.getElementById("memberModal").style.display = "block";
}

// Close Modal
function closeModal() {
  document.getElementById("memberModal").style.display = "none";
}

// Approve Member
async function approveMember(id) {

  const { error } = await supabase
    .from("members")
    .update({ status: "Approved" })
    .eq("id", id);

  if (error) return showAlert(error.message);

  loadMembers();
}

// Reject Member
async function rejectMember(id) {

  const { error } = await supabase
    .from("members")
    .update({ status: "Rejected" })
    .eq("id", id);

  if (error) return showAlert(error.message);

  loadMembers();
}

// Edit Member
async function editMember(id) {

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return showAlert(error.message);

  const name = prompt("নাম", data.name);
  if (name === null) return;

  const mobile = prompt("মোবাইল", data.mobile);
  if (mobile === null) return;

  const shop = prompt("দোকানের নাম", data.shop);
  if (shop === null) return;

  const address = prompt("ঠিকানা", data.address);
  if (address === null) return;

  const { error: updateError } = await supabase
    .from("members")
    .update({
      name,
      mobile,
      shop,
      address
    })
    .eq("id", id);

  if (updateError) return showAlert(updateError.message);

  showAlert("✅ তথ্য আপডেট হয়েছে");

  loadMembers();
}

// Delete Member
async function deleteMember(id) {

  if (!confirm("আপনি কি সদস্যটি Delete করতে চান?")) return;

  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", id);

  if (error) return showAlert(error.message);

  showAlert("✅ Member Deleted");

  loadMembers();
}

// Logout
function logout() {
  localStorage.removeItem("admin");
  window.location.href = "login.html";
}

// Search Member
function searchMember() {

  const input = document.getElementById("search");

  if (!input) return;

  const filter = input.value.toLowerCase();

  const rows = table.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    rows[i].style.display =
      rows[i].innerText.toLowerCase().includes(filter)
        ? ""
        : "none";
  }
}

// Close Modal Outside Click
window.onclick = function (event) {
  const modal = document.getElementById("memberModal");

  if (event.target === modal) {
    closeModal();
  }
};

// Global Functions
window.viewMember = viewMember;
window.closeModal = closeModal;
window.approveMember = approveMember;
window.rejectMember = rejectMember;
window.editMember = editMember;
window.deleteMember = deleteMember;
window.logout = logout;
window.searchMember = searchMember;  /* ==========================================
   PWA Install Prompt
========================================== */

let deferredPrompt;

const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (event) => {

    event.preventDefault();

    deferredPrompt = event;

    if (installBtn) {

        installBtn.hidden = false;

    }

});

installBtn?.addEventListener("click", async () => {

    if (!deferredPrompt) return;

    installBtn.hidden = true;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    console.log("Install:", outcome);

    deferredPrompt = null;

});

window.addEventListener("appinstalled", () => {

    console.log("✅ App Installed");

    if (installBtn) {

        installBtn.hidden = true;

    }

});
