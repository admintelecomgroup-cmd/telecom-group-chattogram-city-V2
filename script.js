// =======================================================
// Telecom Group Chattogram City
// script.js
// Complete Supabase + Admin Dashboard + PWA
// =======================================================

import { supabase } from "./supabase.js";

"use strict";

// =======================================================
// DOM
// =======================================================

const form = document.getElementById("memberForm");
const table = document.getElementById("memberTable");
const tableBody = document.getElementById("memberTableBody");
const installBtn = document.getElementById("installBtn");

// =======================================================
// Alert
// =======================================================

function showAlert(message) {
    alert(message);
}

// =======================================================
// Loading
// =======================================================

function startLoading() {

    const btn = document.getElementById("submitBtn");

    if (btn) {
        btn.disabled = true;
        btn.textContent = "⏳ অপেক্ষা করুন...";
    }
}

function stopLoading() {

    const btn = document.getElementById("submitBtn");

    if (btn) {
        btn.disabled = false;
        btn.textContent = "আবেদন জমা দিন";
    }
}

// =======================================================
// File Upload
// =======================================================

async function uploadFile(file, bucket) {

    if (!file) {
        return "";
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const fileName =
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 8) +
        "_" +
        safeName;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) {
        throw new Error(
            "File Upload Error (" + bucket + "): " + error.message
        );
    }

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    return data.publicUrl || "";
}

// =======================================================
// Duplicate Mobile
// =======================================================

async function mobileExists(mobile) {

    const { data, error } = await supabase
        .from("members")
        .select("id")
        .eq("mobile", mobile)
        .limit(1);

    if (error) {
        throw error;
    }

    return Array.isArray(data) && data.length > 0;
}

// =======================================================
// Duplicate NID
// =======================================================

async function nidExists(nid) {

    const { data, error } = await supabase
        .from("members")
        .select("id")
        .eq("nid", nid)
        .limit(1);

    if (error) {
        throw error;
    }

    return Array.isArray(data) && data.length > 0;
}

// =======================================================
// Register Member
// =======================================================

async function registerMember() {

    try {

        startLoading();

        const name =
            document.getElementById("name")?.value.trim() || "";

        const mobile =
            document.getElementById("mobile")?.value.trim() || "";

        const whatsapp =
            document.getElementById("whatsapp")?.value.trim() || "";

        const email =
            document.getElementById("email")?.value.trim() || "";

        const dob =
            document.getElementById("dob")?.value || null;

        const shop =
            document.getElementById("shop")?.value.trim() || "";

        const address =
            document.getElementById("address")?.value.trim() || "";

        const map =
            document.getElementById("map")?.value.trim() || "";

        const business =
            document.getElementById("business")?.value || "";

        const nid =
            document.getElementById("nid")?.value.trim() || "";

        const agree =
            document.getElementById("agree")?.checked || false;

        const photo =
            document.getElementById("photo")?.files?.[0];

        const shopImage =
            document.getElementById("shopImage")?.files?.[0];

        const tradeLicense =
            document.getElementById("tradeLicense")?.files?.[0];

        const nidImage =
            document.getElementById("nidImage")?.files?.[0];


        // =================================================
        // Validation
        // =================================================

        if (!name) {
            showAlert("পূর্ণ নাম লিখুন");
            return;
        }

        if (!/^\d{11}$/.test(mobile)) {
            showAlert("সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন");
            return;
        }

        if (!shop) {
            showAlert("দোকানের নাম লিখুন");
            return;
        }

        if (!business) {
            showAlert("ব্যবসার ধরন নির্বাচন করুন");
            return;
        }

        if (!/^\d{17}$/.test(nid)) {
            showAlert("১৭ সংখ্যার NID লিখুন");
            return;
        }

        if (!photo) {
            showAlert("সদস্যের ছবি নির্বাচন করুন");
            return;
        }

        if (!shopImage) {
            showAlert("দোকানের ছবি নির্বাচন করুন");
            return;
        }

        if (!tradeLicense) {
            showAlert("ট্রেড লাইসেন্স নির্বাচন করুন");
            return;
        }

        if (!agree) {
            showAlert("ঘোষণাপত্রে টিক দিন");
            return;
        }


        // =================================================
        // Duplicate Check
        // =================================================

        if (await mobileExists(mobile)) {

            showAlert(
                "এই মোবাইল নম্বর আগে থেকেই নিবন্ধিত"
            );

            return;
        }

        if (await nidExists(nid)) {

            showAlert(
                "এই NID আগে থেকেই নিবন্ধিত"
            );

            return;
        }


        // =================================================
        // Upload Files
        // =================================================

        const photoURL =
            await uploadFile(photo, "member-photo");

        const shopImageURL =
            await uploadFile(shopImage, "shop-photo");

        const tradeLicenseURL =
            await uploadFile(
                tradeLicense,
                "trade-license"
            );

        const nidImageURL =
            await uploadFile(
                nidImage,
                "nid-photo"
            );


        // =================================================
        // Member ID
        // =================================================

        const memberId =
            "TG-" +
            Date.now();


        // =================================================
        // Database Insert
        // =================================================

        const { data, error } = await supabase
            .from("members")
            .insert([{

                memberid: memberId,

                name: name,

                mobile: mobile,

                whatsapp: whatsapp,

                email: email,

                dob: dob,

                shop: shop,

                address: address,

                map: map,

                business: business,

                nid: nid,

                photo: photoURL,

                shopimage: shopImageURL,

                tradelicense: tradeLicenseURL,

                nidimage: nidImageURL,

                status: "Pending"

            }])
            .select()
            .single();


        if (error) {
            throw error;
        }


        console.log(
            "Member Saved:",
            data
        );


        showAlert(
            "✅ আবেদন সফলভাবে জমা হয়েছে\n\nMember ID: " +
            memberId
        );


        // Reset
        if (form) {
            form.reset();
        }


    } catch (error) {

        console.error(
            "Register Error:",
            error
        );

        showAlert(
            "❌ আবেদন জমা হয়নি\n\n" +
            (error.message || error)
        );

    } finally {

        stopLoading();

    }
}


// =======================================================
// Registration Submit
// =======================================================

if (form) {

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            registerMember();

        }
    );

}


// =======================================================
// Admin Dashboard
// =======================================================

async function loadMembers() {

    if (!tableBody) {
        return;
    }

    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    ⏳ সদস্য তথ্য লোড হচ্ছে...
                </td>
            </tr>
        `;


        const {
            data: members,
            error
        } = await supabase
            .from("members")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {
            throw error;
        }


        if (!members || members.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        📭 এখনো কোনো সদস্য নেই
                    </td>
                </tr>
            `;

            updateStats([]);

            return;
        }


        tableBody.innerHTML = "";


        members.forEach(function (member) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHTML(member.memberid || "-")}
                </td>

                <td>
                    ${escapeHTML(member.name || "-")}
                </td>

                <td>
                    ${escapeHTML(member.mobile || "-")}
                </td>

                <td>
                    ${escapeHTML(member.business || "-")}
                </td>

                <td>
                    ${escapeHTML(member.status || "Pending")}
                </td>

                <td>

                    <button
                        type="button"
                        class="action-btn"
                        data-action="view"
                        data-id="${member.id}">
                        👁️
                    </button>

                    <button
                        type="button"
                        class="action-btn"
                        data-action="approve"
                        data-id="${member.id}">
                        ✅
                    </button>

                    <button
                        type="button"
                        class="action-btn"
                        data-action="reject"
                        data-id="${member.id}">
                        ❌
                    </button>

                    <button
                        type="button"
                        class="action-btn"
                        data-action="edit"
                        data-id="${member.id}">
                        ✏️
                    </button>

                    <button
                        type="button"
                        class="action-btn"
                        data-action="delete"
                        data-id="${member.id}">
                        🗑️
                    </button>

                </td>
            `;


            tableBody.appendChild(row);

        });


        updateStats(members);


    } catch (error) {

        console.error(
            "Load Members Error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;color:red;">
                    ❌ সদস্য লোড করা যায়নি
                    <br>
                    ${escapeHTML(error.message || "")}
                </td>
            </tr>
        `;

    }

}


// =======================================================
// Statistics
// =======================================================

function updateStats(members) {

    const total =
        members.length;

    const pending =
        members.filter(
            m => m.status === "Pending"
        ).length;

    const approved =
        members.filter(
            m => m.status === "Approved"
        ).length;

    const rejected =
        members.filter(
            m => m.status === "Rejected"
        ).length;


    const stats =
        document.querySelectorAll(".stat-card p b");


    if (stats.length >= 4) {

        stats[0].textContent = total;

        stats[1].textContent = pending;

        stats[2].textContent = approved;

        stats[3].textContent = rejected;

    }

}


// =======================================================
// View Member
// =======================================================

async function viewMember(id) {

    try {

        const {
            data,
            error
        } = await supabase
            .from("members")
            .select("*")
            .eq("id", id)
            .single();


        if (error) {
            throw error;
        }


        const details =
            document.getElementById(
                "memberDetails"
            );

        const modal =
            document.getElementById(
                "memberModal"
            );


        if (!details || !modal) {
            return;
        }


        details.innerHTML = `

            <p>
                <b>Member ID:</b>
                ${escapeHTML(data.memberid || "-")}
            </p>

            <p>
                <b>নাম:</b>
                ${escapeHTML(data.name || "-")}
            </p>

            <p>
                <b>মোবাইল:</b>
                ${escapeHTML(data.mobile || "-")}
            </p>

            <p>
                <b>WhatsApp:</b>
                ${escapeHTML(data.whatsapp || "-")}
            </p>

            <p>
                <b>Email:</b>
                ${escapeHTML(data.email || "-")}
            </p>

            <p>
                <b>জন্ম তারিখ:</b>
                ${escapeHTML(data.dob || "-")}
            </p>

            <p>
                <b>দোকানের নাম:</b>
                ${escapeHTML(data.shop || "-")}
            </p>

            <p>
                <b>ঠিকানা:</b>
                ${escapeHTML(data.address || "-")}
            </p>

            <p>
                <b>Google Maps:</b>
                ${
                    data.map
                    ?
                    `<a href="${escapeAttribute(data.map)}"
                        target="_blank"
                        rel="noopener">
                        🗺️ Map
                    </a>`
                    :
                    "-"
                }
            </p>

            <p>
                <b>ব্যবসা:</b>
                ${escapeHTML(data.business || "-")}
            </p>

            <p>
                <b>NID:</b>
                ${escapeHTML(data.nid || "-")}
            </p>

            <p>
                <b>স্ট্যাটাস:</b>
                ${escapeHTML(data.status || "-")}
            </p>

            <hr>

            ${
                data.photo
                ?
                `<p>
                    <b>সদস্যের ছবি</b><br>
                    <img
                        src="${escapeAttribute(data.photo)}"
                        width="150"
                        alt="Member Photo">
                </p>`
                :
                ""
            }

            ${
                data.shopimage
                ?
                `<p>
                    <b>দোকানের ছবি</b><br>
                    <img
                        src="${escapeAttribute(data.shopimage)}"
                        width="150"
                        alt="Shop Photo">
                </p>`
                :
                ""
            }

            ${
                data.nidimage
                ?
                `<p>
                    <b>NID ছবি</b><br>
                    <img
                        src="${escapeAttribute(data.nidimage)}"
                        width="150"
                        alt="NID">
                </p>`
                :
                ""
            }

            ${
                data.tradelicense
                ?
                `<p>
                    <a
                        href="${escapeAttribute(data.tradelicense)}"
                        target="_blank"
                        rel="noopener">
                        📄 Trade License দেখুন
                    </a>
                </p>`
                :
                ""
            }

        `;


        modal.style.display = "block";


    } catch (error) {

        console.error(error);

        showAlert(
            "❌ সদস্যের তথ্য পাওয়া যায়নি\n\n" +
            error.message
        );

    }

}


// =======================================================
// Close Modal
// =======================================================

function closeModal() {

    const modal =
        document.getElementById(
            "memberModal"
        );

    if (modal) {
        modal.style.display = "none";
    }

}


// =======================================================
// Approve Member
// =======================================================

async function approveMember(id) {

    try {

        const {
            error
        } = await supabase
            .from("members")
            .update({
                status: "Approved"
            })
            .eq("id", id);


        if (error) {
            throw error;
        }


        showAlert(
            "✅ সদস্য Approved হয়েছে"
        );


        await loadMembers();


    } catch (error) {

        showAlert(
            "❌ Approve করা যায়নি\n\n" +
            error.message
        );

    }

}


// =======================================================
// Reject Member
// =======================================================

async function rejectMember(id) {

    try {

        const {
            error
        } = await supabase
            .from("members")
            .update({
                status: "Rejected"
            })
            .eq("id", id);


        if (error) {
            throw error;
        }


        showAlert(
            "✅ সদস্য Rejected হয়েছে"
        );


        await loadMembers();


    } catch (error) {

        showAlert(
            "❌ Reject করা যায়নি\n\n" +
            error.message
        );

    }

}


// =======================================================
// Edit Member
// =======================================================

async function editMember(id) {

    try {

        const {
            data,
            error
        } = await supabase
            .from("members")
            .select("*")
            .eq("id", id)
            .single();


        if (error) {
            throw error;
        }


        const name =
            prompt(
                "নাম",
                data.name || ""
            );

        if (name === null) {
            return;
        }


        const mobile =
            prompt(
                "মোবাইল",
                data.mobile || ""
            );

        if (mobile === null) {
            return;
        }


        const shop =
            prompt(
                "দোকানের নাম",
                data.shop || ""
            );

        if (shop === null) {
            return;
        }


        const address =
            prompt(
                "ঠিকানা",
                data.address || ""
            );

        if (address === null) {
            return;
        }


        const {
            error: updateError
        } = await supabase
            .from("members")
            .update({

                name:
                    name.trim(),

                mobile:
                    mobile.trim(),

                shop:
                    shop.trim(),

                address:
                    address.trim()

            })
            .eq("id", id);


        if (updateError) {
            throw updateError;
        }


        showAlert(
            "✅ তথ্য আপডেট হয়েছে"
        );


        await loadMembers();


    } catch (error) {

        showAlert(
            "❌ Edit করা যায়নি\n\n" +
            error.message
        );

    }

}


// =======================================================
// Delete Member
// =======================================================

async function deleteMember(id) {

    const confirmDelete =
        confirm(
            "আপনি কি এই সদস্যটি Delete করতে চান?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const {
            error
        } = await supabase
            .from("members")
            .delete()
            .eq("id", id);


        if (error) {
            throw error;
        }


        showAlert(
            "✅ Member Deleted"
        );


        await loadMembers();


    } catch (error) {

        showAlert(
            "❌ Delete করা যায়নি\n\n" +
            error.message
        );

    }

}


// =======================================================
// Action Button Handler
// =======================================================

if (tableBody) {

    tableBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;

            const id =
                button.dataset.id;


            if (!id) {
                return;
            }


            if (action === "view") {
                viewMember(id);
            }

            else if (action === "approve") {
                approveMember(id);
            }

            else if (action === "reject") {
                rejectMember(id);
            }

            else if (action === "edit") {
                editMember(id);
            }

            else if (action === "delete") {
                deleteMember(id);
            }

        }
    );

}


// =======================================================
// Search
// =======================================================

function searchMember() {

    const input =
        document.getElementById(
            "search"
        );


    if (!input || !tableBody) {
        return;
    }


    const filter =
        input.value
            .trim()
            .toLowerCase();


    const rows =
        tableBody.querySelectorAll("tr");


    rows.forEach(function (row) {

        row.style.display =
            row.innerText
                .toLowerCase()
                .includes(filter)
                ? ""
                : "none";

    });

}


// =======================================================
// Logout
// =======================================================

async function logout() {

    try {

        const {
            error
        } = await supabase.auth.signOut();


        if (error) {
            throw error;
        }


        localStorage.removeItem("admin");


        window.location.replace(
            "./login.html"
        );


    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );


        showAlert(
            "❌ Logout করা যায়নি\n\n" +
            error.message
        );

    }

}


// =======================================================
// Modal Outside Click
// =======================================================

window.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "memberModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeModal();

        }

    }
);


// =======================================================
// Escape HTML
// =======================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


// =======================================================
// PWA Install
// =======================================================

let deferredPrompt = null;


window.addEventListener(
    "beforeinstallprompt",
    function (event) {

        event.preventDefault();

        deferredPrompt = event;


        if (installBtn) {

            installBtn.hidden = false;

        }

    }
);


if (installBtn) {

    installBtn.addEventListener(
        "click",
        async function () {

            if (!deferredPrompt) {

                showAlert(
                    "📲 এই মুহূর্তে Install option পাওয়া যাচ্ছে না।\n\nChrome Browser-এর menu থেকে 'Install app' দেখুন।"
                );

                return;

            }


            deferredPrompt.prompt();


            const result =
                await deferredPrompt.userChoice;


            console.log(
                "PWA Install:",
                result.outcome
            );


            deferredPrompt = null;

            installBtn.hidden = true;

        }
    );

}


window.addEventListener(
    "appinstalled",
    function () {

        console.log(
            "✅ PWA Installed"
        );


        deferredPrompt = null;


        if (installBtn) {
            installBtn.hidden = true;
        }

    }
);


// =======================================================
// Global Functions
// =======================================================
// এগুলো রাখা হয়েছে যাতে HTML-এর onclick থাকলেও কাজ করে।

window.viewMember = viewMember;
window.closeModal = closeModal;
window.approveMember = approveMember;
window.rejectMember = rejectMember;
window.editMember = editMember;
window.deleteMember = deleteMember;
window.logout = logout;
window.searchMember = searchMember;


// =======================================================
// Initialize Dashboard
// =======================================================

if (tableBody) {

    loadMembers();

}
