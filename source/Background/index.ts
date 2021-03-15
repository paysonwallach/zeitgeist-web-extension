import { browser, Runtime } from "webextension-polyfill-ts"

import { Lazy } from "Utils/Lazy"
import { Config } from "Common/Config"
import { InsertEventsRequest } from "Common/Protocol"
import optionsStorage from "Common/Options"

const getExcludeList = async (): Promise<string[]> => {
    return (await optionsStorage.getAll()).excludelist.split(",")
}

const hostConnector = new Lazy<Runtime.Port>(() =>
    browser.runtime.connectNative(Config.HOST_CONNECTOR_ID)
)

browser.runtime.onMessage.addListener((message, sender) => {
    if (sender.id != Config.EXTENSION_ID) return

    getExcludeList().then(
        (excludeList) => {
            const url = new URL(message.subjects[0].uri)
            if (
                excludeList
                    .map(
                        (domain) =>
                            url.hostname.split(".").slice(-2).join(".") !==
                            domain.trim()
                    )
                    .reduce((result, item) => result || item)
            )
                hostConnector.instance.postMessage(
                    new InsertEventsRequest([message])
                )
        },
        (error) => console.log(error)
    )
})

browser.history.onVisited.addListener(() => {
    browser.tabs.executeScript({
        file: "contentScript.js",
    })
})
