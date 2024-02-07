/* eslint-disable jsx-a11y/label-has-associated-control */
import Tippy from '@tippyjs/react'
import React, { useState, useEffect, ReactNode, useMemo } from 'react'
import { ConditionalWrap } from '../Helper'
import './radioGroup.scss'

const RadioContext = React.createContext(null)

function useRadioContext() {
    const context = React.useContext(RadioContext)
    if (!context) {
        throw new Error(`Radio compound components cannot be rendered outside the Toggle component`)
    }
    return context
}

interface RadioGroupInterface {
    name: string
    onChange: any
    className?: string
    initialTab: string
    disabled: boolean
    children: ReactNode
}

interface RadioInterface {
    children: ReactNode
    value: string
    className?: string
    showTippy?: boolean
    tippyContent?: any
    tippyPlacement?: string
    canSelect?: boolean
    isDisabled?: boolean
    tippyClass?: string
    dataTestId?: string
}

interface RadioGroupComposition {
    Radio?: React.FC<any>
}

const RadioGroup: React.FC<RadioGroupInterface> & RadioGroupComposition = React.memo(
    ({ name, onChange, children, className = '', initialTab, disabled = false }: RadioGroupInterface) => {
        const [selected, select] = useState(null)

        useEffect(() => {
            if (initialTab === selected) return
            select(initialTab)
        }, [initialTab])
        const contextValue = useMemo(
            () => ({ name, selected, select, disabled, onChange }),
            [name, selected, select, disabled, onChange],
        )
        return (
            <RadioContext.Provider value={contextValue}>
                <div className={`${className} radio-group`}>{children}</div>
            </RadioContext.Provider>
        )
    },
)

const TippyComponent = (children, tippyContent, tippyPlacement, tippyClass) => (
    <Tippy className={`default-tt w-250 ${tippyClass}`} arrow={false} placement={tippyPlacement} content={tippyContent}>
        {children}
    </Tippy>
)

const Radio = ({
    value,
    children,
    className = '',
    showTippy = false,
    tippyContent = '',
    tippyPlacement = 'bottom',
    canSelect = true,
    isDisabled = false,
    tippyClass = '',
    dataTestId,
}: RadioInterface) => {
    const { name, selected, select, disabled, onChange } = useRadioContext()

    return (
        <ConditionalWrap
            condition={showTippy}
            wrap={(child) => TippyComponent(child, tippyContent, tippyPlacement, tippyClass)}
        >
            <label className={`${className} radio ${isDisabled || disabled ? 'disabled' : ''}`}>
                <input
                    type="checkbox"
                    value={value}
                    name={name}
                    checked={value === selected}
                    onChange={(e) => {
                        e.persist()
                        if (canSelect) {
                            select(e.target.value)
                        }
                        onChange(e)
                    }}
                    disabled={isDisabled || disabled}
                />
                <span className="radio__item-label" data-testid={dataTestId}>
                    {children}
                </span>
            </label>
        </ConditionalWrap>
    )
}

RadioGroup.Radio = Radio
export default RadioGroup
