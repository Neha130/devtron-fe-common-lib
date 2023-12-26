import * as Sentry from '@sentry/browser'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ERROR_EMPTY_SCREEN, TOKEN_COOKIE_NAME } from './Constants'
import { ServerErrors } from './ServerError'
import { toastAccessDenied } from './ToastBody'
import { AsyncOptions, AsyncState, UseSearchString } from './Types'
import { JSONPath } from 'jsonpath-plus'
import * as jsonpatch from 'fast-json-patch'

toast.configure({
    autoClose: 3000,
    hideProgressBar: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    closeOnClick: false,
    newestOnTop: true,
    toastClassName: 'devtron-toast',
    bodyClassName: 'devtron-toast__body',
})

export function showError(serverError, showToastOnUnknownError = true, hideAccessError = false) {
    if (serverError instanceof ServerErrors && Array.isArray(serverError.errors)) {
        serverError.errors.map(({ userMessage, internalMessage }) => {
            if (
                serverError.code === 403 &&
                (userMessage === ERROR_EMPTY_SCREEN.UNAUTHORIZED || userMessage === ERROR_EMPTY_SCREEN.FORBIDDEN)
            ) {
                if (!hideAccessError) {
                    toastAccessDenied()
                }
            } else {
                toast.error(userMessage || internalMessage)
            }
        })
    } else {
        if (serverError.code !== 403 && serverError.code !== 408) {
            Sentry.captureException(serverError)
        }

        if (showToastOnUnknownError) {
            if (serverError.message) {
                toast.error(serverError.message)
            } else {
                toast.error('Some Error Occurred')
            }
        }
    }
}

interface ConditionalWrapper<T> {
    condition: boolean
    wrap: (children: T) => T
    children: T
}
export const ConditionalWrap: React.FC<ConditionalWrapper<any>> = ({ condition, wrap, children }) =>
    condition ? wrap(children) : <>{children}</>

export function sortCallback(key: string, a: any, b: any, isCaseSensitive?: boolean) {
    let x = a[key]
    let y = b[key]
    if (isCaseSensitive) {
        x = x.toLowerCase()
        y = y.toLowerCase()
    }
    if (x < y) {
        return -1
    }
    if (x > y) {
        return 1
    }
    return 0
}

export const stopPropagation = (event): void => {
    event.stopPropagation()
}

export function useThrottledEffect(callback, delay, deps = []) {
    //function will be executed only once in a given time interval.
    const lastRan = useRef(Date.now())

    useEffect(() => {
        const handler = setTimeout(function () {
            if (Date.now() - lastRan.current >= delay) {
                callback()
                lastRan.current = Date.now()
            }
        }, delay - (Date.now() - lastRan.current))

        return () => {
            clearTimeout(handler)
        }
    }, [delay, ...deps])
}

const colors = [
    '#FFB900',
    '#D83B01',
    '#B50E0E',
    '#E81123',
    '#B4009E',
    '#5C2D91',
    '#0078D7',
    '#00B4FF',
    '#008272',
    '#107C10',
]

export function getRandomColor(email: string): string {
    let sum = 0
    for (let i = 0; i < email.length; i++) {
        sum += email.charCodeAt(i)
    }
    return colors[sum % colors.length]
}

export const getAlphabetIcon = (str: string, rootClassName: string = "") => {
    if (!str) return null
    return (
        <span
            className={`${rootClassName} alphabet-icon__initial fs-13 icon-dim-20 flex cn-0 mr-8`}
            style={{ backgroundColor: getRandomColor(str) }}
        >
            {str[0]}
        </span>
    )
}

export const getEmptyArrayOfLength = (length: number) => {
    return Array.from({ length })
}

export function noop(...args): any {}

export function not(e) {
    return !e
}

export function useEffectAfterMount(cb, dependencies) {
    const justMounted = React.useRef(true)
    React.useEffect(() => {
        if (!justMounted.current) {
            return cb()
        }
        justMounted.current = false
    }, dependencies)
}

export function getCookie(sKey) {
    if (!sKey) {
        return null
    }
    return (
        document.cookie.replace(
            new RegExp('(?:(?:^|.*;)\\s*' + sKey.replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'),
            '$1',
        ) || null
    )
}

export function getLoginInfo() {
    const argocdToken = getCookie(TOKEN_COOKIE_NAME)
    if (argocdToken) {
        const jwts = argocdToken.split('.')
        try {
            return JSON.parse(atob(jwts[1]))
        } catch (err) {
            console.error('error in setting user ', err)
            return null
        }
    }
}

export function useForm(stateSchema, validationSchema = {}, callback) {
    const [state, setState] = useState(stateSchema)
    const [disable, setDisable] = useState(true)
    const [isDirty, setIsDirty] = useState(false)

    // Disable button in initial render.
    useEffect(() => {
        setDisable(true)
    }, [])

    // For every changed in our state this will be fired
    // To be able to disable the button
    useEffect(() => {
        if (isDirty) {
            setDisable(validateState(state))
        }
    }, [state, isDirty])

    // Used to disable submit button if there's an error in state
    // or the required field in state has no value.
    // Wrapped in useCallback to cached the function to avoid intensive memory leaked
    // in every re-render in component
    const validateState = useCallback(
        (state) => {
            //check errors in all fields
            const hasErrorInState = Object.keys(validationSchema).some((key) => {
                const isInputFieldRequired = validationSchema[key].required
                const stateValue = state[key].value // state value
                const stateError = state[key].error // state error
                return (isInputFieldRequired && !stateValue) || stateError
            })
            return hasErrorInState
        },
        [state, validationSchema],
    )

    function validateField(name, value): string | string[] {
        if (validationSchema[name].required) {
            if (!value) {
                return 'This is a required field.'
            }
        }

        function _validateSingleValidator(validator, value) {
            if (value && !validator.regex.test(value)) {
                return false
            }
            return true
        }

        // single validator
        let _validator = validationSchema[name].validator
        if (_validator && typeof _validator === 'object') {
            if (!_validateSingleValidator(_validator, value)) {
                return _validator.error
            }
        }

        // multiple validators
        let _validators = validationSchema[name].validators
        if (_validators && typeof _validators === 'object' && Array.isArray(_validators)) {
            let errors = []
            _validators.forEach((_validator) => {
                if (!_validateSingleValidator(_validator, value)) {
                    errors.push(_validator.error)
                }
            })
            if (errors.length > 0) {
                return errors
            }
        }

        return ''
    }

    const handleOnChange = useCallback(
        (event) => {
            setIsDirty(true)

            const { name, value } = event.target
            let error = validateField(name, value)
            setState((prevState) => ({
                ...prevState,
                [name]: { value, error },
            }))
        },
        [validationSchema],
    )

    const handleOnSubmit = (event) => {
        event.preventDefault()
        const newState = Object.keys(validationSchema).reduce((agg, curr) => {
            agg[curr] = { ...state[curr], error: validateField(curr, state[curr].value) }
            return agg
        }, state)
        if (!validateState(newState)) {
            callback(state)
        } else {
            setState({ ...newState })
        }
    }
    return { state, disable, handleOnChange, handleOnSubmit }
}

export function handleUTCTime(ts: string, isRelativeTime = false) {
    let timestamp = ''
    try {
        if (ts && ts.length) {
            let date = moment(ts)
            if (isRelativeTime) timestamp = date.fromNow()
            else timestamp = date.format('ddd DD MMM YYYY HH:mm:ss')
        }
    } catch (error) {
        console.error('Error Parsing Date:', ts)
    }
    return timestamp
}

export function useSearchString(): UseSearchString {
    const location = useLocation()
    const queryParams: URLSearchParams = useMemo(() => {
        const queryParams = new URLSearchParams(location.search)
        return queryParams
    }, [location])

    // const searchParams={}
    // for (let [key, value] of queryParams.entries()){
    //     searchParams[key]=value
    // }
    const searchParams = Array.from(queryParams.entries()).reduce((agg, curr, idx) => {
        agg[curr[0]] = curr[1]
        return agg
    }, {})

    return { queryParams, searchParams }
}

export const closeOnEscKeyPressed = (e: any, actionClose: () => void) => {
    if (e.keyCode === 27 || e.key === 'Escape') {
        actionClose()
    }
}

const unsecureCopyToClipboard = (str, callback = noop) => {
    const listener = function (ev) {
        ev.preventDefault()
        ev.clipboardData.setData('text/plain', str)
    }
    document.addEventListener('copy', listener)
    document.execCommand('copy')
    document.removeEventListener('copy', listener)
    callback()
}

/**
 * It will copy the passed content to clipboard and invoke the callback function, in case of error it will show the toast message.
 * On HTTP system clipboard is not supported, so it will use the unsecureCopyToClipboard function
 * @param str
 * @param callback
 */
export function copyToClipboard(str, callback = noop) {
    if (!str) {
        return
    }

    if (window.isSecureContext && navigator.clipboard) {
        navigator.clipboard
            .writeText(str)
            .then(() => {
                callback()
            })
            .catch(() => {
                toast.error('Failed to copy to clipboard')
            })
    } else {
        unsecureCopyToClipboard(str, callback)
    }
}

export function useAsync<T>(
    func: (...rest) => Promise<T>,
    dependencyArray: any[] = [],
    shouldRun = true,
    options: AsyncOptions = { resetOnChange: true },
): [boolean, T, any | null, () => void, React.Dispatch<any>, any[]] {
    const [state, setState] = useState<AsyncState<T>>({
        loading: true,
        result: null,
        error: null,
        dependencies: dependencyArray,
    })
    const mounted = useRef(true)
    const dependencies: any[] = useMemo(() => {
        return [...dependencyArray, shouldRun]
    }, [...dependencyArray, shouldRun])

    const reload = () => {
        async function call() {
            try {
                setState((state) => ({
                    ...state,
                    loading: true,
                }))
                const result = await func()
                if (mounted.current)
                    setState((state) => ({
                        ...state,
                        result,
                        error: null,
                        loading: false,
                    }))
            } catch (error: any) {
                if (mounted.current)
                    setState((state) => ({
                        ...state,
                        error,
                        loading: false,
                    }))
            }
        }
        call()
    }

    useEffect(() => {
        if (!shouldRun) {
            setState((state) => ({ ...state, loading: false }))
            return
        }
        setState((state) => ({ ...state, dependencies: dependencyArray }))
        reload()
        return () =>
            setState((state) => ({
                ...state,
                loading: false,
                error: null,
                ...(options.resetOnChange ? { result: null } : {}),
            }))
    }, dependencies)

    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
        }
    }, [])

    const setResult = (param) => {
        if (typeof param === 'function') {
            setState((state) => ({ ...state, result: param(state.result) }))
        } else {
            setState((state) => ({ ...state, result: param }))
        }
    }

    return [state.loading, state.result, state.error, reload, setResult, state.dependencies]
}

export const processDeployedTime = (lastDeployed, isArgoInstalled) => {
    if (lastDeployed) {
        return handleUTCTime(lastDeployed, true)
    } else {
        return isArgoInstalled ? '' : 'Not deployed'
    }
}

/**
 * Appends search parameters to the url as a query string
 *
 * @param url URL to which the search params needs to be added
 * @param params Object for the search parameters
 */
export const getUrlWithSearchParams = (url: string, params: Record<string | number, any>) => {
    const searchParams = new URLSearchParams()
    Object.keys(params).forEach((key) => {
        if (params[key]) {
            searchParams.append(key, params[key])
        }
    })
    const queryString = searchParams.toString()
    return url + (queryString ? `?${queryString}` : '')
}

/**
 * Custom exception logger function for logging errors to sentry
 */
export const logExceptionToSentry = Sentry.captureException.bind(window)

export const customStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '32px',
        boxShadow: 'none',
        border: 'none',
        cursor: 'pointer',
        background: 'transparent',
    }),
    indicatorSeparator: (base, state) => ({
        ...base,
        width: 0,
    }),
    valueContainer: (base, state) => ({
        ...base,
        padding: '0',
        fontSize: '13px',
        fontWeight: '600',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: 'var(--N400)',
        padding: '0 8px',
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
}

export const getFilteredChartVersions = (charts, selectedChartType) => {
    // Filter chart versions based on selected chart type
    return charts
        .filter((item) => item?.chartType === selectedChartType.value)
        .map((item) => ({
            value: item?.chartVersion,
            label: item?.chartVersion,
            chartRefId: item.chartRefId,
        }))
}
function removeEmptyObjectKeysAndNullValues(obj) {
    // It recursively removes empty object keys and array values that are null
    for (let key in obj) {
        if (Array.isArray(obj[key])) {
            if (obj[key].length === 0) continue
            obj[key] = obj[key].filter((item) => item !== null)
            // Check if the array is empty
            if (obj[key].length === 0) {
                delete obj[key] // Delete the key if the array is empty
            }
        } else if (obj[key] && typeof obj[key] === 'object') {
            if (removeEmptyObjectKeysAndNullValues(obj[key])) {
                delete obj[key]
            }
        } else if (obj[key] === undefined) {
            delete obj[key]
        }
    }
    return Object.keys(obj).length === 0
}

export function getUnlockedJSON(json, jsonPathArray) {
    const jsonCopy = JSON.parse(JSON.stringify(json))
    let patches = jsonPathArray.flatMap((jsonPath) => {
        const pathsToRemove = JSONPath({ path: jsonPath, json: jsonCopy, resultType: 'all' })
        return pathsToRemove.map((result) =>
            Array.isArray(result.parent)
                ? { op: 'replace', path: result.pointer, value: null }
                : { op: 'remove', path: result.pointer },
        )
    })
    let newDocument = jsonpatch.applyPatch(jsonCopy, patches).newDocument

    removeEmptyObjectKeysAndNullValues(newDocument)
    return newDocument
}

export function getLockedJSON(json, jsonPathArray: string[]) {
    const jsonCopy = JSON.parse(JSON.stringify(json))
    let resultJson = {}
    jsonPathArray.forEach((jsonPath) => {
        const elements = JSONPath({ path: jsonPath, json: jsonCopy, resultType: 'all' })
        elements.forEach((element) => {
            const pathArray: string[] = JSONPath.toPathArray(element.path)
            const lastPath = pathArray.pop()
            let current = resultJson
            for (let i = 0; i < pathArray.length; i++) {
                let key = isNaN(Number(pathArray[i])) ? pathArray[i] : parseInt(pathArray[i])
                if (!current[key]) {
                    current[key] = isNaN(Number(pathArray[i + 1])) ? {} : []
                }
                current = current[key]
            }
            let key = isNaN(Number(lastPath)) ? lastPath : parseInt(lastPath)
            current[key] = element.value
        })
    })
    return resultJson['$']
}

