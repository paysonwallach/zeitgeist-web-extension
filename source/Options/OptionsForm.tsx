import React from "react"

export const OptionsForm: React.FC = () => {
    return (
        <form>
            <label htmlFor="excludelist">
                Ignore pages from the following domains:
            </label>
            <br />
            <textarea
                id="excludelist"
                name="excludelist"
                spellCheck="false"
                autoComplete="off"
                rows={5}
            />
            <br />
            <label htmlFor="delete">
                <input type="checkbox" name="delete" />
                Delete history items on export
            </label>
        </form>
    )
}
