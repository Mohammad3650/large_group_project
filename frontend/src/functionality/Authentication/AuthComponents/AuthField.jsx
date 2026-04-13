import '../stylesheets/AuthComponents/AuthField.css';

/**
 * Reusable input field component for authentication forms.
 *
 * Responsibilities:
 * - renders a label and input element
 * - supports different input types
 * - displays validation styling when an error exists
 * - shows an inline error message below the input
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Text shown in the field label
 * @param {string} [props.type="text"] - HTML input type
 * @param {string} props.placeholder - Placeholder text shown inside the input
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Called when the input value changes
 * @param {string} [props.error] - Validation message for the field
 * @param {string} props.name - Input name and id used for accessibility
 * @returns {JSX.Element} Reusable authentication input field
 */

function AuthField({ label, type = 'text', placeholder, value, onChange, error, name }) {
    const inputClass = `form-control auth-input ${error ? 'is-invalid' : ''}`;

    function handleChange(e) {
        onChange(e.target.value);
    }

    return (
        <div className="col-12">
            <label htmlFor={name} className="form-label fw-semibold auth-label">
                {label}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                className={inputClass}
                value={value}
                onChange={handleChange}
            />

            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
}

export default AuthField;
