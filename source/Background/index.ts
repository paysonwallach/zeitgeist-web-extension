import { browser, Runtime } from "webextension-polyfill-ts"
import { v4 as uuidv4 } from "uuid"

import { Lazy } from "Utils/Lazy"
import { Config } from "Common/Config"
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
            const url = new URL(message.url)

            if (
                excludeList
                    .map(
                        (domain) =>
                            url.hostname.split(".").slice(-2).join(".") !==
                            domain.trim()
                    )
                    .reduce((result, item) => result || item)
            ) {
                hostConnector.instance.postMessage({
                    apiVersion: 1,
                    id: uuidv4(),
                    data: message,
                })
            }
        },
        (error) => console.log(error)
    )
})

browser.history.onVisited.addListener((result) => {
    browser.tabs.executeScript({
        file: "contentScript.js",
    })
})
