<template>
    <div class="login-wrapper" :class="{ 'dark-theme': isDarkMode }">
        <div class="login-container" id="container">
            <div class="logo-section">
                <img src="@/assets/logo.png" alt="Network Dashboard Logo" class="app-logo"/>
                <h4 class="app-title">Network Dashboard</h4>
                <p class="app-subtitle">Network Monitoring Tool</p>
            </div>

            <div v-if="isFirstTime" class="setup-section">
                <h5 class="section-title">First Time Setup</h5>
                <p class="setup-info">Set your admin password to secure your dashboard</p>
                
                <div class="form-group">
                    <label class="form-label">Create Admin Password</label>
                    <input 
                        type="password" 
                        class="form-control" 
                        placeholder="Enter new password" 
                        v-model="newPass"
                        @keyup.enter="setupPassword"
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label">Confirm Password</label>
                    <input 
                        type="password" 
                        class="form-control" 
                        placeholder="Re-enter password" 
                        v-model="confirmPass"
                        @keyup.enter="setupPassword"
                    >
                </div>
                
                <button class="btn btn-primary w-100 btn-lg" @click="setupPassword">
                    Setup & Continue
                </button>
            </div>

            <div v-else class="login-section">
                <h5 class="section-title">Admin Login</h5>
                
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input 
                        type="password" 
                        class="form-control" 
                        placeholder="Enter admin password" 
                        v-model="pass"
                        @keyup.enter="checkPass"
                    >
                </div>
                
                <button class="btn btn-primary w-100 btn-lg mb-2" @click="checkPass">
                    Login
                </button>
                
                <div class="divider">
                    <span>OR</span>
                </div>
                
                <button class="btn btn-outline-secondary w-100" @click="viewOnly">
                    Continue as View Only
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, computed } from 'vue';
import useLocalStorage from './useLocalStorage';
import { hashPassword, verifyPassword } from '../utils/passwordUtils';

const pass = ref('');
const newPass = ref('');
const confirmPass = ref('');
const isFirstTime = ref(false);
const emits = defineEmits(["checkPass", "viewOnly", "settoast"]);

const isDarkMode = computed(() => {
    return localStorage.getItem("darkMode") === "true";
});

onMounted(async () => {
    const settings = await useLocalStorage.getSettings();
    if (settings.adminpass === "12345678") {
        isFirstTime.value = true;
    }
});

const setupPassword = async () => {
    if (!newPass.value) {
        emits("settoast", "Password cannot be empty", "danger");
        return;
    }
    
    if (newPass.value !== confirmPass.value) {
        emits("settoast", "Passwords do not match", "danger");
        return;
    }
    
    const hashedPass = await hashPassword(newPass.value);
    const settings = await useLocalStorage.getSettings();
    useLocalStorage.updateSettings(settings, "password", hashedPass);
    await useLocalStorage.pushUpdateSettings(settings);
    
    emits("settoast", "Password setup successful! Please login", "success");
    isFirstTime.value = false;
    newPass.value = '';
    confirmPass.value = '';
};

const checkPass = () => {
    if (!pass.value) {
        emits("settoast", "Please enter password", "danger");
        return;
    }
    emits("checkPass", pass.value);
};

const viewOnly = () => {
    emits("viewOnly", true);
};
</script>

<style scoped>
/* Light Theme Gradient */
.login-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #6e55fb 0%, #b8a9ff 50%, #e8e3ff 100%);
    position: relative;
    overflow: hidden;
    transition: background 0.5s ease;
}

/* Dark Theme Gradient */
.login-wrapper.dark-theme {
    background: linear-gradient(135deg, #1a1625 0%, #2d2440 30%, #6e55fb 100%);
}

.login-wrapper::before {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(110, 85, 251, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    top: -150px;
    right: -150px;
    animation: float 6s ease-in-out infinite;
}

.login-wrapper.dark-theme::before {
    background: radial-gradient(circle, rgba(110, 85, 251, 0.5) 0%, transparent 70%);
}

.login-wrapper::after {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(155, 127, 245, 0.25) 0%, transparent 70%);
    border-radius: 50%;
    bottom: -100px;
    left: -100px;
    animation: float 8s ease-in-out infinite reverse;
}

.login-wrapper.dark-theme::after {
    background: radial-gradient(circle, rgba(184, 169, 255, 0.2) 0%, transparent 70%);
}

@keyframes float {
    0%, 100% {
        transform: translateY(0) scale(1);
    }
    50% {
        transform: translateY(-20px) scale(1.05);
    }
}

.login-container {
    background-color: var(--bs-body-bg);
    border-radius: 16px;
    padding: 2rem 2rem;
    box-shadow: 0 20px 60px rgba(110, 85, 251, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
    width: 100%;
    max-width: 380px;
    animation: slideUp 0.4s ease-out;
    position: relative;
    z-index: 1;
    backdrop-filter: blur(10px);
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.logo-section {
    text-align: center;
    margin-bottom: 1.5rem;
}

.app-logo {
    width: 70px;
    height: 70px;
    object-fit: contain;
    margin-bottom: 0.5rem;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.1));
}

.app-title {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--bs-body-color);
    margin-bottom: 0.15rem;
}

.app-subtitle {
    font-size: 0.85rem;
    color: var(--bs-secondary-color);
    margin: 0;
}

.section-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--bs-body-color);
}

.setup-info {
    font-size: 0.85rem;
    color: var(--bs-secondary-color);
    margin-bottom: 1.25rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-label {
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 0.4rem;
    color: var(--bs-body-color);
}

.form-control {
    padding: 0.6rem 0.875rem;
    font-size: 0.95rem;
    border-radius: 8px;
    border: 2px solid var(--bs-border-color);
    transition: all 0.3s ease;
}

.form-control:focus {
    border-color: #6e55fb;
    box-shadow: 0 0 0 0.2rem rgba(110, 85, 251, 0.25);
}

.btn {
    padding: 0.6rem 1.25rem;
    font-size: 0.95rem;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.btn-lg {
    padding: 0.7rem 1.25rem;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(110, 85, 251, 0.5);
}

.btn-outline-secondary:hover {
    transform: translateY(-2px);
}

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 1.25rem 0;
    color: var(--bs-secondary-color);
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--bs-border-color);
}

.divider span {
    padding: 0 1rem;
    font-size: 0.85rem;
    font-weight: 500;
}

.setup-section,
.login-section {
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>