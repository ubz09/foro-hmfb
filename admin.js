// Sistema de autenticación simple (en producción usar backend real)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123'; // Cambiar en producción

function login() {
    const user = document.getElementById('loginUser')?.value;
    const pass = document.getElementById('loginPass')?.value;
    
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        // Guardar sesión
        localStorage.setItem('hmfb_admin', 'true');
        localStorage.setItem('hmfb_user', user);
        
        // Redirigir o mostrar contenido de admin
        if (window.location.pathname.includes('admin.html')) {
            checkAdminAccess();
        } else {
            location.reload();
        }
    } else {
        alert('Credenciales incorrectas. Solo administradores pueden acceder.');
    }
}

function logout() {
    localStorage.removeItem('hmfb_admin');
    localStorage.removeItem('hmfb_user');
    window.location.href = 'index.html';
}

function isAdmin() {
    return localStorage.getItem('hmfb_admin') === 'true';
}

function getCurrentUser() {
    return localStorage.getItem('hmfb_user') || 'Anónimo';
}

function checkAuth() {
    const userInfo = document.getElementById('userInfo');
    const uploadSection = document.getElementById('uploadSection');
    const adminLink = document.getElementById('adminLink');
    
    if (isAdmin()) {
        if (userInfo) {
            userInfo.innerHTML = `<i class="fas fa-crown"></i> ${getCurrentUser()} (Admin)`;
        }
        if (uploadSection) {
            uploadSection.style.display = 'block';
        }
        if (adminLink) {
            adminLink.innerHTML = '<i class="fas fa-crown"></i> Panel Admin';
        }
    } else {
        if (userInfo) {
            userInfo.innerHTML = '<i class="fas fa-user"></i> Invitado';
        }
        if (uploadSection) {
            uploadSection.style.display = 'none';
        }
    }
}

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', checkAuth);
