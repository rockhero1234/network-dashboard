import ShortUniqueId from 'short-unique-id';
const uid = new ShortUniqueId();

const conns = {
  1: { label: "ofc single fiber mode - module", color: "#FFC107" },
  2: { label: "ofc single fiber mode - media convertor", color: "#FFC107" },
  3: { label: "ofc multi mode mode - module", color: "#20C997" },
  4: { label: "ofc multi mode mode - module", color: "#20C997" },
  5: { label: "utp", color: "#0d6efd" },
  6: { label: "wireless ap", color: "#6610f2" }
};

const defaultSetting = {
    adminpass: "12345678",
    mails: [],
    packets: "4",
    packettimeout: "2",
    pingtimeout: "5000"
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

const addConnection = (data, topology, source, target, connType) => {
    const id = uid.rnd()
    const newConn = { source, target, label: conns[connType].label, color: conns[connType].color }
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
        return settings
    } else {
        const newSettings = settings || defaultSetting
        if (!newSettings.mails) newSettings.mails = []
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

export default {
    newNode, addConnection, newTopology, deleteNode, updateNode, deleteConnection, 
    getData, saveData, getNode, deleteTopology, updateTopologyName, changeAutoPing, 
    pingDataChange, getSettings, serverDownEmailed, serverDownEmailedAdd, 
    updateSettings, pushUpdateSettings
}
