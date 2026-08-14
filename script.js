"use strict";

import { supabase } from "./supabase.js";

/* =========================================================
   TELECOM GROUP CHATTOGRAM CITY
   Complete script.js
   ========================================================= */

const form = document.getElementById("memberForm");
const table = document.querySelector("#memberTable");
const businessSelect = document.getElementById("business");
const businessCount = document.getElementById("businessCount");

let deferredPrompt = null;

/* =========================================================
   BASIC HELPERS
   ========================================================= */

function showAlert(message) {
    alert(message);
}

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

/* =========================================================
   BUSINESS MULTI SELECT - MAX 10
   ========================================================= */

function updateBusinessCount() {
    if (!businessSelect) return;

    const selected =
        Array.from(businessSelect.selectedOptions);

    if (businessCount) {
        businessCount.textContent =
            `নির্বাচিত: ${selected.length} / 10`;
    }
}

if (businessSelect) {

    businessSelect.addEventListener(
        "change",
        () => {

            const selected =
                Array.from(
                    businessSelect.selectedOptions
                );

            if (selected.length > 10) {

                selected[selected.length - 1]
                    .selected = false;

                showAlert(
                    "⚠️ সর্বোচ্চ ১০টি ব্যবসার ধরন নির্বাচন করা যাবে।"
                );
            }

            updateBusinessCount();
        }
    );

    updateBusinessCount();
}

/* =========================================================
   FILE UPLOAD
   ========================================================= */

async function uploadFile(file, bucket) {

    if (!file) return "";

    let uploadData = file;
    let fileName = file.name;

    // IMAGE COMPRESSION
    if (file.type.startsWith("image/")) {

        const image = new Image();

        const imageURL =
            URL.createObjectURL(file);

        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
            image.src = imageURL;
        });

        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;

        let width = image.width;
        let height = image.height;

        if (
            width > MAX_WIDTH ||
            height > MAX_HEIGHT
        ) {
            const ratio = Math.min(
                MAX_WIDTH / width,
                MAX_HEIGHT / height
            );

            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }

        const canvas =
            document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx =
            canvas.getContext("2d");

        ctx.drawImage(
            image,
            0,
            0,
            width,
            height
        );

        uploadData =
            await new Promise(resolve => {
                canvas.toBlob(
                    blob => resolve(blob),
                    "image/jpeg",
                    0.72
                );
            });

        URL.revokeObjectURL(imageURL);

        fileName =
            file.name.replace(
                /\.[^/.]+$/,
                ""
            ) + ".jpg";
    }

    const safeName =
        fileName.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );

    const finalFileName =
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
                finalFileName,
                uploadData,
                {
                    upsert: false,
                    contentType:
                        uploadData.type ||
                        file.type
                }
            );

    if (error) {
        throw error;
    }

    const { data } =
        supabase.storage
            .from(bucket)
            .getPublicUrl(
                finalFileName
            );

    return data.publicUrl;
}
/* =========================================================
   DUPLICATE CHECK
   ========================================================= */

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

    return data && data.length > 0;
}

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

    return data && data.length > 0;
}

/* =========================================================
   MEMBER REGISTRATION
   ========================================================= */

async function registerMember() {

    try {

        startLoading();

        const name =
            document.getElementById("name")
                ?.value.trim() || "";

        const mobile =
            document.getElementById("mobile")
                ?.value.trim() || "";

        const whatsapp =
            document.getElementById("whatsapp")
                ?.value.trim() || "";

        const email =
            document.getElementById("email")
                ?.value.trim() || "";

        const dob =
            document.getElementById("dob")
                ?.value || "";

        const shop =
            document.getElementById("shop")
                ?.value.trim() || "";

        const address =
            document.getElementById("address")
                ?.value.trim() || "";

        const map =
            document.getElementById("map")
                ?.value.trim() || "";

        const nid =
            document.getElementById("nid")
                ?.value.trim() || "";

        const agree =
            document.getElementById("agree")
                ?.checked || false;

        const photo =
            document.getElementById("photo")
                ?.files?.[0];

        const shopImage =
            document.getElementById("shopImage")
                ?.files?.[0];

        const tradeLicense =
            document.getElementById("tradeLicense")
                ?.files?.[0];

        const nidImage =
            document.getElementById("nidImage")
                ?.files?.[0];

        const selectedBusinessTypes =
            businessSelect
                ? Array.from(
                    businessSelect.selectedOptions
                ).map(
                    option => option.value
                )
                : [];

        /* Validation */

        if (!name) {
            showAlert("পূর্ণ নাম লিখুন");
            return;
        }

        if (!/^[0-9]{11}$/.test(mobile)) {
            showAlert(
                "সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন"
            );
            return;
        }

        if (!shop) {
            showAlert("দোকানের নাম লিখুন");
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

   if (!/^(?:[0-9]{10}|[0-9]{13}|[0-9]{17})$/.test(nid)) {
    showAlert(
        "১০, ১৩ অথবা ১৭ সংখ্যার NID লিখুন"
    );
    return;
} 
if (!agree) {
    showAlert(
        "ঘোষণাপত্রে টিক দিন"
    );
    return;
}

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

        /* Upload */

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

        const memberId =
            "TG-" + Date.now();

        const business =
            selectedBusinessTypes.join(", ");

        /* Database */

        const { error } =
            await supabase
                .from("members")
                .insert([
                    {
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
                    }
                ]);

        if (error) {
            throw error;
        }

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
            error?.message ||
            "❌ আবেদন জমা দিতে সমস্যা হয়েছে"
        );

    } finally {

        stopLoading();

    }
}

/* =========================================================
   FORM SUBMIT
   ========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            registerMember();

        }
    );
}

/* =========================================================
   ADMIN - LOAD MEMBERS
   ====।==================================================== */

async function loadMembers() {

    if (!table) return;

    try {

        const tbody =
            document.getElementById(
                "memberTableBody"
            );

        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9"
                        style="text-align:center;">
                        ⏳ সদস্য তথ্য লোড হচ্ছে...
                    </td>
                </tr>
            `;
        }

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

        if (!tbody) return;

        tbody.innerHTML = "";

        let total = 0;
        let pending = 0;
        let approved = 0;
        let rejected = 0;

        if (!members || members.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="9"
                        style="text-align:center;">
                        কোনো সদস্য পাওয়া যায়নি।
                    </td>
                </tr>
            `;

        } else {

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

                const row =
                    document.createElement("tr");

                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            member.memberid || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            member.name || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            member.mobile || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            member.business || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            member.status || "-"
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="member-action"
                            data-action="view"
                            data-id="${member.id}">
                            👁️
                        </button>

          async function loadMembers() {

    if (!table) return;

    try {

        const tbody =
            document.getElementById(
                "memberTableBody"
            );

        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8"
                        style="text-align:center;">
                        ⏳ সদস্য তথ্য লোড হচ্ছে...
                    </td>
                </tr>
            `;
        }

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

        if (!tbody) return;

        tbody.innerHTML = "";

        let total = 0;
        let pending = 0;
        let approved = 0;
        let rejected = 0;

        if (!members || members.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="8"
                        style="text-align:center;">
                        কোনো সদস্য পাওয়া যায়নি।
                    </td>
                </tr>
            `;

        } else {

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
/* =========================================================
   ADMIN - LOAD MEMBERS
   ========================================================= */

async function loadMembers() {

    if (!table) return;

    try {

        const tbody =
            document.getElementById(
                "memberTableBody"
            );

        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align:center;">
                    ⏳ সদস্য তথ্য লোড হচ্ছে...
                </td>
            </tr>
        `;

        const { data: members, error } =
            await supabase
                .from("members")
                .select("*")
                .order("id", {
                    ascending: false
                });

        if (error) {
            throw error;
        }

        tbody.innerHTML = "";

        let total = 0;
        let pending = 0;
        let approved = 0;
        let rejected = 0;

        if (!members || members.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="8"
                        style="text-align:center;">
                        কোনো সদস্য পাওয়া যায়নি।
                    </td>
                </tr>
            `;

        } else {

            members.forEach(member => {

                total++;

                if (member.status === "Pending") {
                    pending++;
                }

                if (member.status === "Approved") {
                    approved++;
                }
/* =========================================================
   ADMIN - LOAD MEMBERS
   ========================================================= */

async function loadMembers() {

    const table = document.getElementById("memberTable");
    const tbody = document.getElementById("memberTableBody");

    if (!table || !tbody) {
        console.log("Admin member table not found.");
        return;
    }

    try {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    ⏳ সদস্য তথ্য লোড হচ্ছে...
                </td>
            </tr>
        `;

        const { data: members, error } = await supabase
            .from("members")
            .select("*")
            .order("id", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        tbody.innerHTML = "";

        let total = 0;
        let pending = 0;
        let approved = 0;
        let rejected = 0;

        if (!members || members.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        কোনো সদস্য পাওয়া যায়নি।
                    </td>
                </tr>
            `;

            updateStats(
                0,
                0,
                0,
                0
            );

            return;
        }

        members.forEach(member => {

            total++;

            const status =
                String(member.status || "")
                    .trim()
                    .toLowerCase();

            if (status === "pending") {
                pending++;
            }

            if (status === "approved") {
                approved++;
            }

            if (status === "rejected") {
                rejected++;
            }

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        member.memberid || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        member.name || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        member.mobile || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        member.whatsapp || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        member.shop || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        member.address || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        member.status || "-"
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="member-action"
                        data-action="view"
                        data-id="${member.id}">
                        👁️
                    </button>

                    <button
                        type="button"
                        class="member-action"
                        data-action="approve"
                        data-id="${member.id}">
                        ✅
                    </button>

                    <button
                        type="button"
                        class="member-action"
                        data-action="reject"
                        data-id="${member.id}">
                        ❌
                    </button>

                    <button
                        type="button"
                        class="member-action"
                        data-action="edit"
                        data-id="${member.id}">
                        ✏️
                    </button>

                    <button
                        type="button"
                        class="member-action"
                        data-action="delete"
                        data-id="${member.id}">
                        🗑️
                    </button>

                </td>
            `;

            tbody.appendChild(row);
        });

        updateStats(
            total,
            pending,
            approved,
            rejected
        );

        console.log(
            "Members loaded:",
            members.length
        );

    } catch (error) {

        console.error(
            "Load Members Error:",
            error
        );

        tbody.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align:center;color:red;">
                    ❌ সদস্য তথ্য লোড করা যায়নি।
                    <br>
                    ${escapeHTML(
                        error?.message ||
                        "Unknown error"
                    )}
                </td>
            </tr>
        `;
    }
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   UPDATE STATS
   ========================================================= */

function updateStats(
    total,
    pending,
    approved,
    rejected
) {

    const cards =
        document.querySelectorAll(
            ".stat-card p b"
        );

    if (cards.length >= 4) {

        cards[0].textContent = total;
        cards[1].textContent = pending;
        cards[2].textContent = approved;
        cards[3].textContent = rejected;
    }
}
/* =========================================================
   VIEW MEMBER
   ========================================================= */

async function viewMember(id) {

    try {

        const { data, error } =
            await supabase
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
                ${escapeHTML(
                    data.memberid || "-"
                )}
            </p>

            <p>
                <b>নাম:</b>
                ${escapeHTML(
                    data.name || "-"
                )}
            </p>

            <p>
                <b>মোবাইল:</b>
                ${escapeHTML(
                    data.mobile || "-"
                )}
            </p>

            <p>
                <b>WhatsApp:</b>
                ${escapeHTML(
                    data.whatsapp || "-"
                )}
            </p>

            <p>
                <b>Email:</b>
                ${escapeHTML(
                    data.email || "-"
                )}
            </p>

            <p>
                <b>জন্ম তারিখ:</b>
                ${escapeHTML(
                    data.dob || "-"
                )}
            </p>

            <p>
                <b>দোকানের নাম:</b>
                ${escapeHTML(
                    data.shop || "-"
                )}
            </p>

            <p>
                <b>ঠিকানা:</b>
                ${escapeHTML(
                    data.address || "-"
                )}
            </p>

            <p>
                <b>Google Maps:</b>
                ${
                    data.map
                    ? `
                        <a
                            href="${escapeHTML(data.map)}"
                            target="_blank"
                            rel="noopener">
                            📍 Maps
                        </a>
                    `
                    : "-"
                }
            </p>

            <p>
                <b>ব্যবসা:</b>
                ${escapeHTML(
                    data.business || "-"
                )}
            </p>

            <p>
                <b>NID:</b>
                ${escapeHTML(
                    data.nid || "-"
                )}
            </p>

            <p>
                <b>স্ট্যাটাস:</b>
                ${escapeHTML(
                    data.status || "-"
                )}
            </p>

            ${
                data.photo
                ? `
                    <p>
                        <b>সদস্যের ছবি:</b><br>
                        <img
                            src="${escapeHTML(data.photo)}"
                            width="150">
                    </p>
                `
                : ""
            }

            ${
                data.shopimage
                ? `
                    <p>
                        <b>দোকানের ছবি:</b><br>
                        <img
                            src="${escapeHTML(data.shopimage)}"
                            width="150">
                    </p>
                `
                : ""
            }

            ${
                data.nidimage
                ? `
                    <p>
                        <b>NID:</b><br>
                        <img
                            src="${escapeHTML(data.nidimage)}"
                            width="150">
                    </p>
                `
                : ""
            }

            ${
                data.tradelicense
                ? `
                    <p>
                        <a
                            href="${escapeHTML(data.tradelicense)}"
                            target="_blank"
                            rel="noopener">
                            📄 Trade License দেখুন
                        </a>
                    </p>
                `
                : ""
            }

        `;

        modal.style.display = "block";

    } catch (error) {

        console.error(
            "View Member Error:",
            error
        );

        showAlert(
            error?.message ||
            "সদস্যের তথ্য দেখা যায়নি।"
        );
    }
}

/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal() {

    const modal =
        document.getElementById(
            "memberModal"
        );

    if (modal) {
        modal.style.display = "none";
    }
}

/* =========================================================
   APPROVE
   ========================================================= */

async function approveMember(id) {

    if (
        !confirm(
            "এই সদস্যকে Approved করতে চান?"
        )
    ) {
        return;
    }

    try {

        const { error } =
            await supabase
                .from("members")
                .update({
                    status: "Approved"
                })
                .eq("id", id);

        if (error) {
            throw error;
        }

        showAlert(
            "✅ Member Approved"
        );

        await loadMembers();

    } catch (error) {

        console.error(
            "Approve Error:",
            error
        );

        showAlert(
            error?.message ||
            "Approve করা যায়নি।"
        );
    }
}

/* =========================================================
   REJECT
   ========================================================= */

async function rejectMember(id) {

    if (
        !confirm(
            "এই সদস্যকে Rejected করতে চান?"
        )
    ) {
        return;
    }

    try {

        const { error } =
            await supabase
                .from("members")
                .update({
                    status: "Rejected"
                })
                .eq("id", id);

        if (error) {
            throw error;
        }

        showAlert(
            "❌ Member Rejected"
        );

        await loadMembers();

    } catch (error) {

        console.error(
            "Reject Error:",
            error
        );

        showAlert(
            error?.message ||
            "Reject করা যায়নি।"
        );
    }
}

/* =========================================================
   EDIT
   ========================================================= */

async function editMember(id) {

    try {

        const { data, error } =
            await supabase
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
                    name: name.trim(),
                    mobile: mobile.trim(),
                    shop: shop.trim(),
                    address: address.trim(),
                    business: business.trim()
                })
                .eq("id", id);

        if (updateError) {
            throw updateError;
        }

        showAlert(
            "✅ তথ্য সফলভাবে আপডেট হয়েছে"
        );

        await loadMembers();

    } catch (error) {

        console.error(
            "Edit Error:",
            error
        );

        showAlert(
            error?.message ||
            "তথ্য আপডেট করা যায়নি।"
        );
    }
}

/* =========================================================
   DELETE
   ========================================================= */

async function deleteMember(id) {

    if (
        !confirm(
            "আপনি কি এই সদস্যটি Delete করতে চান?"
        )
    ) {
        return;
    }

    try {

        const { error } =
            await supabase
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

        console.error(
            "Delete Error:",
            error
        );

        showAlert(
            error?.message ||
            "Member Delete করা যায়নি।"
        );
    }
}

/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

    try {

        const { error } =
            await supabase.auth.signOut();

        if (error) {
            console.error(
                "Logout Error:",
                error
            );
        }

    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    } finally {

        localStorage.removeItem("admin");
        sessionStorage.clear();

        window.location.replace(
            "./login.html"
        );

    }

}

/* =========================================================
   SEARCH
   ========================================================= */

function searchMember() {

    const input =
        document.getElementById(
            "search"
        );

    const tbody =
        document.getElementById(
            "memberTableBody"
        );

    if (!input || !tbody) return;

    const filter =
        input.value
            .toLowerCase()
            .trim();

    const rows =
        tbody.querySelectorAll("tr");

    rows.forEach(row => {

        row.style.display =
            row.innerText
                .toLowerCase()
                .includes(filter)
                ? ""
                : "none";

    });
}

/* =========================================================
   IMPORTANT:
   ADMIN BUTTON EVENT DELEGATION
   ========================================================= */

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                ".member-action"
            );

        if (button) {

            const action =
                button.dataset.action;

            const id =
                button.dataset.id;

            if (!id) return;

            button.disabled = true;

            try {

                if (action === "view") {
                    await viewMember(id);
                }

                else if (
                    action === "approve"
                ) {
                    await approveMember(id);
                }

                else if (
                    action === "reject"
                ) {
                    await rejectMember(id);
                }

                else if (
                    action === "edit"
                ) {
                    await editMember(id);
                }

                else if (
                    action === "delete"
                ) {
                    await deleteMember(id);
                }

            } finally {

                button.disabled = false;

            }

            return;
        }

        /* Logout */

        const logoutButton =
            event.target.closest(
                '[data-action="logout"]'
            );

        if (logoutButton) {

            logout();

        }
    }
);

/* =========================================================
   SEARCH EVENT
   ========================================================= */

const searchInput =
    document.getElementById("search");

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchMember
    );
}

/* =========================================================
   MODAL CLOSE
   ========================================================= */

const closeButton =
    document.querySelector(
        ".close"
    );

if (closeButton) {

    closeButton.addEventListener(
        "click",
        closeModal
    );
}

window.addEventListener(
    "click",
    event => {

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

/* =========================================================
   PWA INSTALL
   ========================================================= */

window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredPrompt = event;

        const installBtn =
            document.getElementById(
                "installBtn"
            );

        if (installBtn) {
            installBtn.hidden = false;
        }
    }
);

const installBtn =
    document.getElementById(
        "installBtn"
    );

if (installBtn) {

    installBtn.addEventListener(
        "click",
        async () => {

            if (!deferredPrompt) {

                showAlert(
                    "এই মুহূর্তে Install option পাওয়া যাচ্ছে না।"
                );

                return;
            }

            deferredPrompt.prompt();

            const choice =
                await deferredPrompt.userChoice;

            console.log(
                "Install:",
                choice.outcome
            );

            deferredPrompt = null;

            installBtn.hidden = true;
        }
    );
}

window.addEventListener(
    "appinstalled",
    () => {

        const installBtn =
            document.getElementById(
                "installBtn"
            );

        if (installBtn) {
            installBtn.hidden = true;
        }
    }
);

/* =========================================================
   ADMIN PAGE BUTTON COMPATIBILITY
   ========================================================= */

/*
   admin.html-এর পুরোনো inline onclick
   থাকলেও যেন কাজ করে।
*/

window.viewMember = viewMember;
window.closeModal = closeModal;
window.approveMember = approveMember;
window.rejectMember = rejectMember;
window.editMember = editMember;
window.deleteMember = deleteMember;
window.logout = logout;
window.searchMember = searchMember;

/* =========================================================
   INITIALIZE
   ========================================================= */

if (table) {
    loadMembers();
}
