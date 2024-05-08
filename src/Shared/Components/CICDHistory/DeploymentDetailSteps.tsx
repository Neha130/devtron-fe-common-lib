import { useEffect, useRef, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router'
import {
    DEPLOYMENT_STATUS,
    DeploymentAppTypes,
    GenericEmptyState,
    Progressing,
    TIMELINE_STATUS,
    URLS,
} from '../../../Common'
import { getDeploymentStatusDetail } from './service'
import {
    DeploymentDetailStepsType,
    DeploymentStatusDetailsBreakdownDataType,
    DeploymentStatusDetailsType,
} from './types'
import { processDeploymentStatusDetailsData } from './utils'
import { DEPLOYMENT_STATUS_QUERY_PARAM, EMPTY_STATE_STATUS } from './constants'
import { ReactComponent as Arrow } from '../../../Assets/Icon/ic-arrow-forward.svg'
import mechanicalOperation from '../../../Assets/Icon/ic-mechanical-operation.svg'
import CDEmptyState from './CDEmptyState'
import DeploymentStatusDetailBreakdown from './DeploymentStatusBreakdown'

let deploymentStatusTimer = null
const DeploymentDetailSteps = ({
    deploymentStatus,
    deploymentAppType,
    isHelmApps = false,
    installedAppVersionHistoryId,
    isGitops,
    userApprovalMetadata,
    isVirtualEnvironment,
    processVirtualEnvironmentDeploymentData,
    renderDeploymentApprovalInfo,
}: DeploymentDetailStepsType) => {
    const history = useHistory()
    const { url } = useRouteMatch()
    const { appId, envId, triggerId } = useParams<{ appId: string; envId?: string; triggerId?: string }>()
    const [deploymentListLoader, setDeploymentListLoader] = useState<boolean>(
        deploymentStatus?.toUpperCase() !== TIMELINE_STATUS.ABORTED,
    )
    const isVirtualEnv = useRef(isVirtualEnvironment)
    const processedData = isVirtualEnv.current
        ? processVirtualEnvironmentDeploymentData()
        : processDeploymentStatusDetailsData()
    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
        useState<DeploymentStatusDetailsBreakdownDataType>(processedData)

    const clearDeploymentStatusTimer = (): void => {
        if (deploymentStatusTimer) {
            clearTimeout(deploymentStatusTimer)
        }
    }

    const getDeploymentDetailStepsData = (): void => {
        getDeploymentStatusDetail(appId, envId, true, triggerId, isHelmApps, installedAppVersionHistoryId)
            .then((deploymentStatusDetailRes) => {
                if (deploymentStatus !== 'Aborted') {
                    // eslint-disable-next-line no-use-before-define
                    processDeploymentStatusData(deploymentStatusDetailRes.result)
                }
            })
            .catch(() => {
                setDeploymentListLoader(false)
            })
            .finally(() => {
                setDeploymentListLoader(false)
            })
    }

    useEffect(() => {
        if (deploymentAppType === DeploymentAppTypes.HELM) {
            history.replace(`${url.replace('deployment-steps', 'source-code')}`)
        }
        if (isGitops) {
            getDeploymentDetailStepsData()
        }

        return (): void => {
            clearDeploymentStatusTimer()
        }
    }, [installedAppVersionHistoryId])

    useEffect(() => {
        isVirtualEnv.current = isVirtualEnvironment
    }, [isVirtualEnvironment])

    const processDeploymentStatusData = (deploymentStatusDetailRes: DeploymentStatusDetailsType): void => {
        const processedDeploymentStatusDetailsData = isVirtualEnv.current
            ? processVirtualEnvironmentDeploymentData(deploymentStatusDetailRes)
            : processDeploymentStatusDetailsData(deploymentStatusDetailRes)
        clearDeploymentStatusTimer()
        // If deployment status is in progress then fetch data in every 10 seconds

        // eslint-disable-next-line dot-notation
        if (processedDeploymentStatusDetailsData['deploymentStatus'] === DEPLOYMENT_STATUS.INPROGRESS) {
            deploymentStatusTimer = setTimeout(() => {
                getDeploymentDetailStepsData()
            }, 10000)
        } else {
            deploymentStatusTimer = setTimeout(() => {
                getDeploymentDetailStepsData()
            }, 30000)
        }
        setDeploymentStatusDetailsBreakdownData(processedDeploymentStatusDetailsData)
    }

    const redirectToDeploymentStatus = () => {
        if (isHelmApps)
            history.push({
                pathname: `${URLS.APP}/${URLS.DEVTRON_CHARTS}/${URLS.APP_DEPLOYMNENT_HISTORY}/${appId}/env/${envId}/${URLS.DETAILS}/${URLS.APP_DETAILS_K8}`,
                search: DEPLOYMENT_STATUS_QUERY_PARAM,
            })
        else {
            history.push({
                pathname: `${URLS.APP}/${appId}/${URLS.APP_DETAILS}/${envId}/${URLS.APP_DETAILS_K8}`,
                search: DEPLOYMENT_STATUS_QUERY_PARAM,
            })
        }
    }

    const getDeploymentStatusDetails = () =>
        !isVirtualEnv.current &&
        !deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown.APP_HEALTH.isCollapsed ? (
            <div className="h-100 flex">
                <CDEmptyState
                    title={EMPTY_STATE_STATUS.DEPLOYMENT_DETAILS_SETPS_PROGRESSING.TITLE}
                    imgSource={mechanicalOperation}
                    actionButtonClass="bcb-5 cn-0"
                    ActionButtonIcon={Arrow}
                    actionHandler={redirectToDeploymentStatus}
                    subtitle={EMPTY_STATE_STATUS.DEPLOYMENT_DETAILS_SETPS_PROGRESSING.SUBTITLE}
                    actionButtonText="Check live status"
                    actionButtonIconRight
                    dataTestId="deployment-progress"
                />
            </div>
        ) : (
            <div className="dc__mxw-1000 min-w-800">
                {userApprovalMetadata && renderDeploymentApprovalInfo()}
                <DeploymentStatusDetailBreakdown
                    deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                    isVirtualEnvironment={isVirtualEnv.current}
                />
            </div>
        )

    if (
        deploymentStatus?.toUpperCase() === TIMELINE_STATUS.ABORTED ||
        deploymentStatusDetailsBreakdownData.deploymentStatus === DEPLOYMENT_STATUS.SUPERSEDED
    ) {
        return (
            <div className="flexbox deployment-aborted" data-testid="deployment-history-steps-failed-message">
                <GenericEmptyState
                    title={EMPTY_STATE_STATUS.DEPLOYMENT_DETAILS_SETPS_FAILED.TITLE}
                    subTitle={EMPTY_STATE_STATUS.DEPLOYMENT_DETAILS_SETPS_FAILED.SUBTITLE}
                />
            </div>
        )
    }

    return deploymentListLoader ? <Progressing pageLoader /> : getDeploymentStatusDetails()
}

export default DeploymentDetailSteps
