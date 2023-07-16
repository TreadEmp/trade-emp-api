export const _removeEmpty = (obj) => {
    Object.entries(obj).forEach(([key, val]) =>
        (val && typeof val === 'object') && _removeEmpty(val) ||
        (val === null || val === "") && delete obj[key]
    );
    return obj;
};

export const _clearEmpties = (obj) => {
    const object = Object.assign({}, obj);
    for (const k in object) {
        if (!object[k] || typeof object[k] !== "object") {
            continue // If null or not an object, skip to the next iteration
        }

        // The property is an object
        _clearEmpties(object[k]); // <-- Make a recursive call on the nested object
        if (Object.keys(object[k]).length === 0) {
            delete object[k]; // The object had no properties, so delete that property
        }
    }
    return object;
}