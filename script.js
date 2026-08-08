"use strict";

// =======================================================
// Telecom Group Chattogram City
// script.js
// Supabase Version
// =======================================================

import { supabase } from "./supabase.js";


// =======================================================
// Global Variables
// =======================================================

const form = document.getElementById("memberForm");
const table = document.querySelector("table");


// =======================================================
// Alert
// =======================================================

function showAlert(message) {

    alert(message);

}


// =======================================================
// Loading Button
// =======================================================

function startLoading() {

    const btn =
        document.getElementById("submitBtn");

    if (btn) {

        btn.disabled = true;

        btn.innerHTML =
            "⏳ অপেক্ষা করুন...";

    }

}


function stopLoading() {

    const btn =
        document.getElementById("submitBtn");

    if (btn) {

        btn.disabled = false;

        btn.innerHTML =
            "আবেদন জমা দিন";

    }

}


// =======================================================
// Upload File
// =======================================================

async function uploadFile(file, bucket) {

    if (!file) return "";

    const safeName =
        file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );

    const fileName =
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8) +
        "_" +
        safeName;


    const { error } =
        await supabase.storage
            .from(bucket)
            .upload(
                fileName,
                file,
                {
                    upsert: false
                }
            );


    if (error) {

        throw error;

    }


    const { data } =
        supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);


    return data.publicUrl;

}


// =======================================================
// Duplicate Mobile Check
// =======================================================

async function mobileExists(mobile) {

    const { data, error } =
        await supabase
            .from("members")
            .select("id")
            .eq("mobile", mobile)
            .limit(1);


    if (error) {

        throw error;

    }


    return data &&
           data.length > 0;

}


// =======================================================
// Duplicate NID Check
// =======================================================

async function nidExists(nid) {

    const { data, error } =
        await supabase
            .from("members")
            .select("id")
            .eq("nid", nid)
            .limit(1);


    if (error) {

        throw error;

    }


    return data &&
           data.length > 0;

}


// =======================================================
// Business Multi Select
// Maximum 10
// =======================================================

const businessSelect =
    document.getElementById("business");

const businessCount =
    document.getElementById("businessCount");


function updateBusinessCount() {

    if (!businessSelect) return;


    const selected =
        Array.from(
            businessSelect.selectedOptions
        );


    if (businessCount) {

        businessCount.textContent =
            `নির্বাচিত: ${selected.length} / 10`;

    }

}


if (businessSelect) {

    businessSelect.addEventListener(
        "change",
        function () {

            const selected =
                Array.from(
                    businessSelect.selectedOptions
                );


            /*
             * Maximum 10 selections
             */

            if (selected.length > 10) {

                const lastSelected =
                    selected[selected.length - 1];

                lastSelected.selected = false;

                showAlert(
                    "⚠️ সর্বোচ্চ ১০টি ব্যবসার ধরন নির্বাচন করা যাবে।"
                );

            }


            updateBusinessCount();

        }
    );


    updateBusinessCount();

}


// =======================================================
// Register Member
// =======================================================

async function registerMember() {

    try {

        startLoading();


        // =================================================
        // Personal Information
        // =================================================

        const name =
            document
                .getElementById("name")
                .value
                .trim();


        const mobile =
            document
                .getElementById("mobile")
                .value
                .trim();


        const whatsapp =
            document
                .getElementById("whatsapp")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const dob =
            document
                .getElementById("dob")
                .value;


        // =================================================
        // Business Information
        // =================================================

        const shop =
            document
                .getElementById("shop")
                .value
                .trim();


        const address =
            document
                .getElementById("address")
                .value
                .trim();


        const map =
            document
                .getElementById("map")
                .value
                .trim();


        // =================================================
        // Multiple Business Types
        // =================================================

        const selectedBusinessTypes =
            businessSelect
                ? Array.from(
                    businessSelect.selectedOptions
                ).map(
                    option => option.value
                )
                : [];


        // =================================================
        // Documents
        // =================================================

        const nid =
            document
                .getElementById("nid")
                .value
                .trim();


        const agree =
            document
                .getElementById("agree")
                .checked;


        const photo =
            document
                .getElementById("photo")
                .files[0];


        const shopImage =
            document
                .getElementById("shopImage")
                .files[0];


        const tradeLicense =
            document
                .getElementById("tradeLicense")
                .files[0];


        const nidImage =
            document
                .getElementById("nidImage")
                .files[0];


        // =================================================
        // Validation
        // =================================================

        if (!name) {

            showAlert(
                "পূর্ণ নাম লিখুন"
            );

            return;

        }


        if (!/^[0-9]{11}$/.test(mobile)) {

            showAlert(
                "সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন"
            );

            return;

        }


        if (!shop) {

            showAlert(
                "দোকানের নাম লিখুন"
            );

            return;

        }


        if (
            selectedBusinessTypes.length < 1
        ) {

            showAlert(
                "কমপক্ষে ১টি ব্যবসার ধরন নির্বাচন করুন"
            );

            return;

        }


        if (
            selectedBusinessTypes.length > 10
        ) {

            showAlert(
                "সর্বোচ্চ ১০টি ব্যবসার ধরন নির্বাচন করা যাবে"
            );

            return;

        }


        if (!/^[0-9]{17}$/.test(nid)) {

            showAlert(
                "১৭ সংখ্যার NID লিখুন"
            );

            return;

        }


        if (!agree) {

            showAlert(
                "ঘোষণাপত্রে টিক দিন"
            );

            return;

        }


        // =================================================
        // Duplicate Check
        // =================================================

        if (
            await mobileExists(mobile)
        ) {

            showAlert(
                "এই মোবাইল নম্বর আগে থেকেই নিবন্ধিত"
            );

            return;

        }


        if (
            await nidExists(nid)
        ) {

            showAlert(
                "এই NID আগে থেকেই নিবন্ধিত"
            );

            return;

        }


        // =================================================
        // Upload Files
        // =================================================

        const photoURL =
            await uploadFile(
                photo,
                "member-photo"
            );


        const shopImageURL =
            await uploadFile(
                shopImage,
                "shop-photo"
            );


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
        // Business Types
        //
        // Stored as:
        // মোবাইল শপ, বিকাশ এজেন্ট, নগদ এজেন্ট
        // =================================================

        const business =
            selectedBusinessTypes.join(", ");


        // =================================================
        // Save Database
        // =================================================

        const { error } =
            await supabase
                .from("members")
                .insert([
                    {

                        memberid:
                            memberId,

                        name:
                            name,

                        mobile:
                            mobile,

                        whatsapp:
                            whatsapp,

                        email:
                            email,

                        dob:
                            dob,

                        shop:
                            shop,

                        address:
                            address,

                        map:
                            map,

                        business:
                            business,

                        nid:
                            nid,

                        photo:
                            photoURL,

                        shopimage:
                            shopImageURL,

                        tradelicense:
                            tradeLicenseURL,

                        nidimage:
                            nidImageURL,

                        status:
                            "Pending"

                    }
                ]);


        if (error) {

            throw error;

        }


        // =================================================
        // Success
        // =================================================

        showAlert(
            "✅ আবেদন সফলভাবে জমা হয়েছে"
        );


        if (form) {

            form.reset();

        }


        updateBusinessCount();


    } catch (error) {

        console.error(
            "Registration Error:",
            error
        );


        showAlert(
            error.message ||
            "❌ আবেদন জমা দিতে সমস্যা হয়েছে"
        );


    } finally {

        stopLoading();

    }

}


// =======================================================
// Submit Event
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

    if (!table) return;


    try {

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Member ID</th>
                    <th>নাম</th>
                    <th>মোবাইল</th>
                    <th>ব্যবসা</th>
                    <th>স্ট্যাটাস</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;


        const { data: members, error } =
            await supabase
                .from("members")
                .select("*")
                .order(
                    "id",
                    {
                        ascending: false
                    }
                );


        if (error) {

            throw error;

        }


        const tbody =
            table.querySelector("tbody");


        let total = 0;
        let pending = 0;
        let approved = 0;
        let rejected = 0;


        members.forEach(member => {

            total++;


            if (
                member.status === "Pending"
            ) {

                pending++;

            }


            if (
                member.status === "Approved"
            ) {

                approved++;

            }


            if (
                member.status === "Rejected"
            ) {

                rejected++;

            }


            tbody.innerHTML += `
                <tr>

                    <td>
                        ${member.memberid || "-"}
                    </td>

                    <td>
                        ${member.name || "-"}
                    </td>

                    <td>
                        ${member.mobile || "-"}
                    </td>

                    <td>
                        ${member.business || "-"}
                    </td>

                    <td>
                        ${member.status || "-"}
                    </td>

                    <td>

                        <button
                            onclick="viewMember(${member.id})">
                            👁️
                        </button>

                        <button
                            onclick="approveMember(${member.id})">
                            ✅
                        </button>

                        <button
                            onclick="rejectMember(${member.id})">
                            ❌
                        </button>

                        <button
                            onclick="editMember(${member.id})">
                            ✏️
                        </button>

                        <button
                            onclick="deleteMember(${member.id})">
                            🗑️
                        </button>

                    </td>

                </tr>
            `;

        });


        const stats =
            document.querySelectorAll("b");


        if (stats.length >= 4) {

            stats[0].textContent =
                total;

            stats[1].textContent =
                pending;

            stats[2].textContent =
                approved;

            stats[3].textContent =
                rejected;

        }


    } catch (error) {

        console.error(
            "Load Members Error:",
            error
        );

        showAlert(
            error.message
        );

    }

}


// =======================================================
// Auto Load Dashboard
// =======================================================

if (table) {

    loadMembers();

}


// =======================================================
// View Member
// =======================================================

async function viewMember(id) {

    const { data, error } =
        await supabase
            .from("members")
            .select("*")
            .eq("id", id)
            .single();


    if (error) {

        showAlert(
            error.message
        );

        return;

    }


    const details =
        document.getElementById(
            "memberDetails"
        );


    if (!details) return;


    details.innerHTML = `

        <p>
            <b>Member ID:</b>
            ${data.memberid || "-"}
        </p>

        <p>
            <b>নাম:</b>
            ${data.name || ""}
        </p>

        <p>
            <b>মোবাইল:</b>
            ${data.mobile || ""}
        </p>

        <p>
            <b>WhatsApp:</b>
            ${data.whatsapp || ""}
        </p>

        <p>
            <b>Email:</b>
            ${data.email || ""}
        </p>

        <p>
            <b>জন্ম তারিখ:</b>
            ${data.dob || ""}
        </p>

        <p>
            <b>দোকানের নাম:</b>
            ${data.shop || ""}
        </p>

        <p>
            <b>ঠিকানা:</b>
            ${data.address || ""}
        </p>

        <p>
            <b>ব্যবসা:</b>
            ${data.business || ""}
        </p>

        <p>
            <b>NID:</b>
            ${data.nid || ""}
        </p>

        <p>
            <b>স্ট্যাটাস:</b>
            ${data.status || ""}
        </p>

        ${
            data.photo
                ? `<img src="${data.photo}" width="120"><br>`
                : ""
        }

        ${
            data.shopimage
                ? `<img src="${data.shopimage}" width="120"><br>`
                : ""
        }

        ${
            data.nidimage
                ? `<img src="${data.nidimage}" width="120"><br>`
                : ""
        }

        ${
            data.tradelicense
                ? `<a
                    href="${data.tradelicense}"
                    target="_blank"
                    rel="noopener">
                    📄 Trade License
                   </a>`
                : ""
        }

    `;


    const modal =
        document.getElementById(
            "memberModal"
        );


    if (modal) {

        modal.style.display =
            "block";

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

        modal.style.display =
            "none";

    }

}


// =======================================================
// Approve Member
// =======================================================

async function approveMember(id) {

    const { error } =
        await supabase
            .from("members")
            .update({
                status: "Approved"
            })
            .eq("id", id);


    if (error) {

        showAlert(
            error.message
        );

        return;

    }


    loadMembers();

}


// =======================================================
// Reject Member
// =======================================================

async function rejectMember(id) {

    const { error } =
        await supabase
            .from("members")
            .update({
                status: "Rejected"
            })
            .eq("id", id);


    if (error) {

        showAlert(
            error.message
        );

        return;

    }


    loadMembers();

}


// =======================================================
// Edit Member
// =======================================================

async function editMember(id) {

    const { data, error } =
        await supabase
            .from("members")
            .select("*")
            .eq("id", id)
            .single();


    if (error) {

        showAlert(
            error.message
        );

        return;

    }


    const name =
        prompt(
            "নাম",
            data.name || ""
        );


    if (name === null) return;


    const mobile =
        prompt(
            "মোবাইল",
            data.mobile || ""
        );


    if (mobile === null) return;


    const shop =
        prompt(
            "দোকানের নাম",
            data.shop || ""
        );


    if (shop === null) return;


    const address =
        prompt(
            "ঠিকানা",
            data.address || ""
        );


    if (address === null) return;


    const business =
        prompt(
            "ব্যবসার ধরন",
            data.business || ""
        );


    if (business === null) return;


    const { error: updateError } =
        await supabase
            .from("members")
            .update({

                name:
                    name.trim(),

                mobile:
                    mobile.trim(),

                shop:
                    shop.trim(),

                address:
                    address.trim(),

                business:
                    business.trim()

            })
            .eq("id", id);


    if (updateError) {

        showAlert(
            updateError.message
        );

        return;

    }


    showAlert(
        "✅ তথ্য আপডেট হয়েছে"
    );


    loadMembers();

}


// =======================================================
// Delete Member
// =======================================================

async function deleteMember(id) {

    if (
        !confirm(
            "আপনি কি সদস্যটি Delete করতে চান?"
        )
    ) {

        return;

    }


    const { error } =
        await supabase
            .from("members")
            .delete()
            .eq("id", id);


    if (error) {

        showAlert(
            error.message
        );

        return;

    }


    showAlert(
        "✅ Member Deleted"
    );


    loadMembers();

}


// =======================================================
// Logout
// =======================================================

function logout() {

    localStorage.removeItem(
        "admin"
    );


    window.location.href =
        "login.html";

}


// =======================================================
// Search Member
// =======================================================

function searchMember() {

    const input =
        document.getElementById(
            "search"
        );


    if (!input || !table) return;


    const filter =
        input.value
            .toLowerCase();


    const rows =
        table.getElementsByTagName(
            "tr"
        );


    for (
        let i = 1;
        i < rows.length;
        i++
    ) {

        rows[i].style.display =
            rows[i]
                .innerText
                .toLowerCase()
                .includes(filter)
                ? ""
                : "none";

    }

}


// =======================================================
// Close Modal Outside Click
// =======================================================

window.onclick =
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

    };


// =======================================================
// Global Functions
// =======================================================

window.viewMember =
    viewMember;

window.closeModal =
    closeModal;

window.approveMember =
    approveMember;

window.rejectMember =
    rejectMember;

window.editMember =
    editMember;

window.deleteMember =
    deleteMember;

window.logout =
    logout;

window.searchMember =
    searchMember;


// =======================================================
// PWA Install Prompt
// =======================================================

let deferredPrompt;


const installBtn =
    document.getElementById(
        "installBtn"
    );


window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredPrompt =
            event;


        if (installBtn) {

            installBtn.hidden =
                false;

        }

    }
);


installBtn?.addEventListener(
    "click",
    async () => {

        if (!deferredPrompt) {

            return;

        }


        installBtn.hidden =
            true;


        deferredPrompt.prompt();


        const { outcome } =
            await deferredPrompt.userChoice;


        console.log(
            "Install:",
            outcome
        );


        deferredPrompt =
            null;

    }
);


window.addEventListener(
    "appinstalled",
    () => {

        console.log(
            "✅ App Installed"
        );


        if (installBtn) {

            installBtn.hidden =
                true;

        }

    }
);
