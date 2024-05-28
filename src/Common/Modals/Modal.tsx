import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { ModalType } from '../Types'

/**
 * @deprecated Use VisibleModal instead
 */
export const Modal = ({
    style = {},
    children,
    modal = false,
    rootClassName = '',
    onClick = null,
    callbackRef = null,
    preventWheelDisable = false,
    noBackDrop,
}: ModalType) => {
    const innerRef = React.useRef(null)
    function handleClick(e) {
        e.stopPropagation()
        if (typeof onClick !== 'function') return
        if (innerRef && innerRef.current?.contains(e.target)) {
            onClick(e, 'in')
        } else {
            onClick(e, 'out')
        }
    }

    function disableWheel(e) {
        if (!preventWheelDisable) {
            if (innerRef?.current.contains(e.target)) {
                if (innerRef.current.clientHeight === innerRef.current.scrollHeight) {
                    e.preventDefault()
                }
            } else {
                e.preventDefault()
            }
        }
    }
    useEffect(() => {
        document.addEventListener('click', handleClick)
        const modal = document.getElementById('visible-modal')
        if (modal) modal.classList.add('show')
        if (noBackDrop) modal.classList.add('no-back-drop')
        if (!preventWheelDisable) document.body.addEventListener('wheel', disableWheel, { passive: false })
        return () => {
            if (!preventWheelDisable) document.body.removeEventListener('wheel', disableWheel)
            document.removeEventListener('click', handleClick)
            if (modal) modal.classList.remove('show')
            if (noBackDrop) modal.classList.remove('no-back-drop')
        }
    }, [])
    return ReactDOM.createPortal(
        <div
            tabIndex={0}
            onClick={handleClick}
            data-testid="common-modal"
            ref={(el) => {
                if (typeof callbackRef === 'function') {
                    callbackRef(el)
                }
                innerRef.current = el
            }}
            id="popup"
            className={`${rootClassName} popup ${modal ? 'modal' : ''}`}
            style={{ ...style }}
        >
            {children}
        </div>,
        document.getElementById('visible-modal'),
    )
}
