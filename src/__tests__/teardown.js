module.exports = async function () {
    await globalThis.APP.close();
    await globalThis.CLIENT.end()
}