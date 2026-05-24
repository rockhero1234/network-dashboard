<template>
    <div class="container d-flex flex-column align-items-start h-100 justify-content-between p-2 w-auto" ref="containerRef">
        <div class="d-flex flex-column w-100">
            <div class="d-flex justify-content-between gap-3">
                <p class="h5 mt-2">Topologies</p>
                <div class="d-flex ">
                <button class="d-flex justify-content-center align-items-center btn rounded-5" style="width: 40px; height: 40px;" title="Refresh/Logout" @click="logout"><img class="png-theme" :src="refreshicon" style="width: 20px;height: 20px;"/></button>
                <!-- <button class="d-flex justify-content-center align-items-center btn rounded-5" style="width: 40px; height: 40px;" :title="updateinfo"><img class="png-theme" id="updateicon" :src="updateicon" style="width: 18px;height: 18px;"/></button> -->
                <button class="d-flex justify-content-center align-items-center btn rounded-5" style="width: 40px; height: 40px;" :title="isdarkmode ? 'Light Mode' : 'Dark Mode'" @click="toggleDarkMode">
                    <img v-if="isdarkmode" class="png-theme" :src="lightModeIcon" id="updateicon" style="width: 18px;height: 18px;"/>
                    <img v-else class="png-theme" :src="darkModeIcon" id="updateicon" style="width: 18px;height: 18px;"/>
                </button>
                <button v-if="!viewonly" class="d-flex justify-content-center align-items-center btn rounded-5" style="width: 40px; height: 40px;" @click="openSettings" title="Settings"><img class="png-theme" :src="settingicon" style="width: 20px;height: 20px;"/></button>
            </div>
            </div>
        <div class="div mt-2"  v-if="data" >
            <div class="d-flex align-items-center justify-content-between" v-for="(t,id) in data" v-bind:key="id">
                <span class="input-group-text w-100" style="cursor: pointer;" id="basic-addon1" @click="selectTopology(id,t.name)" title="Select Topology">{{t.name}}</span>
                <button v-if="!viewonly" class="btn btn-sm p-2" @click="exportToplogy(id)" title="Export Topology"><img class="png-theme" width="16px" height="16px" :src="exporticon"/></button>
                <button v-if="!viewonly" class="btn btn-close btn-sm p-2" @click="deleteTopology(id,t.name)" title="Delete Topology"></button>
            </div>
        </div>
        </div>
        <div v-if="!viewonly" class="d-flex flex-column w-100">
        <input type="text" class="form-control" placeholder="Name or Topology Data" aria-label="TopologyName"
        aria-describedby="basic-addon1"  ref="tName" title="for new topology enter title or paste clipboard data of exported topology" @keyup.enter="addTopology">
        <button class="btn btn-primary btn-sm align-self-center m-2 w-100" @click="addTopology">Add Topology</button>
    </div>
    
    <!-- Resize Handle -->
    <div class="resize-handle" @mousedown="startResize"></div>
    </div>
</template>
<script setup>
    import {ref,defineProps,watch,defineEmits,onBeforeMount,onMounted,onUnmounted} from 'vue'
    import useLocalStorage from './useLocalStorage'
    import settingicon from "../assets/settings.png"
    import exporticon from "../assets/export.png"
    import refreshicon from "../assets/refresh.png"
    import updateicon from "../assets/update.png"
    import darkModeIcon from "../assets/dark_mode.png"
    import lightModeIcon from "../assets/light_mode.png"

    const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null
    const tName  = ref()
    const updateinfo = ref("latest" )
    const containerRef = ref(null)
    const isResizing = ref(false)
    const startX = ref(0)
    const startWidth = ref(0)
    onBeforeMount(async ()=>{
        const version  = await ipcRenderer.invoke('get-app-version')
        updateinfo.value = "latest:" +version
    })

    const p = defineProps(['data','viewonly','isdarkmode'])
    const emits = defineEmits(['selectTopology','deleteTopology','openSettings','settoast','toggleDarkMode'])   
    
    const deleteTopology =(id,name)=>{
        emits('deleteTopology',id,name)
    }

    watch(p.data, () => {
    useLocalStorage.saveData(p.data)
    }, { deep: true })

    const selectTopology = (id,name) =>{
        emits('selectTopology',id,name)
    }

    const addTopology = () =>{
        if(tName.value.value.length ==0 ||tName.value.value == ""){
             emits('settoast',"Empty Entry","danger")
        }else{
            useLocalStorage.newTopology(p.data,tName.value.value)
        tName.value.value = ""
        emits('settoast',"New Topology Created")
        }
        
    }

    const openSettings =() =>{
        emits('openSettings',true)
    }

    const toggleDarkMode =() =>{
        emits('toggleDarkMode')
    }

    const exportToplogy = (id) =>{
        const topologydata = JSON.stringify(p.data[id]) 
        try {
            navigator.clipboard.writeText(topologydata)
            emits('settoast',"Topology Data CLipboard")   
        } catch (error) {
            emits('settoast',error + ":while clipboard","danger")   
        }
    }
        
    const logout= ()=>{
        ipcRenderer.invoke('logout')
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
            localStorage.setItem('topologyWidth', containerRef.value.offsetWidth)
        }
    }

    onMounted(() => {
        const savedWidth = localStorage.getItem('topologyWidth')
        if (savedWidth && containerRef.value) {
            containerRef.value.style.minWidth = `${savedWidth}px`
            containerRef.value.style.maxWidth = `${savedWidth}px`
        }
    })

    onUnmounted(() => {
        if (containerRef.value) {
            localStorage.setItem('topologyWidth', containerRef.value.offsetWidth)
        }
    })

</script>
<style scoped>
    .container{
        background-color: var(--bs-tertiary-bg);
        padding: 0;
        min-width: 340px;
        max-width: 340px;
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
    
    [data-bs-theme="light"] .png-theme{
        filter: invert(0) brightness(0);
    }
    [data-bs-theme="dark"] .png-theme{
        filter: invert(1) brightness(100%);
    }
</style>    