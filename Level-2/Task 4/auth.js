// STORAGE KEYS
const USERS_STORAGE_KEY = 'secure_auth_users';
const SESSION_KEY = 'secure_current_session';

// Helper functions
function getStoredUsers() {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch(e) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function findUserByEmail(email) {
    const users = getStoredUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

function registerUser(name, email, password) {
    const users = getStoredUsers();
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'User with this email already exists. Please login.' };
    }
    
    if (!password || password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters.' };
    }
    
    if (!email.includes('@') || !name.trim()) {
        return { success: false, message: 'Valid name and email required.' };
    }
    
    const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password
    };
    
    users.push(newUser);
    saveUsers(users);
    return { success: true, message: 'Registration successful! You can now login.' };
}

function loginUser(email, password) {
    const users = getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
        const session = {
            email: user.email,
            name: user.name,
            timestamp: Date.now()
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { success: true, user: session };
    }
    
    if (email.toLowerCase() === 'demo@example.com' && password === 'demo123') {
        const demoSession = { email: 'demo@example.com', name: 'Demo User' };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(demoSession));
        return { success: true, user: demoSession };
    }
    
    return { success: false, message: 'Invalid email or password. Try again or register.' };
}

function getCurrentSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch(e) { 
        return null; 
    }
}

function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    hideSecuredPage();
    showAuthContainer(true);
    clearMessages();
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    setActivePanel('login');
}

// UI Controls
const securedOverlay = document.getElementById('securedOverlay');
const authContainerDiv = document.getElementById('authContainer');

function showSecuredPage(userSession) {
    if (userSession) {
        document.getElementById('secureUserName').innerText = userSession.name || 'Member';
        document.getElementById('secureUserEmail').innerText = userSession.email;
    }
    securedOverlay.classList.add('active-secure');
    if(authContainerDiv) {
        authContainerDiv.style.opacity = '0.3';
        authContainerDiv.style.pointerEvents = 'none';
    }
}

function hideSecuredPage() {
    securedOverlay.classList.remove('active-secure');
    if(authContainerDiv) {
        authContainerDiv.style.opacity = '1';
        authContainerDiv.style.pointerEvents = 'auto';
    }
}

function showAuthContainer(show) {
    if(show) {
        authContainerDiv.style.opacity = '1';
        authContainerDiv.style.pointerEvents = 'auto';
    }
}

function clearMessages() {
    const loginMsgDiv = document.getElementById('loginMessage');
    const regMsgDiv = document.getElementById('registerMessage');
    if(loginMsgDiv) { 
        loginMsgDiv.style.display = 'none'; 
        loginMsgDiv.innerText = ''; 
        loginMsgDiv.className = 'info-message'; 
    }
    if(regMsgDiv) { 
        regMsgDiv.style.display = 'none'; 
        regMsgDiv.innerText = ''; 
        regMsgDiv.className = 'info-message'; 
    }
}

function showMessage(element, text, type) {
    if(!element) return;
    element.innerText = text;
    element.className = `info-message ${type === 'error' ? 'error-msg' : 'success-msg'}`;
    element.style.display = 'block';
    setTimeout(() => {
        if(element.style.display === 'block') {
            element.style.opacity = '0';
            setTimeout(() => {
                element.style.display = 'none';
                element.style.opacity = '1';
            }, 300);
        }
    }, 2800);
}

// Form Handlers
function handleLogin(e) {
    e.preventDefault();
    clearMessages();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        const msgDiv = document.getElementById('loginMessage');
        showMessage(msgDiv, 'Please fill in both email and password.', 'error');
        return;
    }
    
    const result = loginUser(email, password);
    if (result.success) {
        showSecuredPage(result.user);
        document.getElementById('loginForm').reset();
    } else {
        const msgDiv = document.getElementById('loginMessage');
        showMessage(msgDiv, result.message || 'Authentication failed. Check credentials.', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    clearMessages();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    
    if (!name || !email || !password) {
        const regMsg = document.getElementById('registerMessage');
        showMessage(regMsg, 'All fields are required.', 'error');
        return;
    }
    
    const result = registerUser(name, email, password);
    const regMsgDiv = document.getElementById('registerMessage');
    
    if (result.success) {
        showMessage(regMsgDiv, result.message, 'success');
        document.getElementById('registerForm').reset();
        setTimeout(() => {
            setActivePanel('login');
            const successMsgDiv = document.getElementById('loginMessage');
            if(successMsgDiv) {
                showMessage(successMsgDiv, 'Account created! Please login.', 'success');
            }
        }, 1500);
    } else {
        showMessage(regMsgDiv, result.message, 'error');
    }
}

// Panel Toggle
const loginTab = document.getElementById('loginTabBtn');
const registerTab = document.getElementById('registerTabBtn');
const loginPanel = document.getElementById('loginFormPanel');
const registerPanel = document.getElementById('registerFormPanel');

function setActivePanel(panelId) {
    if(panelId === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginPanel.classList.add('active-panel');
        registerPanel.classList.remove('active-panel');
        clearMessages();
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerPanel.classList.add('active-panel');
        loginPanel.classList.remove('active-panel');
        clearMessages();
    }
}

// Check existing session on load
function checkExistingSession() {
    const session = getCurrentSession();
    if (session && session.email) {
        const users = getStoredUsers();
        const exists = users.find(u => u.email.toLowerCase() === session.email.toLowerCase());
        if (exists || session.email === 'demo@example.com') {
            showSecuredPage(session);
        } else {
            sessionStorage.removeItem(SESSION_KEY);
        }
    }
}

// Event Listeners
loginTab.addEventListener('click', () => setActivePanel('login'));
registerTab.addEventListener('click', () => setActivePanel('register'));
document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('registerForm').addEventListener('submit', handleRegister);
document.getElementById('logoutBtn').addEventListener('click', logout);

// Initialize
window.addEventListener('load', () => {
    checkExistingSession();
});