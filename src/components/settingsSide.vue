<template>
    <div class="container d-flex flex-column align-items-start h-100 p-2 w-auto" ref="containerRef">
        <!-- Header -->
        <div class="d-flex w-100 justify-content-between align-items-center mb-2">
            <p class="h5 mt-2 mb-0">Settings</p>
            <div class="d-flex gap-1">
                <span class="badge bg-primary center d-flex justify-content-center align-items-center" title="current version">{{version}}</span>
                <button class="btn btn-close" @click="closeSettings"></button>
            </div>
        </div>

        <!-- Scrollable Content -->
        <div class="settings-scroll w-100">
            <!-- Password Section -->
            <div class="settings-section">
                <h6 class="section-title">Password</h6>
                <div class="d-flex input-group">
                    <input type="password" class="form-control" placeholder="Enter New Password" v-model="newpass" @keyup.enter="changepass">
                    <button class="btn btn-danger btn-sm" @click="changepass">Change</button>
                </div>
            </div>

            <!-- Email Alerts Section -->
            <div class="settings-section">
                <h6 class="section-title">Email Alerts</h6>
                <div class="d-flex input-group mb-2">
                    <input type="email" class="form-control" placeholder="New Alert Email" v-model="newmail" @keyup.enter="addmail">
                    <button class="btn btn-primary btn-sm" @click="addmail">Add</button>
                </div>
                <div v-if="settings.mails && settings.mails.length > 0" class="w-100">
                    <div v-for="mail in settings.mails" class="d-flex align-items-center w-100 mb-1" :key="mail">
                        <span class="input-group-text w-100 text-truncate" style="font-size: 0.85rem;">{{ mail }}</span>
                        <button class="btn btn-close btn-sm" @click="removemail(mail)"></button>
                    </div>
                </div>
            </div>

            <!-- Ping Configuration Section -->
            <div class="settings-section">
                <h6 class="section-title">Ping Configuration</h6>
                <div class="d-flex flex-column w-100 gap-1">
                    <div class="input-group input-group-sm">
                        <span class="input-group-text" style="width: 50%;">No. of Packets</span>
                        <input type="number" class="form-control" v-model="packets"/>
                    </div>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text" style="width: 50%;">T.O Packets (s)</span>
                        <input type="number" class="form-control" v-model="packettimeout"/>
                    </div>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text" style="width: 50%;">T.O Ping (ms)</span>
                        <input type="number" class="form-control" v-model="pingtimeout"/>
                    </div>
                    <button class="btn btn-primary btn-sm mt-1" @click="updatepinginfo">Update</button>
                </div>
            </div>

            <!-- Connections Section -->
            <div class="settings-section">
                <h6 class="section-title">Connections</h6>
                
                <!-- Add New Connection -->
                <div class="add-connection-form mb-3">
                    <input 
                        type="text" 
                        class="form-control form-control-sm mb-2" 
                        placeholder="Connection name" 
                        v-model="newConnLabel"
                    >
                    <div class="d-flex gap-2 align-items-center">
                        <div class="color-picker-wrapper">
                            <input 
                                type="color" 
                                class="color-picker" 
                                v-model="newConnColor" 
                                title="Choose color"
                            >
                            <span class="color-preview" :style="{ backgroundColor: newConnColor }"></span>
                        </div>
                        <button class="btn btn-primary btn-sm flex-grow-1" @click="addConnection">
                            <span>+ Add</span>
                        </button>
                    </div>
                </div>

                <!-- All Connections List -->
                <div class="connections-list">
                    <!-- Default Connections -->
                    <div v-if="settings.defaultConnections && settings.defaultConnections.length > 0">
                        <div v-for="conn in settings.defaultConnections" class="connection-card" :key="conn.id">
                            <div class="connection-color-indicator" :style="{ backgroundColor: conn.color }"></div>
                            <div class="connection-content">
                                <input 
                                    type="text" 
                                    class="connection-label-input" 
                                    v-model="conn.label"
                                    @blur="updateDefaultConnection(conn)"
                                >
                                <div class="connection-actions">
                                    <input 
                                        type="color" 
                                        class="color-picker-mini" 
                                        v-model="conn.color"
                                        @change="updateDefaultConnection(conn)"
                                        title="Change color"
                                    >
                                    <button 
                                        class="btn-delete" 
                                        @click="removeDefaultConnection(conn.id)" 
                                        title="Delete"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Custom Connections -->
                    <div v-if="settings.customConnections && settings.customConnections.length > 0">
                        <div v-for="(conn, idx) in settings.customConnections" class="connection-card" :key="idx">
                            <div class="connection-color-indicator" :style="{ backgroundColor: conn.color }"></div>
                            <div class="connection-content">
                                <input 
                                    type="text" 
                                    class="connection-label-input" 
                                    v-model="conn.label"
                                    @blur="updateCustomConnection(idx, conn)"
                                >
                                <div class="connection-actions">
                                    <input 
                                        type="color" 
                                        class="color-picker-mini" 
                                        v-model="conn.color"
                                        @change="updateCustomConnection(idx, conn)"
                                        title="Change color"
                                    >
                                    <button 
                                        class="btn-delete" 
                                        @click="removeConnection(idx)" 
                                        title="Delete"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Resize Handle -->
        <div class="resize-handle" @mousedown="startResize"></div>
    </div>
</template>
<script setup>
import { defineEmits, defineProps, ref, watch, onMounted, onUnmounted } from 'vue'
import useLocalStorage from './useLocalStorage'
import { hashPassword } from '../utils/passwordUtils'
const p = defineProps(['settings','version'])
const containerRef = ref(null)
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)
const newpass = ref("")
const newmail = ref("")
const packets = ref(p.settings['packets'])
const packettimeout = ref(p.settings['packettimeout'])
const pingtimeout = ref(p.settings['pingtimeout'])
const newConnLabel = ref("")
const newConnColor = ref("#6e55fb")

const emits = defineEmits(['closeSettings','settoast'])
const closeSettings = () => {
    emits('closeSettings', true)
}

const changepass = async () => {
    if(newpass.value != ""){
        const hashedPass = await hashPassword(newpass.value)
        useLocalStorage.updateSettings(p.settings, "password", hashedPass)
        newpass.value = ""
        emits('settoast',"Admin Password Changed")
    }else{
        emits("settoast","Empty entry","danger")
    }
}

const addmail = () => {
    if(newmail.value != ""){
        useLocalStorage.updateSettings(p.settings, "addmail", newmail.value)    
        emits('settoast',`${newmail.value}:New Mail Added`)
        newmail.value = ""
    }else{
        emits("settoast","Empty entry","danger")
    }
}

const removemail = (mail) => {
    useLocalStorage.updateSettings(p.settings, "removemail", mail)
    emits('settoast',`${mail}:Mail Removed`,"danger")
}

const updatepinginfo = () =>{
    const value = {
        packets:packets.value,
        packettimeout:packettimeout.value,
        pingtimeout:pingtimeout.value
    }
    useLocalStorage.updateSettings(p.settings,"updatepinginfo",value)
    emits('settoast',"PingInfo Updated")
}

const updateDefaultConnection = (conn) => {
    useLocalStorage.updateSettings(p.settings, "updatedefaultconnection", {
        id: conn.id,
        label: conn.label,
        color: conn.color
    })
    emits('settoast', 'Connection Updated')
}

const removeDefaultConnection = (id) => {
    useLocalStorage.updateSettings(p.settings, "removedefaultconnection", id)
    emits('settoast', 'Connection Removed', 'danger')
}

const updateCustomConnection = (idx, conn) => {
    useLocalStorage.updateSettings(p.settings, "updatecustomconnection", {
        idx,
        label: conn.label,
        color: conn.color
    })
    emits('settoast', 'Connection Updated')
}

const addConnection = () => {
    if(newConnLabel.value != ""){
        const conn = { label: newConnLabel.value, color: newConnColor.value }
        useLocalStorage.updateSettings(p.settings, "addconnection", conn)
        emits('settoast',`${newConnLabel.value}: Connection Added`)
        newConnLabel.value = ""
        newConnColor.value = "#6e55fb"
    }else{
        emits("settoast","Empty entry","danger")
    }
}

const removeConnection = (idx) => {
    useLocalStorage.updateSettings(p.settings, "removeconnection", idx)
    emits('settoast',"Connection Removed","danger")
}

const startResize = (e) => {
    isResizing.value = true
    startX.value = e.clientX
    startWidth.value = containerRef.value.offsetWidth
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
}

const handleResize = (e) => {
    if (!isResizing.value) return
    const diff = e.clientX - startX.value
    const newWidth = startWidth.value + diff
    if (newWidth >= 280 && newWidth <= 600) {
        containerRef.value.style.minWidth = `${newWidth}px`
        containerRef.value.style.maxWidth = `${newWidth}px`
    }
}

const stopResize = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    if (containerRef.value) {
        localStorage.setItem('settingsWidth', containerRef.value.offsetWidth)
    }
}

onMounted(() => {
    const savedWidth = localStorage.getItem('settingsWidth')
    if (savedWidth && containerRef.value) {
        containerRef.value.style.minWidth = `${savedWidth}px`
        containerRef.value.style.maxWidth = `${savedWidth}px`
    }
})

onUnmounted(() => {
    if (containerRef.value) {
        localStorage.setItem('settingsWidth', containerRef.value.offsetWidth)
    }
})

watch(p.settings, () => {
    useLocalStorage.pushUpdateSettings(p.settings)
}, { deep: true })
</script>
<style scoped>
.container {
    background-color: var(--bs-tertiary-bg);
    padding: 0;
    min-width: 340px;
    max-width: 340px;
    overflow: hidden;
    position: relative;
}

.resize-handle {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: ew-resize;
    background-color: transparent;
    transition: background-color 0.2s ease;
    z-index: 10;
}

.resize-handle:hover {
    background-color: #6e55fb;
}

.resize-handle:active {
    background-color: #5a42d1;
}

.settings-scroll {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: calc(100vh - 70px);
    padding-right: 8px;
}

.settings-scroll::-webkit-scrollbar {
    width: 6px;
}

.settings-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.settings-scroll::-webkit-scrollbar-thumb {
    background: #6e55fb;
    border-radius: 3px;
}

.settings-scroll::-webkit-scrollbar-thumb:hover {
    background: #5a42d1;
}

.settings-section {
    background-color: var(--bs-body-bg);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    border: none;
}

.section-title {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--bs-body-color);
}

.add-connection-form {
    background-color: var(--bs-tertiary-bg);
    padding: 0.75rem;
    border-radius: 8px;
}

.color-picker-wrapper {
    position: relative;
    width: 50px;
    height: 36px;
}

.color-picker {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
}

.color-preview {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 6px;
    border: 2px solid var(--bs-border-color);
    pointer-events: none;
    transition: all 0.2s ease;
}

.color-picker-wrapper:hover .color-preview {
    border-color: #6e55fb;
    transform: scale(1.05);
}

.connections-list {
    max-height: 350px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.connections-list::-webkit-scrollbar {
    width: 4px;
}

.connections-list::-webkit-scrollbar-track {
    background: transparent;
}

.connections-list::-webkit-scrollbar-thumb {
    background: #6e55fb;
    border-radius: 2px;
}

.connection-card {
    display: flex;
    align-items: stretch;
    background-color: var(--bs-tertiary-bg);
    border-radius: 8px;
    overflow: hidden;
    transition: background-color 0.2s ease;
}

.connection-card:hover {
    background-color: var(--bs-body-bg);
}

.connection-color-indicator {
    width: 4px;
    min-width: 4px;
    background-color: #6e55fb;
}

.connection-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
}

.connection-label-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--bs-body-color);
    font-size: 0.85rem;
    padding: 0.25rem 0;
    outline: none;
}

.connection-label-input:focus {
    background-color: var(--bs-body-bg);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
}

.connection-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.color-picker-mini {
    width: 28px;
    height: 28px;
    border: 2px solid var(--bs-border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.color-picker-mini:hover {
    border-color: #6e55fb;
    transform: scale(1.1);
}

.btn-delete {
    background: none;
    border: none;
    color: var(--bs-secondary-color);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.btn-delete:hover {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    transform: scale(1.1);
}


</style>
