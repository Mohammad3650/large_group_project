import AuthCard from '../AuthComponents/AuthCard.jsx';
import EditProfileForm from './EditProfileForm.jsx';
import StatusAlerts from '../AuthComponents/StatusAlert.jsx';
import useEditProfileForm from '../utils/Hooks/useEditProfileForm.js';

function EditProfile() {
    const {
        formData,
        errors,
        successMessage,
        isLoading,
        isSaving,
        updateField,
        handleSubmit,
        handleDeleteAccount,
        goToChangePassword
    } = useEditProfileForm();

    if (isLoading) {
        return (
            <AuthCard
                title="Edit Profile"
                subtitle="Update your account details"
                footerText="Back to"
                footerLinkText="Dashboard"
                footerLinkTo="/dashboard"
            >
                <p className="text-center mb-0">
                    Loading profile...
                </p>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title="Edit Profile"
            subtitle="Update your account details"
            footerText="Back to"
            footerLinkText="Settings"
            footerLinkTo="/settings"
        >
            <StatusAlerts
                errors={errors}
                successMessage={successMessage}
            />

            <EditProfileForm
                formData={formData}
                errors={errors}
                isSaving={isSaving}
                onFieldChange={updateField}
                onSubmit={handleSubmit}
                onChangePassword={goToChangePassword}
                onDeleteAccount={handleDeleteAccount}
            />
        </AuthCard>
    );
}

export default EditProfile;
