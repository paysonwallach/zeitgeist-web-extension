import { browser } from "webextension-polyfill-ts"

import { Config } from "Common/Config"
import logs from "Common/Logging"

const recordVisit = () => {
    browser.runtime.sendMessage(Config.EXTENSION_ID, {
        title: document.title,
        url: document.URL,
        mime_type: document.contentType,
        access_time: Date.now(),
    })
    logs.info(`recorded visit to ${document.URL}`)
}

if (document.title) {
    recordVisit()
} else {
    const observer = new MutationObserver(() => {
        if (document.title) {
            recordVisit()
        }
        observer.disconnect()
    })
    observer.observe(document.querySelector("title") as Node, {
        subtree: true,
        characterData: true,
        childList: true,
    })
    logs.debug(`observing title of ${document.URL}`)
}
