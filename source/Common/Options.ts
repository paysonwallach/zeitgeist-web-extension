import OptionsSync from "webext-options-sync"

export default new OptionsSync({
    defaults: {
        excludelist: "",
        delete: false,
    },
})
