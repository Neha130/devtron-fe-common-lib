import {
    components,
    DropdownIndicatorProps,
    ControlProps,
    OptionProps,
    ClearIndicatorProps,
    ValueContainerProps,
    MenuListProps,
    MultiValueRemoveProps,
    MultiValueProps,
    GroupHeadingProps,
    MultiValue,
} from 'react-select'
import { Progressing } from '@Common/Progressing'
import { ReactComponent as ICCaretDown } from '@Icons/ic-caret-down.svg'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ReactComponent as ICErrorExclamation } from '@Icons/ic-error-exclamation.svg'
import { ChangeEvent } from 'react'
import { noop } from '@Common/Helper'
import { CHECKBOX_VALUE } from '@Common/Types'
import { Checkbox } from '@Common/Checkbox'
import { ReactSelectInputAction } from '@Common/Constants'
import { SelectPickerOptionType, SelectPickerProps } from './type'
import { getGroupCheckboxValue } from './utils'

export const SelectPickerDropdownIndicator = (props: DropdownIndicatorProps<SelectPickerOptionType>) => {
    const { isDisabled } = props

    return (
        <components.DropdownIndicator {...props}>
            <ICCaretDown className={`icon-dim-16 ${isDisabled ? 'scn-3' : 'scn-6'} dc__no-shrink`} />
        </components.DropdownIndicator>
    )
}

export const SelectPickerClearIndicator = (props: ClearIndicatorProps<SelectPickerOptionType>) => (
    <components.ClearIndicator {...props}>
        <ICClose className="icon-dim-16 icon-use-fill-n6 dc__no-shrink" />
    </components.ClearIndicator>
)

export const SelectPickerControl = ({
    icon,
    showSelectedOptionIcon,
    ...props
}: ControlProps<SelectPickerOptionType> & Pick<SelectPickerProps, 'icon' | 'showSelectedOptionIcon'>) => {
    const { children, getValue } = props
    const { startIcon, endIcon } = getValue()?.[0] ?? {}

    let iconToDisplay = icon

    if (showSelectedOptionIcon && (startIcon || endIcon)) {
        iconToDisplay = startIcon || endIcon
    }

    return (
        <components.Control {...props}>
            {iconToDisplay && (
                <div className="dc__no-shrink icon-dim-20 flex dc__fill-available-space">{iconToDisplay}</div>
            )}
            {children}
        </components.Control>
    )
}

export const SelectPickerValueContainer = ({
    showSelectedOptionsCount,
    ...props
}: ValueContainerProps<SelectPickerOptionType> & Pick<SelectPickerProps, 'showSelectedOptionsCount'>) => {
    const { getValue } = props
    const selectedOptionsLength = (getValue() ?? []).length

    return (
        <div className="flex left dc__gap-8 flex-grow-1">
            <div className="flex left">
                <components.ValueContainer {...props} />
            </div>
            {showSelectedOptionsCount && selectedOptionsLength > 0 && (
                <div className="bcb-5 dc__border-radius-4-imp pl-5 pr-5 cn-0 fs-12 fw-6 lh-18 dc__truncate dc__no-shrink">
                    {selectedOptionsLength}
                </div>
            )}
        </div>
    )
}

export const SelectPickerLoadingIndicator = () => <Progressing />

export const SelectPickerOption = ({
    disableDescriptionEllipsis,
    ...props
}: OptionProps<SelectPickerOptionType> & Pick<SelectPickerProps, 'disableDescriptionEllipsis'>) => {
    const {
        label,
        data,
        selectProps: { isMulti },
        selectOption,
    } = props
    const { description, startIcon, endIcon } = data ?? {}
    const showDescription = !!description

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        e.stopPropagation()
        selectOption(data)
    }

    return (
        <components.Option {...props}>
            <div className="flexbox dc__align-items-center dc__gap-8">
                {/* __isNew__ denotes the new option to be created */}
                {isMulti && !('__isNew__' in data && data.__isNew__) && (
                    <Checkbox
                        onChange={noop}
                        onClick={handleChange}
                        isChecked={props.isSelected || false}
                        value={CHECKBOX_VALUE.CHECKED}
                        rootClassName="mb-0 w-20 p-2 dc__align-self-start dc__no-shrink"
                    />
                )}
                <div className={`flex left ${showDescription ? 'top' : ''} dc__gap-8`}>
                    {startIcon && (
                        <div className="dc__no-shrink icon-dim-20 flex dc__fill-available-space">{startIcon}</div>
                    )}
                    <div className="flex-grow-1">
                        <h4 className="m-0 cn-9 fs-13 fw-4 lh-20 dc__truncate">{label}</h4>
                        {/* Add support for custom ellipsis if required */}
                        {showDescription && (
                            <p
                                className={`m-0 fs-12 fw-4 lh-18 cn-7 ${!disableDescriptionEllipsis ? 'dc__truncate' : ''}`}
                            >
                                {description}
                            </p>
                        )}
                    </div>
                    {endIcon && (
                        <div className="dc__no-shrink icon-dim-20 flex dc__fill-available-space">{endIcon}</div>
                    )}
                </div>
            </div>
        </components.Option>
    )
}

export const SelectPickerMenuList = ({
    renderMenuListFooter,
    shouldRenderCustomOptions,
    renderCustomOptions,
    ...props
}: MenuListProps<SelectPickerOptionType> &
    Pick<SelectPickerProps, 'renderMenuListFooter' | 'shouldRenderCustomOptions' | 'renderCustomOptions'>) => {
    const { children } = props

    return (
        <components.MenuList {...props}>
            <div className="py-4 cursor">{shouldRenderCustomOptions ? renderCustomOptions() : children}</div>
            {/* Added to the bottom of menu list to prevent from hiding when the menu is opened close to the bottom of the screen */}
            {!shouldRenderCustomOptions && renderMenuListFooter && (
                <div className=" dc__position-sticky dc__bottom-0 dc__bottom-radius-4 bcn-0">
                    {renderMenuListFooter()}
                </div>
            )}
        </components.MenuList>
    )
}

export const MultiValueLabel = ({
    getIsOptionValid,
    ...props
}: MultiValueProps<SelectPickerOptionType, true> & Pick<SelectPickerProps['multiSelectProps'], 'getIsOptionValid'>) => {
    const { data, selectProps } = props
    const isOptionValid = getIsOptionValid(data)
    const iconToDisplay = isOptionValid ? data.startIcon || data.endIcon : <ICErrorExclamation />

    return (
        <div className="flex dc__gap-4 mw-0">
            {iconToDisplay && (
                <div
                    className={`dc__no-shrink ${selectProps.isMulti ? 'icon-dim-16' : 'icon-dim-20'} flex dc__fill-available-space`}
                >
                    {iconToDisplay}
                </div>
            )}
            <components.MultiValueLabel {...props} />
        </div>
    )
}

export const MultiValueRemove = (props: MultiValueRemoveProps) => (
    <components.MultiValueLabel {...props}>
        <span className="flex dc__no-shrink">
            <ICClose className="icon-dim-12 icon-use-fill-n6" />
        </span>
    </components.MultiValueLabel>
)

export const SelectPickerGroupHeading = ({
    isGroupHeadingSelectable,
    ...props
}: GroupHeadingProps<SelectPickerOptionType> &
    Pick<SelectPickerProps['multiSelectProps'], 'isGroupHeadingSelectable'>) => {
    const { data, selectProps } = props

    if (!data.label) {
        return null
    }

    if (!isGroupHeadingSelectable || !selectProps.isMulti) {
        return <components.GroupHeading {...props} />
    }

    const selectedOptions = (selectProps.value as MultiValue<SelectPickerOptionType>) ?? []
    const groupHeadingOptions = data.options ?? []

    const checkboxValue = getGroupCheckboxValue(groupHeadingOptions, selectedOptions, selectProps.getOptionValue)

    const toggleGroupHeadingSelection = () => {
        const groupOptionsMapByValue = groupHeadingOptions.reduce<Record<string, true>>((acc, option) => {
            acc[selectProps.getOptionValue(option)] = true
            return acc
        }, {})

        // Clear all the selection(s) in the group if any of the option is selected
        if (checkboxValue) {
            selectProps?.onChange?.(
                selectedOptions.filter(
                    (selectedOption) => !groupOptionsMapByValue[selectProps.getOptionValue(selectedOption)],
                ),
                {
                    action: ReactSelectInputAction.deselectOption,
                    option: null,
                },
            )

            return
        }

        // Select all options
        selectProps?.onChange?.(
            [
                ...selectedOptions.filter(
                    (selectedOption) => !groupOptionsMapByValue[selectProps.getOptionValue(selectedOption)],
                ),
                ...structuredClone(groupHeadingOptions),
            ],
            {
                action: ReactSelectInputAction.selectOption,
                option: null,
            },
        )
    }

    const handleToggleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        e.stopPropagation()

        toggleGroupHeadingSelection()
    }

    return (
        <components.GroupHeading {...props} onClick={toggleGroupHeadingSelection}>
            <div className="flexbox dc__align-items-center dc__gap-8">
                {/* __isNew__ denotes the new option to be created */}
                {isGroupHeadingSelectable && (
                    <Checkbox
                        onChange={noop}
                        onClick={handleToggleCheckbox}
                        isChecked={!!checkboxValue}
                        value={checkboxValue}
                        rootClassName="mb-0 w-20 p-2 dc__align-self-start dc__no-shrink"
                    />
                )}
                <div className="dc__truncate">{props.data.label}</div>
            </div>
        </components.GroupHeading>
    )
}
