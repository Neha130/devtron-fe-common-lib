import { ReactNode } from 'react'

export interface ButtonWithSelectorProps {
    content: ReactNode
    onClick: () => void
    children: ReactNode
    className?: string
    popUpBodyClassName?: string
    showPopUp?: boolean
}