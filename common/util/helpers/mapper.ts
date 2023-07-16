import { IsString, ValidateNested, IsNotEmpty, Validator } from "class-validator";

export const map = (json: object, requestObject) => {
    for (const key in json) {
        requestObject[key] = json[key];
    }

    return requestObject;
}

export const mapResponseToDto = (json: object, ommitKeys: string[] = [], requestObject) => {
    const validator = new Validator();
    for (const key in json) {
        if (ommitKeys.indexOf(key) != -1) {
            continue;
        }
        requestObject[key] = json[key];
    }
    return requestObject;
}

export const mapRequestToDto = (json: object, requestSchema: object, returnObject) => {

    const validator = new Validator();
    for (const key in requestSchema) {
        if (validator.isEmpty(json[key])) {
            continue;
        }
        const objectKey = requestSchema[key];
        if (typeof objectKey === "object") {
            //the objects key should be the same and the request schema no mapping is possible
            returnObject[key] = mapNestedObject(json[key], objectKey);
        }
        returnObject[objectKey] = json[key];
    }
    return returnObject;
}

const mapNestedObject = (nestedJson: object, nestedSchema: object) => {
    const returnObject = {};
    const validator = new Validator();
    for (const key in nestedSchema) {
        if (validator.isEmpty(nestedJson[key])) {
            continue;
        }
        const objectKey = nestedSchema[key];
        returnObject[objectKey] = nestedJson[key];
    }
    return returnObject;
}