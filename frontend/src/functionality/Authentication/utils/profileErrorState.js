export function createEmptyProfileErrors() {
    return {
        fieldErrors: {},
        global: []
    };
}

export function buildGlobalProfileError(message) {
    return {
        fieldErrors: {},
        global: [message]
    };
}

export function mapProfileFieldErrors(data) {
    const fieldErrors = {};

    for (const [field, value] of Object.entries(data)) {
        fieldErrors[field] = Array.isArray(value) ? value[0] : String(value);
    }

    return {
        fieldErrors,
        global: []
    };
}