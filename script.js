const STORAGE_KEY = 'orbit_campus_issues';
const USER_KEY = 'orbit_current_user';

// Local Storage Handlers
function getIssues() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveIssues(issues) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
}

function createIssue(issue) {
  const issues = getIssues();
  const newIssue = {
    id: 'ORB-' + Math.floor(1000 + Math.random() * 9000),
    ...issue,
    status: 'Open'
  };
  issues.push(newIssue);
  saveIssues(issues);
  return newIssue;
}

function updateIssueStatus(id, newStatus) {
  const issues = getIssues();
  const index = issues.findIndex(item => item.id === id);
  if (index !== -1) {
    issues[index].status = newStatus;
    saveIssues(issues);
  }
}

// User Auth Management
function getCurrentUser() {
  return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
}

// Navigation & Passcode Protection Gate
function checkAccessAndNavigate(targetUrl) {
  const user = getCurrentUser();

  // Home page navigation - no restriction
  if (targetUrl === 'index.html') {
    window.location.href = targetUrl;
    return;
  }
  
  // If user is NOT logged in, show Auth Modal popup
  if (!user) {
    openAuthModal(targetUrl);
    return;
  }

  // Admin Panel Passcode Check (Secret Key: ORBIT2026)
  if (targetUrl === 'admin.html') {
    const enteredCode = prompt('🔑 Restricted Area! Enter Admin Passcode to open Admin Panel:');
    
    if (enteredCode === "ORBIT2026") {
      window.location.href = targetUrl;
    } else if (enteredCode !== null) {
      alert('❌ Incorrect Passcode! Access Denied.');
    }
    return;
  }

  window.location.href = targetUrl;
}

function openAuthModal(redirectUrl = '') {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = 'flex';
    if(redirectUrl) modal.dataset.redirect = redirectUrl;
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
}

function logoutUser() {
  localStorage.removeItem(USER_KEY);
  window.location.href = 'index.html';
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
  
  if(tab === 'login') {
    document.getElementById('tabLogin').classList.add('active');
    document.getElementById('modalLoginForm').classList.add('active');
  } else {
    document.getElementById('tabRegister').classList.add('active');
    document.getElementById('modalRegisterForm').classList.add('active');
  }
}

function toggleAdminKeyInput() {
  const role = document.getElementById('modalRegRole').value;
  const adminKeyGroup = document.getElementById('adminKeyGroup');
  if (adminKeyGroup) {
    adminKeyGroup.style.display = role === 'admin' ? 'block' : 'none';
  }
}

// Render Header Links (Home remains publicly accessible)
function renderNavbar() {
  const user = getCurrentUser();
  const navContainer = document.getElementById('navbarLinks');
  
  if (navContainer) {
    if (user) {
      navContainer.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li><a href="#" onclick="checkAccessAndNavigate('report.html')">Report Issue</a></li>
        <li><a href="#" onclick="checkAccessAndNavigate('dashboard.html')">Dashboard</a></li>
        <li><a href="#" onclick="checkAccessAndNavigate('admin.html')">🛠️ Admin Panel</a></li>
        <li><a href="#" onclick="logoutUser()" style="color: #f87171;">🚪 Logout (${user.name})</a></li>
      `;
    } else {
      navContainer.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li><a href="#" onclick="openAuthModal('report.html')">Report Issue</a></li>
        <li><a href="#" onclick="openAuthModal('dashboard.html')">Dashboard</a></li>
        <li><a href="#" onclick="openAuthModal('admin.html')">🛠️ Admin Panel</a></li>
        <li><button onclick="openAuthModal()" class="btn btn-sky">🔑 Login / Register</button></li>
      `;
    }
  }
}

// Event Listeners for Login / Register Modal
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();

  // Register Handler
  const regForm = document.getElementById('modalRegisterForm');
  if (regForm) {
    regForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const users = JSON.parse(localStorage.getItem('orbit_users') || '[]');
      const email = document.getElementById('modalRegEmail').value;
      const role = document.getElementById('modalRegRole').value;
      const adminKey = document.getElementById('modalAdminKey')?.value;

      if (role === 'admin') {
        const SECRET_CODE = "ORBIT2026";
        if (adminKey !== SECRET_CODE) {
          alert('❌ Invalid Admin Passcode! You cannot register as an Admin.');
          return;
        }
      }

      if (users.find(u => u.email === email)) {
        alert('Email already registered!');
        return;
      }

      const newUser = {
        name: document.getElementById('modalRegName').value,
        email: email,
        password: document.getElementById('modalRegPass').value,
        role: role
      };

      users.push(newUser);
      localStorage.setItem('orbit_users', JSON.stringify(users));
      alert(`Registration successful! Please login now.`);
      switchTab('login');
    });
  }

  // Login Handler
  const loginForm = document.getElementById('modalLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const users = JSON.parse(localStorage.getItem('orbit_users') || '[]');
      const email = document.getElementById('modalLoginEmail').value;
      const pass = document.getElementById('modalLoginPass').value;

      const user = users.find(u => u.email === email && u.password === pass);

      if (user) {
        localStorage.setItem('orbit_current_user', JSON.stringify(user));
        alert(`Welcome back, ${user.name}!`);
        
        // Post-login redirect logic
        let redirectUrl = document.getElementById('authModal').dataset.redirect;
        
        if (!redirectUrl || redirectUrl === 'index.html') {
          redirectUrl = 'dashboard.html';
        }

        window.location.href = redirectUrl;
      } else {
        alert('Invalid email or password!');
      }
    });
  }
});