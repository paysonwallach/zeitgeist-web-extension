import normalizeUrl from "normalize-url"
import { browser, Runtime } from "webextension-polyfill-ts"

import { Lazy } from "Utils/Lazy"
import { Config } from "Common/Config"
import { InsertEventsRequest, Subject, Event } from "Common/Protocol"
import optionsStorage from "Common/Options"

const hostConnector = new Lazy<Runtime.Port>(() =>
    browser.runtime.connectNative(Config.HOST_CONNECTOR_ID)
)

const getExcludeList = async (): Promise<string[]> => {
    return (await optionsStorage.getAll()).excludelist.split(",")
}

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

browser.history.onTitleChanged.addListener(async (changed) => {
    try {
        const excludeList = await getExcludeList()
        const url = new URL(changed.url)
        if (
            excludeList
                .map(
                    (domain) =>
                        url.hostname.split(".").slice(-2).join(".") !==
                        domain.trim()
                )
                .reduce((result, item) => result || item)
        ) {
            const normalizedUrl = normalizeUrl(changed.url)
            const subject = new Subject(
                undefined,
                undefined,
                "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Website",
                getManifestation(normalizedUrl),
                undefined,
                getOrigin(normalizedUrl),
                "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#WebDataObject",
                changed.title,
                normalizedUrl
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
            hostConnector.instance.postMessage(new InsertEventsRequest([event]))
        }
    } catch (error) {
        console.log(error)
    }
})
