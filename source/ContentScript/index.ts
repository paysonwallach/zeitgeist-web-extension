import { browser } from "webextension-polyfill-ts"

import { Config } from "Common/Config"
import logs from "Common/Logging"
import { Subject, Event } from "Common/Protocol"

const getManifestation = (uri: string): string => {
    const components = uri.split("://", 2)

    if (components[0] == "file") return uri.substr(0, uri.lastIndexOf("/") + 1)
    else return `${components[0]}://${components[1].split("/")[0]}`
}
const getOrigin = (uri: string): string => {
    const components = uri.split("://", 2)

    if (components[0] == "file")
        return "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject"
    else if (components[0] == "http" || components[0] == "https")
        return "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#WebDataObject"
    else
        return "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#RemoteDataObject"
}
const recordVisit = () => {
    const uri = document.URL
    const subject = new Subject(
        undefined,
        undefined,
        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Website",
        getManifestation(uri),
        document.contentType,
        getOrigin(uri),
        "net",
        document.title,
        uri
    )
    const event = new Event(
        [subject],
        Date.now(),
        0,
        "application://firefox.desktop",
        "http://www.zeitgeist-project.com/ontologies/2010/01/27/zg#AccessEvent",
        "http://www.zeitgeist-project.com/ontologies/2010/01/27/zg#UserActivity",
        undefined,
        undefined
    )
    browser.runtime.sendMessage(Config.EXTENSION_ID, event)
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
