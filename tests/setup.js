globalThis.alert = globalThis.alert || (() => {})
globalThis.confirm = globalThis.confirm || (() => true)
globalThis.prompt = globalThis.prompt || (() => '')
document.execCommand = document.execCommand || (() => true)
