function AuthField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  name,
}) {
  const inputClass = `form-control ${error ? "is-invalid" : ""}`;

  return (
    <div className="col-12">
      <label htmlFor={name} className="form-label fw-semibold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

export default AuthField; 