import { useState } from 'react'
import { ReactComponent as ICDropdown } from '../../../Assets/Icon/ic-chevron-down.svg'
import { PopupMenu } from '../../../Common'
import { ButtonWithSelectorProps } from './types'
import './buttonWithSelector.scss'

const ButtonWithSelector = ({ buttonContent, buttonClickHandler, menuItems }: ButtonWithSelectorProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

    return (
        <>
            <button
                className="cta flex h-28 dc__no-right-radius dc__no-border-imp fs-12 fw-6 lh-18"
                type="button"
                onClick={buttonClickHandler}
            >
                {buttonContent}
            </button>
            <PopupMenu autoClose autoPosition onToggleCallback={setIsMenuOpen}>
                <PopupMenu.Button rootClassName="flex dc__transparent p-8 w-28 bcb-5 dc__right-radius-4 dc__no-left-radius dc__no-top-border dc__no-bottom-border dc__no-right-border button-with-selector">
                    <ICDropdown
                        className="icon-dim-12 fcn-0 dc__no-shrink rotate"
                        style={{ ['--rotateBy' as any]: isMenuOpen ? '180deg' : '0deg' }}
                    />
                </PopupMenu.Button>
                <PopupMenu.Body>{menuItems}</PopupMenu.Body>
            </PopupMenu>
        </>
    )
}

export default ButtonWithSelector
