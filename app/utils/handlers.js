export function onEnterKeyDown(e, callback) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        if (callback) callback(e);
    }
}
