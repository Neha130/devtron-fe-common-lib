import { Checkbox, CHECKBOX_VALUE } from '../../../Common'
import PluginImageContainer from './PluginImageContainer'
import PluginTagsContainer from './PluginTagsContainer'
import { PluginCardProps } from './types'
import { ReactComponent as ICBookOpen } from '../../../Assets/Icon/ic-book-open.svg'

const PluginCard = ({
    isSelectable,
    pluginDataStore,
    handlePluginSelection,
    parentPluginId,
    isSelected,
    showCardBorder,
}: PluginCardProps) => {
    const latestPluginId = pluginDataStore.parentPluginStore[parentPluginId].latestVersionId
    const { icon, name, description, tags, pluginVersion, updatedBy, docLink } =
        pluginDataStore.pluginVersionStore[latestPluginId]

    const handleSelection = (e: React.MouseEvent | React.KeyboardEvent) => {
        if ('key' in e && e.key !== 'Enter') {
            return
        }

        handlePluginSelection(parentPluginId)
    }

    return (
        <div
            className={`p-12 flexbox dc__gap-16 dc__tab-focus plugin-card dc__visible-hover dc__visible-hover--parent ${showCardBorder ? 'dc__border br-4 dc__hover-n50' : ''}`}
            role="button"
            tabIndex={0}
            onClick={handleSelection}
            onKeyDown={handleSelection}
        >
            {isSelectable && (
                <div className={`dc__no-shrink icon-dim-40 p-8 ${!isSelected ? 'dc__visible-hover--child' : ''}`}>
                    <Checkbox
                        isChecked={isSelected}
                        onChange={handleSelection}
                        rootClassName="icon-dim-40 p-8 w-100 mb-0 dc__no-shrink"
                        value={CHECKBOX_VALUE.CHECKED}
                    />
                </div>
            )}

            {!isSelected && (
                <PluginImageContainer
                    fallbackImageClassName={`icon-dim-40 ${isSelectable ? 'dc__visible-hover--hide-child' : ''}`}
                    imageProps={{
                        src: icon,
                        alt: `${name} logo`,
                        width: 40,
                        height: 40,
                        className: `p-4 dc__no-shrink ${isSelectable ? 'dc__visible-hover--hide-child' : ''}`,
                    }}
                />
            )}

            <div className="flexbox-col dc__gap-12 w-100">
                <div className="flexbox-col dc__gap-8">
                    <div className="flexbox-col dc__gap-4">
                        <div className="flexbox dc__gap-6 w-100 dc__align-start dc__content-space">
                            <div className="flexbox dc__gap-4">
                                <h4 className="m-0 dc__truncate cn-9 fs-13 fw-6 lh-20 plugin-card__title">{name}</h4>
                                {!isSelectable && (
                                    <span className="dc__truncate cn-7 fs-12 fw-4 lh-20">({pluginVersion})</span>
                                )}
                            </div>

                            {docLink && (
                                <div className="flexbox dc__gap-4 dc__visible-hover--child dc__align-items-center">
                                    <a href={docLink} className="anchor" target="_blank" rel="noopener noreferrer">
                                        Learn more
                                    </a>

                                    <ICBookOpen className="icon-dim-12 dc__no-shrink" />
                                </div>
                            )}
                        </div>

                        <span className="dc__truncate cn-7 fs-12 fw-4 lh-16">By {updatedBy || 'Devtron'}</span>
                    </div>

                    {/* Plugin description */}
                    {description && <p className="m-0 cn-7 fs-12 fw-4 lh-16 dc__truncate--clamp-3">{description}</p>}
                </div>

                {/* Tag container */}
                <PluginTagsContainer tags={tags} />
            </div>
        </div>
    )
}

export default PluginCard
