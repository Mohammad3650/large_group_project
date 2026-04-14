import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
    createInitialErrors,
    buildGlobalError,
    formatApiError
} from '../../utils/errors.js';

describe('errors utils', () => {
    function mockAxiosError() {
        vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    }

    function mockNonAxiosError() {
        vi.spyOn(axios, 'isAxiosError').mockReturnValue(false);
    }

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('createInitialErrors', () => {
        it('returns an empty frontend error state', () => {
            expect(createInitialErrors()).toEqual({
                fieldErrors: {},
                global: []
            });
        });

        it('returns a fresh object each time', () => {
            const first = createInitialErrors();
            const second = createInitialErrors();

            expect(first).not.toBe(second);
            expect(first.fieldErrors).not.toBe(second.fieldErrors);
            expect(first.global).not.toBe(second.global);
        });
    });

    describe('buildGlobalError', () => {
        it('returns the standard error shape with one global message', () => {
            expect(buildGlobalError('Something failed')).toEqual({
                fieldErrors: {},
                global: ['Something failed']
            });
        });
    });

    describe('formatApiError', () => {
        it('returns a generic global error for non-Axios errors', () => {
            mockNonAxiosError();

            const result = formatApiError(new Error('Something broke'));

            expect(result).toEqual({
                fieldErrors: {},
                global: ['Something went wrong.']
            });
        });

        it('returns a no-response message when the Axios error has no response', () => {
            mockAxiosError();

            const error = {
                response: undefined
            };

            const result = formatApiError(error);

            expect(result).toEqual({
                fieldErrors: {},
                global: ['No response from server.']
            });
        });

        it('returns a no-response message when the Axios error response data is null', () => {
            mockAxiosError();

            const error = {
                response: {
                    data: null
                }
            };

            const result = formatApiError(error);

            expect(result).toEqual({
                fieldErrors: {},
                global: ['No response from server.']
            });
        });

        it('returns the DRF detail message as a global error', () => {
            mockAxiosError();

            const error = {
                response: {
                    data: {
                        detail: 'Invalid token.'
                    }
                }
            };

            const result = formatApiError(error);

            expect(result).toEqual({
                fieldErrors: {},
                global: ['Invalid token.']
            });
        });

        it('treats an object with a non-string detail as regular object errors', () => {
            mockAxiosError();

            const error = {
                response: {
                    data: {
                        detail: ['Invalid token.']
                    }
                }
            };

            const result = formatApiError(error);

            expect(result).toEqual({
                fieldErrors: {
                    detail: ['Invalid token.']
                },
                global: []
            });
        });

        it('maps field errors and non_field_errors correctly', () => {
            mockAxiosError();

            const error = {
                response: {
                    data: {
                        email: ['Email is already in use.'],
                        password: ['Password is too short.'],
                        non_field_errors: ['Unable to log in with provided credentials.']
                    }
                }
            };

            const result = formatApiError(error);

            expect(result).toEqual({
                fieldErrors: {
                    email: ['Email is already in use.'],
                    password: ['Password is too short.']
                },
                global: ['Unable to log in with provided credentials.']
            });
        });

        it('converts non-array field errors into arrays', () => {
            mockAxiosError();

            const error = {
                response: {
                    data: {
                        email: 'Email is required.'
                    }
                }
            };

            const result = formatApiError(error);

            expect(result).toEqual({
                fieldErrors: {
                    email: ['Email is required.']
                },
                global: []
            });
        });

        it('converts non-array non_field_errors into a global error array', () => {
            mockAxiosError();

            const error = {
                response: {
                    data: {
                        non_field_errors: 'General validation failure.'
                    }
                }
            };

            const result = formatApiError(error);

            expect(result).toEqual({
                fieldErrors: {},
                global: ['General validation failure.']
            });
        });

        it('converts unexpected object values to strings inside field errors', () => {
            mockAxiosError();

            const error = {
                response: {
                    data: {
                        email: { message: 'Invalid email.' }
                    }
                }
            };

            const result = formatApiError(error);

            expect(result).toEqual({
                fieldErrors: {
                    email: ['[object Object]']
                },
                global: []
            });
        });

        it('returns a fallback global error when the response object is empty', () => {
            mockAxiosError();

            const error = {
                response: {
                    data: {}
                }
            };

            const result = formatApiError(error);

            expect(result).toEqual({
                fieldErrors: {},
                global: ['Request failed.']
            });
        });

        it('returns a string response as a global error', () => {
            mockAxiosError();

            const error = {
                response: {
                    data: 'Server unavailable.'
                }
            };

            const result = formatApiError(error);

            expect(result).toEqual({
                fieldErrors: {},
                global: ['Server unavailable.']
            });
        });

        it('returns a fallback global error for numeric primitive response data', () => {
            mockAxiosError();

            const error = {
                response: {
                    data: 500
                }
            };

            const result = formatApiError(error);

            expect(result).toEqual({
                fieldErrors: {},
                global: ['Request failed.']
            });
        });

        it('returns a fallback global error for boolean primitive response data', () => {
            mockAxiosError();

            const error = {
                response: {
                    data: false
                }
            };

            const result = formatApiError(error);

            expect(result).toEqual({
                fieldErrors: {},
                global: ['No response from server.']
            });
        });
    });
});