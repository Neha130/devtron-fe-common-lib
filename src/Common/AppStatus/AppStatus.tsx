import Tippy from '@tippyjs/react'
import { ReactComponent as InfoIcon } from '../../Assets/Icon/ic-info-outlined.svg'
import { StatusConstants, YET_TO_RUN } from './constants'
import { AppStatusType } from './types'
import { triggerStatus } from './utils'

export default function AppStatus({
    appStatus,
    isDeploymentStatus = false,
    isJobView = false,
    isVirtualEnv,
    hideStatusMessage = false,
}: AppStatusType) {
    let status = appStatus
    if (isDeploymentStatus) {
        status = triggerStatus(appStatus)
    }
    const appStatusLowerCase = status?.toLowerCase()
    const isNotDeployed = appStatusLowerCase === StatusConstants.NOT_DEPLOYED.noSpaceLower
    const iconClass = isNotDeployed ? StatusConstants.NOT_DEPLOYED.lowerCase : appStatusLowerCase
    const statusMessage = status || (isVirtualEnv ? StatusConstants.NOT_AVILABLE.normalCase : '-')
    const notDeployed = isJobView ? YET_TO_RUN : StatusConstants.NOT_DEPLOYED.normalCase
    const textContent = isNotDeployed ? notDeployed : statusMessage

    const renderIcon = () => {
        if (iconClass) {
            return <span className={`dc__app-summary__icon icon-dim-16 ${iconClass} ${iconClass}--node`} />
        }
        if (isVirtualEnv) {
            return (
                <span
                    className={`dc__app-summary__icon icon-dim-16 ${StatusConstants.NOT_DEPLOYED.lowerCase} ${StatusConstants.NOT_DEPLOYED.lowerCase}--node`}
                />
            )
        }
        return (
            <Tippy
                className="default-tt w-200"
                arrow={false}
                placement="top"
                content="To fetch app status for GitOps based deployments open the app detail page"
            >
                <InfoIcon className="icon-dim-16 fcn-6" />
            </Tippy>
        )
    }

    return hideStatusMessage ? (
        iconClass || isVirtualEnv ? (
            <Tippy className="default-tt" arrow={false} placement="top" content={textContent}>
                <div className="flex">{renderIcon()}</div>
            </Tippy>
        ) : (
            renderIcon()
        )
    ) : (
        <div className="flex left">
            <div className="flex mr-6">{renderIcon()}</div>
            <p data-testid={`${status}-app-status`} className="dc__truncate-text dc__first-letter-capitalize cn-6 m-0">
                {textContent}
            </p>
        </div>
    )
}
