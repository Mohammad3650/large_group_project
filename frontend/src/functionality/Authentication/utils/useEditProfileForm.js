import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createEmptyProfileErrors,
    buildGlobalProfileError,
    mapProfileFieldErrors
} from './profileErrorState';
import {
    createEmptyProfileFormData,
    fetchProfileFormData,
    saveProfileFormData,
    deleteProfileAccount
} from './profileService';

const MESSAGES = {
    loadFailed: 'Failed to load profile details.',
    saveFailed: 'Failed to update profile.',
    saveSuccess: 'Profile updated successfully.',
    deleteFailed: 'Failed to delete account.',
    deleteConfirmation: 'Are you sure you want to delete your account?'
};

function isUnauthorizedError(error) {
    return error?.response?.status === 401;
}

function useEditProfileForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(createEmptyProfileFormData);
    const [errors, setErrors] = useState(createEmptyProfileErrors);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            try {
                const loadedFormData = await fetchProfileFormData();
                setFormData(loadedFormData);
            } catch (error) {
                if (isUnauthorizedError(error)) {
                    navigate('/login');
                    return;
                }

                setErrors(buildGlobalProfileError(MESSAGES.loadFailed));
            } finally {
                setIsLoading(false);
            }
        }

        loadProfile();
    }, [navigate]);

    function updateField(name, value) {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    function clearFeedback() {
        setErrors(createEmptyProfileErrors());
        setSuccessMessage('');
    }

    function goToChangePassword() {
        navigate('/change-password');
    }

    function handleSaveError(error) {
        if (isUnauthorizedError(error)) {
            navigate('/login');
            return;
        }

        const responseData = error?.response?.data;

        if (responseData && typeof responseData === 'object') {
            setErrors(mapProfileFieldErrors(responseData));
            return;
        }

        setErrors(buildGlobalProfileError(MESSAGES.saveFailed));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (isSaving) {
            return;
        }

        setIsSaving(true);
        clearFeedback();

        try {
            const updatedFormData = await saveProfileFormData(formData);
            setFormData(updatedFormData);
            setSuccessMessage(MESSAGES.saveSuccess);
        } catch (error) {
            handleSaveError(error);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteAccount() {
        const confirmed = window.confirm(MESSAGES.deleteConfirmation);

        if (!confirmed) {
            return;
        }

        try {
            await deleteProfileAccount();
            localStorage.clear();
            window.location.href = '/';
        } catch {
            setErrors(buildGlobalProfileError(MESSAGES.deleteFailed));
        }
    }

    return {
        formData,
        errors,
        successMessage,
        isLoading,
        isSaving,
        updateField,
        handleSubmit,
        handleDeleteAccount,
        goToChangePassword
    };
}

export default useEditProfileForm;