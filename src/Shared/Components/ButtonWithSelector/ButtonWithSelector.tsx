import { ReactComponent as ICDropdown } from '../../../Assets/Icon/ic-chevron-down.svg'
import { PopupMenu } from '../../../Common'
import { ButtonWithSelectorProps } from './types'

const ButtonWithSelector = ({ buttonContent, buttonClickHandler, menuItems }: ButtonWithSelectorProps) => (
    <>
        <button
            className="cta flex h-28 dc__no-right-radius dc__no-border-imp"
            type="button"
            onClick={buttonClickHandler}
        >
            {buttonContent}
        </button>
        <PopupMenu autoClose autoPosition>
            <PopupMenu.Button rootClassName="flex dc__transparent p-8 w-28 bcb-5 dc__right-radius-4 dc__no-left-radius dc__no-top-border dc__no-bottom-border dc__no-right-border">
                <ICDropdown className="icon-dim-12 scn-0" />
            </PopupMenu.Button>
            <PopupMenu.Body>{menuItems}</PopupMenu.Body>
        </PopupMenu>
    </>
)

export default ButtonWithSelector
