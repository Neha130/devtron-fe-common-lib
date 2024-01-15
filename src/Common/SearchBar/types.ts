import { InputHTMLAttributes, SyntheticEvent } from 'react'

export interface SearchBarProps {
    /**
     * Initial search text
     *
     * @default ''
     */
    initialSearchText?: string
    /**
     * Search handler for the search input
     */
    handleSearchChange?: (searchText: string) => void
    /**
     * Enter event handler for the search input
     */
    handleEnter?: (event: SyntheticEvent) => void
    /**
     * Input props for the search input
     */
    inputProps?: InputHTMLAttributes<HTMLInputElement>
    /**
     * Class name for the container; can be used for handling width
     */
    containerClassName?: string
    /**
     * If true, the change handler would be triggered with debounce
     *
     * @default false
     */
    shouldDebounce?: boolean
    /**
     * Timeout for the debounce handler to be triggered
     */
    debounceTimeout?: number
}
