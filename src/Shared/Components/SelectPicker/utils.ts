/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ComponentSizeType } from '@Shared/constants'
import { GroupBase, OptionsOrGroups, StylesConfig } from 'react-select'
import { SelectPickerOptionType, SelectPickerProps, SelectPickerVariantType } from './type'

const getMenuWidthFromSize = (menuSize: SelectPickerProps['menuSize']): string => {
    switch (menuSize) {
        case ComponentSizeType.medium:
            return '125%'
        case ComponentSizeType.large:
            return '150%'
        case ComponentSizeType.small:
        default:
            return '100%'
    }
}

const getVariantOverrides = (variant: SelectPickerVariantType): StylesConfig<SelectPickerOptionType> => {
    switch (variant) {
        case SelectPickerVariantType.BORDERLESS:
            return {
                menu: () => ({
                    width: '250px',
                }),
                control: () => ({
                    backgroundColor: 'var(--N0)',
                    border: 'none',
                    padding: 0,
                    gap: '2px',
                }),
                singleValue: () => ({
                    color: 'var(--B500)',
                    fontWeight: 600,
                }),
            }
        default:
            return null
    }
}

export const getCommonSelectStyle = ({
    error,
    size,
    menuSize,
    variant,
    menuAlignToRight,
}: Pick<
    SelectPickerProps,
    'error' | 'size' | 'menuSize' | 'variant' | 'menuAlignToRight'
>): StylesConfig<SelectPickerOptionType> => ({
    container: (base, state) => ({
        ...base,
        ...(state.isDisabled && {
            cursor: 'not-allowed',
            pointerEvents: 'auto',
        }),
    }),
    menu: (base, state) => ({
        ...base,
        overflow: 'hidden',
        marginBlock: '4px',
        backgroundColor: 'var(--N0)',
        border: '1px solid var(--N200)',
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.20)',
        width: getMenuWidthFromSize(menuSize),
        zIndex: 'var(--select-picker-menu-index)',
        ...(getVariantOverrides(variant)?.menu(base, state) || {}),
        ...(menuAlignToRight ? { right: 0 } : {}),
    }),
    menuList: (base) => ({
        ...base,
        padding: 0,
    }),
    control: (base, state) => ({
        ...base,
        minHeight: size === ComponentSizeType.medium ? 'auto' : '36px',
        boxShadow: 'none',
        backgroundColor: 'var(--N50)',
        border: `1px solid ${error ? 'var(--R500)' : 'var(--N200)'}`,
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        padding: '5px 8px',
        gap: '8px',
        opacity: state.isDisabled ? 0.5 : 1,
        flexWrap: 'nowrap',
        ...(getVariantOverrides(variant)?.control(base, state) || {}),

        '&:hover': {
            borderColor: state.isDisabled ? 'var(--N200)' : 'var(--N300)',
        },
        '&:focus, &:focus-within': {
            borderColor: state.isDisabled ? 'var(--N200)' : 'var(--B500)',
            outline: 'none',
        },
    }),
    option: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        // eslint-disable-next-line no-nested-ternary
        backgroundColor: state.isSelected ? 'var(--B100)' : state.isFocused ? 'var(--N50)' : 'var(--N0)',
        padding: '6px 8px',
        cursor: 'pointer',
        fontSize: '13px',
        lineHeight: '20px',
        fontWeight: 400,

        ':active': {
            backgroundColor: 'var(--N100)',
        },
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: 'var(--N600)',
        padding: '0',
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
    clearIndicator: (base) => ({
        ...base,
        padding: 0,
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0',
        fontWeight: '400',
    }),
    loadingMessage: (base) => ({
        ...base,
        color: 'var(--N600)',
    }),
    noOptionsMessage: (base) => ({
        ...base,
        color: 'var(--N600)',
    }),
    group: (base) => ({
        ...base,
        paddingTop: '4px',
        paddingBottom: 0,
    }),
    groupHeading: (base) => ({
        ...base,
        fontWeight: 600,
        fontSize: '12px',
        color: 'var(--N900)',
        backgroundColor: 'var(--N100)',
        marginBottom: 0,
        padding: '4px 8px',
        textTransform: 'none',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
    input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
        color: 'var(--N900)',
        size: '13px',
        fontWeight: 400,
        lineHeight: '20px',
        overflow: 'hidden',
    }),
    placeholder: (base) => ({
        ...base,
        color: 'var(--N500)',
        fontSize: '13px',
        lineHeight: '20px',
        fontWeight: 400,
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
    indicatorsContainer: (base) => ({
        ...base,
        gap: '4px',
        flexShrink: 0,
    }),
    singleValue: (base, state) => ({
        ...base,
        margin: 0,
        color: 'var(--N900)',
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '20px',
        ...(getVariantOverrides(variant)?.singleValue(base, state) || {}),
    }),
})

/**
 * Retrieves an option from the options list based on the provided value.
 *
 * @param optionsList - The list of options or groups of options.
 * @param value - The value to compare against the options' values.
 * @param defaultOption - The default option to return if no match is found.
 * @returns The matched option or the default option if no match is found.
 */
export const getSelectPickerOptionByValue = (
    optionsList: OptionsOrGroups<SelectPickerOptionType, GroupBase<SelectPickerOptionType>>,
    value: string | number,
    defaultOption: SelectPickerOptionType = { label: '', value: '' },
): SelectPickerOptionType => {
    const foundOption = optionsList.reduce(
        (acc, curr) => {
            if (!acc.notFound) return acc

            if ('value' in curr && curr.value === value) {
                return { data: curr, notFound: false }
            }

            if ('options' in curr) {
                const nestedOption = curr.options.find(({ value: _value }) => _value === value)
                if (nestedOption) {
                    return { data: nestedOption, notFound: false }
                }
            }

            return acc
        },
        { notFound: true, data: defaultOption },
    ).data

    return foundOption
}
