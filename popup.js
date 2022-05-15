let changeColor = document.getElementById("changeColor");

const GREEN = 'rgb(59 165 59)'
const RED = 'rgb(173 28 28)'


const setButtonColor = function(green_) {
    changeColor.style.backgroundColor = green_
        ? GREEN
        : RED;
};

const setTextColor = function(green_) {
    changeColor.textContent = green_
        ? 'enabled'
        : 'disabled';
};

const addOrRemoveTabId = function(result, tabId) {
    var s = result.tabs;
    var add_ = false
    if (s.includes(tabId)) {
        s = s.filter((el) => el != tabId);
    } else {
        s.push(tabId);
        add_ = true
    }
    chrome.storage.sync.set({ "tabs": s });
    return add_
}

chrome.storage.sync.get(['press', 'tabs', 'times'], async (result) => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id.toString() in result.times) {
        setButtonColor(result.tabs.includes(tab.id))
        setTextColor(result.tabs.includes(tab.id))
    }
})

changeColor.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.storage.sync.get(['press', 'tabs', 'times'], function(result) {

        console.log(result.times);
        if (!result.tabs.includes(tab.id) 
        && !(tab.id.toString() in result.times)) {
            result.times[tab.id.toString()] = -1
            chrome.storage.sync.set({times: result.times})

            const i = createInput(result, tab)

            changeColor.parentNode.replaceChild(i, changeColor);

        } else if (result.tabs.includes(tab.id)) {
            var red = addOrRemoveTabId(result, tab.id);

            setButtonColor(red)
            setTextColor(red)
        } else {

            const i = createInput(result, tab)
            i.value = (Math.floor(result.times[tab.id.toString()] / 60)).toString() 
                + ":" 
                + (result.times[tab.id.toString()] % 60).toString();

            changeColor.parentNode.replaceChild(i, changeColor);
        }
    })
});

function createInput(result, tab) {
    const i = document.createElement("input");
    i.setAttribute('type', "text");
    i.setAttribute('name', "time");
    i.setAttribute('placeholder', "enter time (xx:xx)")
    i.style.width = "170px"
    i.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            shut(i.value, tab.id, result)
            var green_ = addOrRemoveTabId(result, tab.id);

            setButtonColor(green_)
            setTextColor(green_)
            i.parentNode.replaceChild(changeColor, i)
        }
    })
    return i;
}

function shut(text, tabId, result) {
    console.log("shut " + text);
    var st = text.split(":")
    result.times[tabId.toString()] = parseInt(st[0]) * 60 + parseInt(st[1])
    chrome.storage.sync.set({'times': result.times})
}
