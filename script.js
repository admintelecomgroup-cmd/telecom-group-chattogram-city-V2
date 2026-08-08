// =======================================================
// Telecom Group Chattogram City
// script.js
// Supabase + Admin Dashboard + PWA
// =======================================================

import { supabase } from "./supabase.js";

// =======================================================
// DOM
// =======================================================

const form = document.getElementById("memberForm");
const table = document.querySelector("table");
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

    if (!btn) return;

    btn.disabled = true;
    btn.textContent = "⏳ অপেক্ষা করুন...";

}

function stopLoading() {

    const btn = document.getElementById("submitBtn");

    if (!btn) return;

    btn.disabled = false;
    btn.textContent = "আবেদন জমা দিন";

}

// =======================================================
// File Upload
// =======================================================

async function uploadFile(file, bucket) {

    if (!file) {
        return "";
    }

    const safeName =
        file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const fileName =
        Date.now() + "_" + safeName;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            upsert: false
        });

    if (error) {
        throw error;
    }

    const { data } =
        supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

    return data.publicUrl || "";

}

// =======================================================
// Duplicate Mobile
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

    return data && data.length > 0;

}

// =======================================================
// Duplicate NID
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

    return data && data.length > 0;

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
            document.getElementById("dob")?.value || "";

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

        if (!/^01[0-9]{9}$/.test(mobile)) {
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

        if (!/^[0-9]{17}$/.test(nid)) {
            showAlert("১৭ সংখ্যার NID লিখুন");
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
        // Upload
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
            "TG-" + Date.now();

        // =================================================
        // Database Insert
        // =================================================

        const { error } =
            await supabase
                .from("members")
                .insert([{

                    memberid: memberId,

                    name: name,

                    mobile: mobile,

                    whatsapp: whatsapp,

                    email: email,

                    dob: dob || null,

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

                }]);

        if (error) {
            throw error;
        }

        showAlert(
            "✅ আবেদন সফলভাবে জমা হয়েছে"
        );

        if (form) {
            form.reset();
        }

    } catch (error) {

        console.error(
            "Registration Error:",
            error
        );

        showAlert(
            "❌ সমস্যা হয়েছে\n\n" +
            (error?.message || "Unknown error")
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
// Admin Session Check
// =======================================================

async function checkAdminLogin() {

    if (!table) {
        return;
    }

    try {

        const { data, error } =
            await supabase.auth.getSession();

        if (error) {
            throw error;
        }

        if (!data?.session) {

            window.location.replace(
                "./login.html"
            );

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            "Admin Session Error:",
            error
        );

        window.location.replace(
            "./login.html"
        );

        return false;

    }

}

// =======================================================
// Load Members
// =======================================================

async function loadMembers() {

    if (!table) {
        return;
    }

    const loggedIn =
        await checkAdminLogin();

    if (!loggedIn) {
        return;
    }

    try {

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Member ID</th>
                    <th>নাম</th>
                    <th>মোবাইল</th>
                    <th>ব্যবসা</th>
                    <th>স্ট্যাটাস</th>
                    <th>অ্যাকশন</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody =
            table.querySelector("tbody");

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

        let total = 0;
        let pending = 0;
        let approved = 0;
        let rejected = 0;

        if (!members || members.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        কোনো সদস্য পাওয়া যায়নি
                    </td>
                </tr>
            `;

        } else {

            members.forEach(
                (member) => {

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
                                    type="button"
                                    onclick="viewMember(${member.id})">
                                    👁️
                                </button>

                                <button
                                    type="button"
                                    onclick="approveMember(${member.id})">
                                    ✅
                                </button>

                                <button
                                    type="button"
                                    onclick="rejectMember(${member.id})">
                                    ❌
                                </button>

                                <button
                                    type="button"
                                    onclick="editMember(${member.id})">
                                    ✏️
                                </button>

                                <button
                                    type="button"
                                    onclick="deleteMember(${member.id})">
                                    🗑️
                                </button>

                            </td>

                        </tr>

                    `;

                }
            );

        }

        updateStatistics(
            total,
            pending,
            approved,
            rejected
        );

    } catch (error) {

        console.error(
            "Load Members Error:",
            error
        );

        showAlert(
            "❌ সদস্য তালিকা লোড হয়নি\n\n" +
            error.message
        );

    }

}

// =======================================================
// Update Statistics
// =======================================================

function updateStatistics(
    total,
    pending,
    approved,
    rejected
) {

    const statCards =
        document.querySelectorAll(
            ".stat-card"
        );

    if (statCards.length >= 4) {

        const totalElement =
            statCards[0].querySelector("b");

        const pendingElement =
            statCards[1].querySelector("b");

        const approvedElement =
            statCards[2].querySelector("b");

        const rejectedElement =
            statCards[3].querySelector("b");

        if (totalElement) {
            totalElement.textContent =
                total;
        }

        if (pendingElement) {
            pendingElement.textContent =
                pending;
        }

        if (approvedElement) {
            approvedElement.textContent =
                approved;
        }

        if (rejectedElement) {
            rejectedElement.textContent =
                rejected;
        }

        return;
    }

    // Fallback

    const stats =
        document.querySelectorAll("b");

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
                ${data.memberid || "-"}
            </p>

            <p>
                <b>নাম:</b>
                ${data.name || "-"}
            </p>

            <p>
                <b>মোবাইল:</b>
                ${data.mobile || "-"}
            </p>

            <p>
                <b>WhatsApp:</b>
                ${data.whatsapp || "-"}
            </p>

            <p>
                <b>Email:</b>
                ${data.email || "-"}
            </p>

            <p>
                <b>জন্ম তারিখ:</b>
                ${data.dob || "-"}
            </p>

            <p>
                <b>দোকানের নাম:</b>
                ${data.shop || "-"}
            </p>

            <p>
                <b>ঠিকানা:</b>
                ${data.address || "-"}
            </p>

            <p>
                <b>Google Maps:</b>
                ${
                    data.map
                    ? `<a href="${data.map}" target="_blank">
                        📍 Map খুলুন
                       </a>`
                    : "-"
                }
            </p>

            <p>
                <b>ব্যবসা:</b>
                ${data.business || "-"}
            </p>

            <p>
                <b>NID:</b>
                ${data.nid || "-"}
            </p>

            <p>
                <b>স্ট্যাটাস:</b>
                ${data.status || "-"}
            </p>

            ${
                data.photo
                ? `
                    <p><b>সদস্যের ছবি:</b></p>
                    <img
                        src="${data.photo}"
                        width="150"
                        alt="Member Photo">
                  `
                : ""
            }

            ${
                data.shopimage
                ? `
                    <p><b>দোকানের ছবি:</b></p>
                    <img
                        src="${data.shopimage}"
                        width="150"
                        alt="Shop Photo">
                  `
                : ""
            }

            ${
                data.nidimage
                ? `
                    <p><b>NID ছবি:</b></p>
                    <img
                        src="${data.nidimage}"
                        width="150"
                        alt="NID">
                  `
                : ""
            }

            ${
                data.tradelicense
                ? `
                    <p>
                        <a
                            href="${data.tradelicense}"
                            target="_blank">
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
            "❌ তথ্য দেখা যায়নি\n\n" +
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

        console.error(error);

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
