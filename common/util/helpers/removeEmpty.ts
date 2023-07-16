export const _removeEmpty = (obj: object) => {
    return Object.keys(obj)
        .filter(k => obj[k] !== null) // Remove undef. and null.
        .reduce(
            (newObj, k) =>
                typeof obj[k] === "object"
                    ? { ...newObj, [k]: _removeEmpty(obj[k]) } // Recursive.
                    : { ...newObj, [k]: obj[k] }, // Copy value.
            {}
        );
}