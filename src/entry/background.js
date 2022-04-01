const tabs = {};
const inspectFile = 'content.js';
// const serviceHost = "http://0.0.0.0:8888"
const serviceHost = "http://host.docker.internal:8888"

//TODO 去掉icon逻辑
const inspect = {
    toggleActivate: (id, type) => {
        console.log(type)
        chrome.scripting.executeScript({
            target: {tabId: id},
            files: [inspectFile]
        });
        //向tab去传递信息
        chrome.tabs.sendMessage(id, {action: type})
    }
};


function isSupportedProtocolAndFileType(urlString) {
    if (!urlString) {
        return false;
    }
    const supportedProtocols = ['https', 'http:', 'file:'];
    const notSupportedFiles = ['xml', 'pdf', 'rss'];
    const extension = urlString.split('.').pop().split(/\\#|\?/)[0];
    return supportedProtocols.indexOf(urlString.substring(0, 5)) !== -1 && notSupportedFiles.indexOf(extension) === -1;
}

function toggle(tab) {
    if (isSupportedProtocolAndFileType(tab.url)) {
        if (!tabs[tab.id]) {
            tabs[tab.id] = Object.create(inspect);
            inspect.toggleActivate(tab.id, 'activate');
        } else {
            inspect.toggleActivate(tab.id, 'deactivate');
            for (const tabId in tabs) {
                if (tabId === tab.id.toString()) delete tabs[tabId];
            }
        }
    }
}

function deactivateItem(tab) {
    if (tab[0]) {
        if (isSupportedProtocolAndFileType(tab[0].url)) {
            for (const tabId in tabs) {
                if (tabId === tab[0].id.toString()) {
                    delete tabs[tabId];
                    inspect.toggleActivate(tab[0].id, 'deactivate');
                }
            }
        }
    }
}

function getActiveTab() {
    chrome.tabs.query({active: true, currentWindow: true}, tab => {
        deactivateItem(tab);
    });
}

//TODO socketIO 替代数据传递
// eslint-disable-next-line
function reportXpathData(xpathData, dockerName, location, iframe) {
    // TODO 这个是Docker的host
    const Url = `${serviceHost}/web-docker/recording`;
    fetch(Url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({xpathData: xpathData, dockerName: dockerName, location: location, iframe: iframe})
    }).then(rep => {
        console.log(rep)
    })
}

// eslint-disable-next-line no-unused-vars
function recordingCheck() {
    // TODO 这个是Docker的host

    // const Url = "http://host.docker.internal:8888/web-docker/recording";
    // const dockerName = chrome.storage.sync.get("dockerName")
    const dockerName = "gz"
    if (dockerName) {
        const Url = `${serviceHost}/web-docker/recording?dockerName=${dockerName}`;
        fetch(Url, {
            method: 'GET',
        }).then(rep => {
            console.log(rep)
        })
    }
}


//TODO socketIO 替代开关
// 快捷键事件监听
chrome.commands.onCommand.addListener(command => {
    if (command === 'toggle-xpath') {
        chrome.tabs.query({active: true, currentWindow: true}, tab => {
            console.log("toggle-xpath", tab)
            toggle(tab[0]);
        });
    }
});
// tab刷新变化
chrome.tabs.onUpdated.addListener(() => {
    getActiveTab()
});

// 点击ICON开启
chrome.action.onClicked.addListener(tab => {
    toggle(tab)
});


//获取Xpath
chrome.storage.onChanged.addListener((changes) => {
    let xpath = null
    let dockerName = null
    let location = null
    let iframe = null
    for (let [key, {newValue}] of Object.entries(changes)) {
        if (key === 'xpath') {
            xpath = newValue
        }
        if (key === 'dockerName') {
            dockerName = newValue
        }
        if (key === 'location') {
            location = newValue
        }
        if (key === 'iframe') {
            iframe = newValue
        }
    }
    if (dockerName && xpath) {
        reportXpathData(xpath, dockerName, location, iframe)
    }

});
