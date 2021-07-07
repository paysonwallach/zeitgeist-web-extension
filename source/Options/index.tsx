import { browser, History } from "webextension-polyfill-ts"
import React from "react"
import ReactDOM from "react-dom"
import ProgressBar from "react-progressbar.js"

import { Config } from "Common/Config"
import { OptionsForm } from "Options/OptionsForm"
import optionsStorage from "Common/Options"

const recordVisit = (title: string, url: string, access_time: number): void => {
    browser.runtime.sendMessage(Config.EXTENSION_ID, {
        title: title,
        url: url,
        access_time: access_time,
    })
}

function Options() {
    const progressIndicatorContainer =
        document.getElementById("progress-indicator")!
    const progressIndicator = new ProgressBar.Circle(
        progressIndicatorContainer.id,
        {
            color: "#0060df",
            trailColor: "#eee",
            strokeWidth: 10,
            duration: 1000,
            easing: "easeInOut",
        }
    )

    const filterExcludedUrls = (
        excludeList: string[],
        historyItems: History.HistoryItem[]
    ): Promise<History.HistoryItem[]> => {
        return new Promise((resolve, reject) => {
            resolve(
                historyItems.filter((historyItem) => {
                    if (historyItem.url === undefined) {
                        return false
                    } else {
                        const url = new URL(historyItem.url)

                        return !excludeList
                            .map(
                                (domain) =>
                                    url.hostname
                                        .split(".")
                                        .slice(-2)
                                        .join(".") === domain.trim()
                            )
                            .reduce((result, item) => result || item)
                    }
                })
            )
        })
    }

    const processResults = (options: any, results: History.HistoryItem[]) => {
        console.log(`processing ${results.length} results...`)
        results.forEach((result, idx, results) => {
            if (
                result.url !== undefined &&
                result.visitCount !== undefined &&
                result.visitCount > 1
            ) {
                browser.history
                    .getVisits({
                        url: result.url,
                    })
                    .then((visitItems) => {
                        visitItems.forEach((visitItem) => {
                            if (
                                result.title !== undefined &&
                                result.url !== undefined &&
                                visitItem.visitTime !== undefined
                            ) {
                                recordVisit(
                                    result.title,
                                    result.url,
                                    visitItem.visitTime
                                )
                            }
                        })
                    })
            } else if (
                result.title !== undefined &&
                result.url !== undefined &&
                result.lastVisitTime !== undefined
            ) {
                recordVisit(result.title, result.url, result.lastVisitTime)
            }
            if (options.delete) {
                browser.history.deleteUrl({
                    url: result.url!,
                })
            }
            progressIndicator.animate(idx / results.length - 1)
        })
    }

    const execute = async (options: any) => {
        const excludeList = options.excludelist.split(",")
        const optionsDiv = document.getElementById("options-root")!

        optionsDiv.classList.add("disabled")
        progressIndicatorContainer.style.visibility = "visible"

        await browser.history
            .search({
                text: "",
                startTime: 0,
                maxResults: Number.MAX_SAFE_INTEGER,
            })
            .then((results) => filterExcludedUrls(excludeList, results))
            .then((results) => {
                processResults(options, results)
            })

        progressIndicatorContainer.style.visibility = "hidden"
        optionsDiv.classList.remove("disabled")
    }

    const handleClick = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        optionsStorage.getAll().then(execute)
    }

    return (
        <div id="options-root">
            <OptionsForm />
            <button type="button" onClick={handleClick}>
                Export History
            </button>
        </div>
    )
}

ReactDOM.render(<Options />, document.getElementById("options"))
optionsStorage.syncForm(document.querySelector("form")!)
