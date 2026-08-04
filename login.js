"use strict";

// =======================================================
// Telecom Group Chattogram City
// login.js (Supabase Version)
// =======================================================

import { supabase } from "./supabase.js";

/* ==========================================
   DOM Elements
========================================== */

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

/* ==========================================
   Helper Functions
========================================== */

function showMessage(message) {
    alert(message);
}

function startLoading() {

    if (!loginBtn) return;

    loginBtn.disabled = true;
    loginBtn.setAttribute("aria-busy", "true");
    loginBtn.textContent = "⏳ Logging in...";

}

function stopLoading() {

    if (!loginBtn) return;

    loginBtn.disabled = false;
    loginBtn.removeAttribute("aria-busy");
    loginBtn.textContent = "🔑 Login";

}

/* ==========================================
   Check Existing Session
========================================== */

async function checkLogin() {

    try {

        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {

            window.location.replace("admin.html");

        }

    } catch (error) {

        console.error("Session Check Error:", error);

    }

}

/* ==========================================
   Login Function
========================================== */

async function loginAdmin(email, password) {

    startLoading();

    try {

        const { error } = await supabase.auth.signInWithPassword({

            email,
            password

        });

        if (error) throw error;

        showMessage("✅ Login Successful");

        window.location.replace("admin.html");

    } catch (error) {

        console.error(error);

        switch (error.message) {

            case "Invalid login credentials":
                showMessage("❌ Email অথবা Password ভুল");
                break;

            case "Failed to fetch":
                showMessage("❌ Internet Connection পাওয়া যায়নি");
                break;

            default:
                showMessage(error.message || "❌ Login Failed");

        }

    } finally {

        stopLoading();

    }

}

/* ==========================================
   Form Submit
========================================== */

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        if (loginBtn?.disabled) return;

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();

        if (!email) {

            showMessage("⚠️ Email লিখুন");
            emailInput.focus();
            return;

        }

        if (!password) {

            showMessage("⚠️ Password লিখুন");
            passwordInput.focus();
            return;

        }

        await loginAdmin(email, password);

    });

}

/* ==========================================
   Initialize
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    emailInput?.focus();

    checkLogin();

});