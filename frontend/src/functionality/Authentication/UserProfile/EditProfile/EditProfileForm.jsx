import AuthField from '../../../../components/AuthField.jsx';
import profileFormFields from '../../utils/profileFormFields.js';

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
                    <div key={field.name} className={field.wrapperClassName}>
                        <AuthField
                            name={field.name}
                            label={field.label}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formData[field.name]}
                            onChange={(value) => onFieldChange(field.name, value)}
                            error={errors.fieldErrors[field.name]}
                        />
                    </div>
                ))}
            </div>

            <div className="d-grid gap-2 mt-4">
                <button
                    type="submit"
                    className="btn btn-dark rounded-3"
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                    type="button"
                    className="btn btn-dark rounded-3"
                    onClick={onChangePassword}
                >
                    Change Password
                </button>

                <button
                    type="button"
                    className="btn btn-danger rounded-3"
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