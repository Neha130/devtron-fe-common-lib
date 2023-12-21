import { CustomInputProps } from './Types'
import { ReactComponent as Info } from '../../Assets/Icon/ic-info-filled.svg'
import { ReactComponent as ErrorIcon } from '../../Assets/Icon/ic-warning.svg'

export function CustomInput({
    name,
    value,
    error,
    onChange,
    onFocus = (e) => {},
    label,
    type = 'text',
    disabled = false,
    labelClassName = '',
    placeholder = '',
    tabIndex = 1,
    dataTestid = '',
    isRequiredField = false,
    autoFocus = false,
    rootClassName = '',
    autoComplete = 'off',
    helperText = '',
    handleOnBlur,
    readOnly = false,
    noTrim = false,
    ref,
    onKeyPress,
    defaultValue,
    onKeyDown,
    required,
    additionalErrorInfo
}: CustomInputProps) {

    function handleError(error: any): any[] {
        if (!Array.isArray(error)) {
            return [error]
        }
        return error
    }

    const onBlur = (event) => {
        //NOTE: This is to prevent the input from being trimmed when the user do not want to trim the input
        if (!noTrim) {
            event.stopPropagation()
            event.target.value = event.target.value?.trim()
            onChange(event)
        }
        if (typeof handleOnBlur === 'function') {
            handleOnBlur(event)
        }
    }

    const renderFormErrorWithIcon = (error: string) => {
        return (
            <div className="form__error" key={error}>
                <ErrorIcon className="form__icon form__icon--error" />
                {error}
                {typeof additionalErrorInfo === 'function' && additionalErrorInfo()}
            </div>
        )
    }

    const getInputError = () => {
        if (!error?.length) {
            return null
        } else {
            if (typeof error === 'object') {
                return handleError(error).map((err: string) => renderFormErrorWithIcon(err))
            }
            return renderFormErrorWithIcon(error)
        }
    }

    const renderInputLabelConditionally = () => {
        if (typeof label === 'string') {
            return <span className={`${isRequiredField ? 'dc__required-field' : ''}`}>{label}</span>
        } else {
            return label
        }
    }

    const renderInputLabel = () => {
        if (!label) {
            return null
        } else {
            return (
                <label className={`form__label ${labelClassName}`} data-testid={`label-${dataTestid}`}>
                    {renderInputLabelConditionally()}
                </label>
            )
        }
    }

    return (
        <div className="flex column left top">
           {renderInputLabel()}
            <input
                data-testid={dataTestid}
                type={type}
                name={name}
                autoComplete={autoComplete}
                className={`form__input ${rootClassName}`}
                onChange={(e) => {
                    e.persist()
                    onChange(e)
                }}
                onBlur={onBlur}
                onFocus={onFocus}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                tabIndex={tabIndex}
                autoFocus={autoFocus}
                readOnly={readOnly}
                ref={ref}
                onKeyPress={onKeyPress}
                defaultValue={defaultValue}
                onKeyDown={onKeyDown}
                required={required}
            />

            {getInputError()}
            {helperText && (
                <div className="form__text-field-info">
                    <Info className="form__icon form__icon--info" />
                    <p className="sentence-case">{helperText}</p>
                </div>
            )}
        </div>
    )
}
