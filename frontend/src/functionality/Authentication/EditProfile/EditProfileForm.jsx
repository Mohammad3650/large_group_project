import AuthField from '../AuthComponents/AuthField.jsx';
import profileFormFields from '../utils/FormFields/profileFormFields.js';
import AuthSubmitButton from '../AuthComponents/AuthSubmitButton.jsx';

function EditProfileForm({
    formData,
    errors,
    isSaving,
    onFieldChange,
    onSubmit,
    onChangePassword,
    onDeleteAccount
}) {
    return (
        <form onSubmit={onSubmit} noValidate>
            <div className="row g-3">
                {profileFormFields.map((field) => (
                    <div
                        key={field.name}
                        className={field.wrapperClassName}
                    >
                        <AuthField
                            name={field.name}
                            label={field.label}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formData[field.name]}
                            onChange={(value) =>
                                onFieldChange(
                                    field.name,
                                    value
                                )
                            }
                            error={
                                errors.fieldErrors[
                                    field.name
                                ]
                            }
                        />
                    </div>
                ))}
            </div>

            <div className="d-grid gap-2 mt-4">
                <AuthSubmitButton
                    loading={isSaving}
                    text="Save Changes"
                    loadingText="Saving..."
                />

                <button
                    type="button"
                    className="btn btn-dark btn-lg rounded-3"
                    onClick={onChangePassword}
                >
                    Change Password
                </button>

                <button
                    type="button"
                    className="btn btn-danger btn-lg rounded-3"
                    aria-label="Delete your account permanently"
                    onClick={onDeleteAccount}
                >
                    Delete Account
                </button>
            </div>
        </form>
    );
}

export default EditProfileForm;
