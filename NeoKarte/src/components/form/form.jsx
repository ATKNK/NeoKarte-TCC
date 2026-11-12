import './form.css';

function Form({
    title,
    fields,
    values,
    onChange,
    onSubmit,
    submitLabel,
    submittingLabel = 'Salvando...',
    isSubmitting = false,
    error,
    success,
    className = '',
    formClassName = '',
    buttonClassName = '',
    errorClassName = '',
    successClassName = '',
}) {
    function renderField(field) {
        const value = values[field.name] ?? (field.type === 'checkbox' ? false : '');
        const isDisabled = isSubmitting || field.disabled;
        const commonProps = {
            id: field.id,
            name: field.name,
            disabled: isDisabled,
            required: field.required,
            onChange: (event) => onChange(
                field.name,
                field.type === 'checkbox' ? event.target.checked : event.target.value
            ),
        };

        if (field.type === 'checkbox') {
            return (
                <div className='formField' key={field.name}>
                    <label className={field.labelClassName ?? ''} htmlFor={field.id}>
                        <input
                            {...commonProps}
                            type='checkbox'
                            checked={Boolean(value)}
                        />
                        {field.label}
                    </label>
                    {field.message && (
                        <p className={field.messageClassName} role={field.messageRole ?? 'status'}>
                            {field.message}
                        </p>
                    )}
                </div>
            );
        }

        let input;
        if (field.type === 'select') {
            input = (
                <select {...commonProps} value={value}>
                    {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        } else {
            input = (
                <input
                    {...commonProps}
                    type={field.type ?? 'text'}
                    value={value}
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                />
            );
        }

        return (
            <div className='formField' key={field.name}>
                <label className={field.labelClassName ?? ''} htmlFor={field.id}>
                    {field.label}
                </label>
                {input}
                {field.message && (
                    <p className={field.messageClassName} role={field.messageRole ?? 'status'}>
                        {field.message}
                    </p>
                )}
            </div>
        );
    }

    return (
        <section className={`formMain ${className}`.trim()}>
            {title && <h2>{title}</h2>}
            <form className={`formForm ${formClassName}`.trim()} onSubmit={onSubmit}>
                {fields.map(renderField)}
                <button className={buttonClassName} type='submit' disabled={isSubmitting}>
                    {isSubmitting ? submittingLabel : submitLabel}
                </button>
                {error && <p className={errorClassName} role='alert'>{error}</p>}
                {success && <p className={successClassName} role='status'>{success}</p>}
            </form>
        </section>
    );
}

export default Form;
