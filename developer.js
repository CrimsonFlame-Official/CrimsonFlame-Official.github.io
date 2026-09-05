import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { CrimX } from "/crimx.js";

const firebaseConfig = {
    apiKey: "AIzaSyBSSJKDrFJ1_qlliZqgw34CY2TSaKOxxxM",
    authDomain: "crimsonflame-8169e.firebaseapp.com",
    projectId: "crimsonflame-8169e",
    storageBucket: "crimsonflame-8169e.firebasestorage.app",
    messagingSenderId: "406321213530",
    appId: "1:406321213530:web:92d27a69d34d147393a863"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
const IMGBB_API_KEY = "d5fd4e3e9fedc18b9bed075f980f12b7";

window.showCustomAlert = function(message) {
    const overlay = document.getElementById('custom-alert'); 
    if(!overlay) { alert(message); return; }
    document.getElementById('custom-alert-message').innerText = message; 
    overlay.classList.add('active');
};

window.handleSSOLogoUpload = async function(file) {
    if (!file || !file.type.startsWith('image/')) return window.showCustomAlert("Not a valid image.");
    const sEl = document.getElementById('sso-logo-status');
    sEl.style.display = 'block'; sEl.innerText = 'Uploading logo...';
    try {
        const fd = new FormData(); fd.append("image", file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: fd });
        const json = await res.json(); if (!json.success) throw new Error("Upload Failed");
        document.getElementById('sso-app-logo').value = json.data.url;
        sEl.innerText = "Logo uploaded successfully!";
    } catch (err) { sEl.innerText = "Error uploading logo."; }
    setTimeout(() => { sEl.style.display = 'none'; }, 3000);
};

function generateSecureRandomHex(bytesCount = 16) {
    const rand = new Uint8Array(bytesCount);
    crypto.getRandomValues(rand);
    return Array.from(rand, b => ('0' + b.toString(16)).slice(-2)).join('');
}

window.createSSOLink = async function(e) {
    e.preventDefault();
    if (!currentUser) return;
    const btn = document.getElementById('btn-create-sso');
    btn.disabled = true; btn.innerText = "Generating CrimX App...";

    try {
        const appName = document.getElementById('sso-app-name').value.trim();
        const appLogo = document.getElementById('sso-app-logo').value.trim() || "https://i.ibb.co/TBkJR2Jn/unnamed-removebg-preview.png";
        
        // Allowed Redirect URIs (split by commas or newlines)
        const redirectRaw = document.getElementById('sso-redirect-url').value.trim();
        const redirectUris = redirectRaw ? redirectRaw.split(/[\n,]+/).map(u => u.trim()).filter(Boolean) : [];
        const primaryRedirect = redirectUris[0] || "";

        const perms = [];
        if (document.getElementById('perm-profile').checked) perms.push("Access your display name & profile picture");
        if (document.getElementById('perm-email').checked) perms.push("View your email address");
        if (document.getElementById('perm-sso').checked) perms.push("Authenticate via CrimX Auth");

        const customPermsStr = document.getElementById('sso-custom-perms').value.trim();
        if (customPermsStr) {
            customPermsStr.split(',').map(p => p.trim()).filter(Boolean).forEach(p => perms.push(p));
        }

        const clientId = `crimx_client_${generateSecureRandomHex(8)}`;
        const clientSecret = `crimx_secret_${generateSecureRandomHex(18)}`;

        const ssoData = {
            linkkey: clientId,
            clientId: clientId,
            clientSecret: clientSecret,
            ownerUid: currentUser.uid,
            appName: appName,
            appLogo: appLogo,
            redirectUrl: primaryRedirect,
            redirectUris: redirectUris,
            permissions: perms,
            createdAt: new Date().toISOString()
        };

        // Save to sso_links collection (and cached locally)
        await setDoc(doc(db, "sso_links", clientId), ssoData);

        try {
            localStorage.setItem('cf_sso_key_' + clientId, JSON.stringify(ssoData));
        } catch(err) {}

        document.getElementById('sso-app-name').value = '';
        document.getElementById('sso-app-logo').value = '';
        document.getElementById('sso-redirect-url').value = '';
        document.getElementById('sso-custom-perms').value = '';

        window.showCustomAlert(`CrimX App Registered!\nClient ID: ${clientId}\nClient Secret: ${clientSecret}\n(Keep your secret safe!)`);
        window.loadSSOLinks();
    } catch(err) {
        console.error("Error creating CrimX App:", err);
        window.showCustomAlert("Failed to register CrimX App: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "✨ Register CrimX App";
    }
};

window.loadSSOLinks = async function() {
    if (!currentUser) return;
    const container = document.getElementById('sso-links-list');
    if (!container) return;

    try {
        const q = query(collection(db, "sso_links"), where("ownerUid", "==", currentUser.uid));
        const snap = await getDocs(q);
        const ssoItems = [];

        snap.forEach(docSnap => {
            ssoItems.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (ssoItems.length === 0) {
            container.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.88rem; text-align: center; padding: 24px; background: rgba(0,0,0,0.25); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">No CrimX Apps created yet. Fill out the form above to register your first game or app!</p>`;
            return;
        }

        container.innerHTML = ssoItems.map(item => {
            const currentOrigin = window.location.origin;
            const cId = item.clientId || item.linkkey || item.id;
            const linkUrl = `${currentOrigin}/link?client_id=${cId}`;
            const permsList = (item.permissions || []).map(p => `<li style="font-size: 0.8rem; color: #ede8ea;">✓ ${p}</li>`).join('');
            
            const totalAuths = item.totalAuthorizations || 0;
            const uniqueUsers = item.authorizedUserUids ? Object.keys(item.authorizedUserUids).length : 0;
            const lastUsed = item.lastAuthorizedAt ? new Date(item.lastAuthorizedAt).toLocaleDateString() + ' ' + new Date(item.lastAuthorizedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never';

            const redirectUrisList = item.redirectUris && item.redirectUris.length > 0 
                ? item.redirectUris.join(', ') 
                : (item.redirectUrl || 'None specified');

            return `
                <div style="background: rgba(22, 12, 16, 0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${item.appLogo}" style="width: 44px; height: 44px; border-radius: 12px; object-fit: cover; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);">
                        <div style="flex: 1;">
                            <div style="font-weight: 700; color: #fff; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                                ${item.appName}
                                <span style="font-size: 0.7rem; background: rgba(217, 4, 41, 0.2); color: #ff8597; border: 1px solid rgba(217, 4, 41, 0.3); padding: 2px 6px; border-radius: 4px;">CrimX Auth</span>
                            </div>
                            <div style="font-size: 0.78rem; color: var(--text-secondary);">Allowed URIs: <code style="color: #cbd5e1;">${redirectUrisList}</code></div>
                        </div>
                        <button onclick="window.deleteSSOLink('${cId}')" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; font-weight: 600;">Delete</button>
                    </div>

                    <!-- Analytics Stats Bar -->
                    <div style="background: rgba(0,0,0,0.4); padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 10px; text-align: center;">
                        <div>
                            <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin-bottom: 2px;">Unique Players</div>
                            <div style="font-size: 1.1rem; font-weight: 800; color: #4ade80;">${uniqueUsers} Users</div>
                        </div>
                        <div>
                            <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin-bottom: 2px;">Authorizations</div>
                            <div style="font-size: 1.1rem; font-weight: 800; color: var(--crimson-light);">${totalAuths} Times</div>
                        </div>
                        <div>
                            <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin-bottom: 2px;">Last Active</div>
                            <div style="font-size: 0.82rem; font-weight: 600; color: #ede8ea;">${lastUsed}</div>
                        </div>
                    </div>

                    <!-- Client ID Box -->
                    <div style="background: rgba(0,0,0,0.4); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
                        <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Client ID (Public)</div>
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                            <code style="color: #4ade80; font-family: monospace; font-size: 0.88rem; word-break: break-all;">${cId}</code>
                            <button onclick="window.copyToClipboard('${cId}', this)" style="padding: 4px 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff; font-size: 0.78rem; cursor: pointer; white-space: nowrap;">📋 Copy ID</button>
                        </div>
                    </div>

                    <!-- Client Secret Box -->
                    <div style="background: rgba(0,0,0,0.4); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                            <span style="font-size: 0.72rem; color: #f87171; text-transform: uppercase; font-weight: 700;">Client Secret (Confidential)</span>
                            <button onclick="window.regenerateSecret('${cId}')" style="background: none; border: none; color: var(--text-secondary); font-size: 0.72rem; text-decoration: underline; cursor: pointer;">Regenerate</button>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                            <code id="secret-text-${cId}" style="color: #cbd5e1; font-family: monospace; font-size: 0.85rem; word-break: break-all;">••••••••••••••••••••••••••••••••</code>
                            <div style="display: flex; gap: 6px; white-space: nowrap;">
                                <button onclick="window.toggleSecretVisibility('${cId}', '${item.clientSecret || ''}')" style="padding: 4px 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff; font-size: 0.76rem; cursor: pointer;">👁️ Show</button>
                                <button onclick="window.copyToClipboard('${item.clientSecret || ''}', this)" style="padding: 4px 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff; font-size: 0.76rem; cursor: pointer;">📋 Copy</button>
                            </div>
                        </div>
                    </div>

                    <!-- Authorization Link Box -->
                    <div style="background: rgba(0,0,0,0.4); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
                        <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">CrimX Authorization URL</div>
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                            <code style="color: var(--crimson-light); font-family: monospace; font-size: 0.8rem; word-break: break-all;">${linkUrl}</code>
                            <button onclick="window.copyToClipboard('${linkUrl}', this)" style="padding: 4px 10px; background: var(--crimson); border: none; border-radius: 6px; color: #fff; font-size: 0.78rem; cursor: pointer; font-weight: 600; white-space: nowrap;">🔗 Copy URL</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch(err) {
        console.error("Error loading CrimX Apps:", err);
    }
};

window.toggleSecretVisibility = function(id, secret) {
    const el = document.getElementById(`secret-text-${id}`);
    if (!el) return;
    if (el.innerText.includes('•')) {
        el.innerText = secret || "None generated yet";
        el.style.color = '#f59e0b';
    } else {
        el.innerText = '••••••••••••••••••••••••••••••••';
        el.style.color = '#cbd5e1';
    }
};

window.regenerateSecret = async function(clientId) {
    if (!confirm("Regenerating the secret will invalidate your current secret immediately. Continue?")) return;
    try {
        const newSecret = `crimx_secret_${generateSecureRandomHex(18)}`;
        await updateDoc(doc(db, "sso_links", clientId), {
            clientSecret: newSecret
        });
        window.showCustomAlert(`New Client Secret Generated:\n${newSecret}`);
        window.loadSSOLinks();
    } catch(err) {
        window.showCustomAlert("Failed to regenerate secret: " + err.message);
    }
};

window.deleteSSOLink = async function(key) {
    if (!confirm("Are you sure you want to delete this CrimX Application? Active user sessions may be affected.")) return;
    try {
        await deleteDoc(doc(db, "sso_links", key));
        try { localStorage.removeItem('cf_sso_key_' + key); } catch(e) {}
        window.showCustomAlert("CrimX Application deleted.");
        window.loadSSOLinks();
    } catch(err) {
        window.showCustomAlert("Failed to delete application: " + err.message);
    }
};

window.copyToClipboard = function(text, btnEl) {
    if (!text) return window.showCustomAlert("No value to copy.");
    navigator.clipboard.writeText(text).then(() => {
        const origText = btnEl.innerText;
        btnEl.innerText = "✓ Copied!";
        setTimeout(() => { btnEl.innerText = origText; }, 2000);
    }).catch(err => {
        window.showCustomAlert("Copy failed: " + err);
    });
};

// LIVE TESTER: Token Exchange Playground
window.testLiveExchange = async function(e) {
    e.preventDefault();
    const code = document.getElementById('test-exchange-code').value.trim();
    const clientId = document.getElementById('test-client-id').value.trim();
    const clientSecret = document.getElementById('test-client-secret').value.trim();
    const outputEl = document.getElementById('test-exchange-output');

    if (!code || !clientId) {
        outputEl.innerText = "Error: Code and Client ID are required.";
        outputEl.style.color = "#f87171";
        return;
    }

    outputEl.innerText = "Exchanging code with CrimX Server...";
    outputEl.style.color = "#fbbf24";

    try {
        const response = await CrimX.exchangeCode({
            code: code,
            clientId: clientId,
            clientSecret: clientSecret || null
        });

        outputEl.innerText = JSON.stringify(response, null, 2);
        outputEl.style.color = "#4ade80";
    } catch(err) {
        outputEl.innerText = `Exchange Failed:\n${err.message}`;
        outputEl.style.color = "#f87171";
    }
};

onAuthStateChanged(auth, user => {
    if (user && (user.emailVerified || user.providerData.some(p => p.providerId === 'google.com'))) {
        currentUser = user;
        document.getElementById('dev-auth-notice').style.display = 'none';
        document.getElementById('dev-dashboard-container').style.display = 'block';
        window.loadSSOLinks();
    } else {
        currentUser = null;
        document.getElementById('dev-auth-notice').style.display = 'block';
        document.getElementById('dev-dashboard-container').style.display = 'none';
    }
});
