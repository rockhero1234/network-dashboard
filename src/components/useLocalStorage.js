import ShortUniqueId from 'short-unique-id';
const uid = new ShortUniqueId();

const conns = {};

const getDefaultConnections = () => {
  return [];
};

const defaultSetting = {
    adminpass: "12345678",
    mails: [],
    packets: "4",
    packettimeout: "2",
    pingtimeout: "5000",
    defaultConnections: getDefaultConnections(),
    customConnections: []
};

const newNode = (data, topology, name, ip, type, detail, x, y) => {
    let id = uid.rnd()
    data[topology].nodes[id] = { name, type, ip, detail }
    data[topology].positions['nodes'][id] = { x, y }
    data[topology].autoping[id] = false
}

const getNode = (topology, id) => {
    let data = JSON.parse(localStorage.getItem('topologies'))
    return data[topology].nodes[id]
}

const deleteNode = (data, topology, id) => {
    delete data[topology].nodes[id]
    deleteBothConnection(data, topology, id)
    deletePosition(data, topology, id)
}

const updateNode = (data, topology, id, updatedNode) => {
    data[topology].nodes[id] = updatedNode
}

const getData = async () => {
    const data = JSON.parse(localStorage.getItem("topologies"))
    return data || {}
}

const saveData = async (data) => {
    localStorage.setItem("topologies", JSON.stringify(data))
}

const addConnection = (data, topology, source, target, connType, settings) => {
    const id = uid.rnd()
    // Get connection details from settings
    const allConnections = [...(settings.defaultConnections || []), ...(settings.customConnections || [])]
    const connDetails = allConnections.find(c => c.id === connType)
    
    const newConn = { 
        source, 
        target, 
        connTypeId: connType // Store only the ID reference
    }
    if(!data[topology]['connection']) data[topology]['connection'] = {}
    data[topology]['connection'][id] = newConn
}

const deleteBothConnection = (data, topology, id) => {
    Object.entries(data[topology].connection).filter(([_, conn]) => conn.target == id || conn.source == id).map(([key]) => {
        delete data[topology].connection[key]
    })
}

const deleteConnection = (data, topology, id) => {
    Object.entries(data[topology].connection).filter(([_, conn]) => conn.target == id).map(([key]) => {
        delete data[topology].connection[key]
    })
}

const deletePosition = (data, topology, id) => {
    delete data[topology].positions.nodes[id]
}

const changeAutoPing = (data, topology, id) => {
    data[topology].autoping[id] = !data[topology].autoping[id]
}

const newTopology = (data, topologyName) => {
    const id = uid.rnd()
    let topology
    if (topologyName.trim().startsWith("{")) {
        topology = JSON.parse(topologyName)
        if (!('autoping' in topology)) topology['autoping'] = {}
        if (!('connection' in topology)) topology['connection'] = {}
        if (!('nodes' in topology)) topology['nodes'] = {}
        if (!('positions' in topology)) {
            topology['positions'] = { nodes: {} }
        }
    } else {
        topology = {
            name: topologyName,
            nodes: {},
            connection: {},
            positions: { nodes: {} },
            autoping: {}
        }
    }
    data[id] = topology
}

const deleteTopology = (data, id) => {
    delete data[id]
}

const updateTopologyName = (data, topology, name) => {
    data[topology].name = name
}

const pingDataChange = (pingData, id, value) => {
    if (value) {
        pingData[id] = "..."
    } else {
        delete pingData[id]
    }
}

const getSettings = async () => {
    const settings = JSON.parse(localStorage.getItem("settings"))
    if (settings?.mails) {
        if (!settings.defaultConnections) settings.defaultConnections = getDefaultConnections()
        if (!settings.customConnections) settings.customConnections = []
        return settings
    } else {
        const newSettings = settings || defaultSetting
        if (!newSettings.mails) newSettings.mails = []
        if (!newSettings.defaultConnections) newSettings.defaultConnections = getDefaultConnections()
        if (!newSettings.customConnections) newSettings.customConnections = []
        localStorage.setItem("settings", JSON.stringify(newSettings))
        return newSettings
    }
}

const updateSettings = (settingsdata, type, value) => {
    if (type == "password") {
        settingsdata["adminpass"] = value
    } else if (type == "addmail") {
        settingsdata.mails.push(value)
    } else if (type == "removemail") {
        settingsdata.mails = settingsdata.mails.filter(val => val !== value)
    } else if (type == "updatepinginfo") {
        settingsdata['packets'] = value.packets
        settingsdata['packettimeout'] = value.packettimeout
        settingsdata['pingtimeout'] = value.pingtimeout
    } else if (type == "updatedefaultconnection") {
        const conn = settingsdata.defaultConnections.find(c => c.id === value.id)
        if (conn) {
            conn.label = value.label
            conn.color = value.color
        }
    } else if (type == "removedefaultconnection") {
        settingsdata.defaultConnections = settingsdata.defaultConnections.filter(c => c.id !== value)
    } else if (type == "addconnection") {
        const newId = String(Math.max(...settingsdata.defaultConnections.map(c => parseInt(c.id)), ...settingsdata.customConnections.map(c => parseInt(c.id || 0))) + 1)
        settingsdata.customConnections.push({ ...value, id: newId, isDefault: false })
    } else if (type == "updatecustomconnection") {
        const conn = settingsdata.customConnections[value.idx]
        if (conn) {
            conn.label = value.label
            conn.color = value.color
        }
    } else if (type == "removeconnection") {
        settingsdata.customConnections = settingsdata.customConnections.filter((_, idx) => idx !== value)
    }
}

const pushUpdateSettings = async (settings) => {
    localStorage.setItem('settings', JSON.stringify(settings))
}

const serverDownEmailed = async () => {
    const serverdowndata = JSON.parse(localStorage.getItem('serverdown'))
    if (serverdowndata) {
        return serverdowndata
    } else {
        localStorage.setItem('serverdown', JSON.stringify([]))
        return []
    }
}

const serverDownEmailedAdd = async (data) => {
    localStorage.setItem('serverdown', JSON.stringify(data))
}

const getConnectionDetails = (connTypeId, settings) => {
    const allConnections = [...(settings.defaultConnections || []), ...(settings.customConnections || [])]
    const conn = allConnections.find(c => c.id === connTypeId)
    return conn || { label: 'Unknown', color: '#999999' }
}

export default {
    newNode, addConnection, newTopology, deleteNode, updateNode, deleteConnection, 
    getData, saveData, getNode, deleteTopology, updateTopologyName, changeAutoPing, 
    pingDataChange, getSettings, serverDownEmailed, serverDownEmailedAdd, 
    updateSettings, pushUpdateSettings, getConnectionDetails
}
