let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  chrome.storage.sync.set({ "press": false })
  chrome.storage.sync.set({ "tabs": [] })
  chrome.storage.sync.set({ "times": {} })
});

setInterval(async () => {
    chrome.storage.sync.get(['tabs', 'times'], function(result) {
        result.tabs.forEach((tabId) => {
            console.log("updating for " + tabId);
            try {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    function: checkTime,
                    args: [result.times[tabId.toString()]],
                });
            } catch (e) {
                console.error(e);
            }
        })
    })
}, 10000)

async function getTabs() {
    chrome.storage.sync.get(['tabs'], function(result) {
        console.log('tabs = ' + JSON.stringify(result.tabs))
    })
}


function checkTime(timeDiff) {
    try {
        let innerDoc = document.querySelector("#videoFrame").contentWindow.document
        let currTimeDiv = "#main-video > div.vjs-control-bar > div.vjs-current-time.vjs-time-controls.vjs-control > div"
        let fullTimeDiv = "#main-video > div.vjs-control-bar > div.vjs-duration.vjs-time-controls.vjs-control > div"

        let currTimeParts = innerDoc.querySelector(currTimeDiv).innerHTML.split(" ")[3].split(":")
        let fullTimeParts = innerDoc.querySelector(fullTimeDiv).innerHTML.split(" ")[2].split(":")

        let currTime = parseInt(currTimeParts[0]) * 60 + parseInt(currTimeParts[1])
        let fullTime = parseInt(fullTimeParts[0]) * 60 + parseInt(fullTimeParts[1])

        // console.log('Time until the end ' + (fullTime - currTime) + 'ms')
        if ((fullTime - currTime) < timeDiff && fullTime != 0) {
            console.log('time updated!')
            let nextButton = document.querySelector("body > div.body-container > div > div > div > div.col.s12.m8.l9.col-even > div:nth-child(3) > div > div.m-select-sibling-episode > a:nth-child(2)")
            nextButton.click()
            setTimeout(() => {
                let playButton = document.querySelector("#videoFrame").contentWindow.document.querySelector("#main-video > div.vjs-big-play-button");
                playButton.click();
            }, 2 * 1000);
        }
    } catch (e) {
        console.error(e)
    }
}
