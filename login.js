"use strict";

// =======================================================
// Telecom Group Chattogram City
// login.js
// Supabase Authentication
// =======================================================

import { supabase } from "./supabase.js";

// =======================================================
// DOM Elements
// =======================================================

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

// =======================================================
// Message
// =======================================================

function showMessage(message) {
    alert(message);
}

// =======================================================
// Loading
// =======================================================

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

// =======================================================
// Check Existing Session
// =======================================================

async function checkLogin() {

    try {

        const { data, error } =
            await supabase.auth.getSession();

        if (error) {
            console.error(
                "Session Error:",
                error
            );
            return;
        }

        if (data?.session) {

            window.location.replace(
                "./admin.html"
            );

        }

    } catch (error) {

        console.error(
            "Session Check Error:",
            error
        );

    }

}

// =======================================================
// Login Admin
// =======================================================

async function loginAdmin(email, password) {

    startLoading();

    try {

        const { data, error } =
            await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        if (!data?.session) {

            throw new Error(
                "Login session তৈরি হয়নি"
            );

        }

        showMessage(
            "✅ Login Successful"
        );

        window.location.replace(
            "./admin.html"
        );

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        const message =
            error?.message || "";

        if (
            message.includes(
                "Invalid login credentials"
            )
        ) {

            showMessage(
                "❌ Email অথবা Password ভুল"
            );

        } else if (
            message.includes(
                "Email not confirmed"
            )
        ) {

            showMessage(
                "❌ Email এখনও Confirm করা হয়নি"
            );

        } else if (
            message.includes(
                "Failed to fetch"
            )
        ) {

            showMessage(
                "❌ Internet Connection অথবা Supabase Connection সমস্যা"
            );

        } else {

            showMessage(
                "❌ Login Failed\n\n" +
                message
            );

        }

    } finally {

        stopLoading();

    }

}

// =======================================================
// Form Submit
// =======================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            if (
                loginBtn &&
                loginBtn.disabled
            ) {
                return;
            }

            const email =
                emailInput?.value
                    .trim()
                    .toLowerCase();

            const password =
                passwordInput?.value || "";

            // Email validation

            if (!email) {

                showMessage(
                    "⚠️ Admin Email লিখুন"
                );

                emailInput?.focus();

                return;

            }

            // Password validation

            if (!password) {

                showMessage(
                    "⚠️ Password লিখুন"
                );

                passwordInput?.focus();

                return;

            }

            await loginAdmin(
                email,
                password
            );

        }
    );

}

// =======================================================
// Auth State Listener
// =======================================================

supabase.auth.onAuthStateChange(
    (event, session) => {

        console.log(
            "Auth Event:",
            event
        );

        if (
            event === "SIGNED_IN" &&
            session
        ) {

            window.location.replace(
                "./admin.html"
            );

        }

    }
);

// =======================================================
// Initialize
// =======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        emailInput?.focus();

        checkLogin();

    }
);
