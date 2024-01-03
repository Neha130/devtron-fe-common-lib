import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'
import info from '../../Assets/Icon/ic-info-filled.svg'
import { ConfirmationDialog, DeleteDialog } from '../Dialogs'
import { ServerErrors } from '../ServerError'
import { DeleteComponentProps } from './types'

const DeleteComponent = ({
    setDeleting,
    toggleConfirmation,
    deleteComponent,
    title,
    component,
    payload,
    confirmationDialogDescription = '',
    redirectTo = false,
    url = '',
    reload,
    configuration = '',
    closeCustomComponent,
}: DeleteComponentProps) => {
    const [showCannotDeleteDialogModal, setCannotDeleteDialogModal] = useState(false)
    const { push } = useHistory()

    async function handleDelete() {
        setDeleting(true)
        try {
            await deleteComponent(payload)
            toast.success('Successfully deleted')
            toggleConfirmation(false)
            if (redirectTo) {
                push(url)
            } else {
                reload()
            }
            if (typeof closeCustomComponent === 'function') {
                closeCustomComponent()
            }
        } catch (serverError) {
            if (serverError instanceof ServerErrors && serverError.code === 500) {
                setCannotDeleteDialogModal(true)
            }
        } finally {
            setDeleting(false)
        }
    }

    const handleConfirmation = () => {
        setCannotDeleteDialogModal(false)
        toggleConfirmation(false)
        if (typeof closeCustomComponent === 'function') {
            closeCustomComponent()
        }
    }

    const renderCannotDeleteDialogModal = () => (
        <ConfirmationDialog className="confirmation-dialog__body--w-360">
            <ConfirmationDialog.Icon src={info} />
            <ConfirmationDialog.Body title={`Cannot delete ${component} '${title}'`} />
            <p className="fs-13 cn-7 ">{confirmationDialogDescription}</p>
            <ConfirmationDialog.ButtonGroup>
                <button type="button" className="cta" onClick={handleConfirmation}>
                    Okay
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )

    const renderDeleteDialog = () => (
        <DeleteDialog
            title={`Delete ${component} '${title}'`}
            delete={handleDelete}
            closeDelete={() => toggleConfirmation(false)}
            dataTestId="delete-dialog"
        >
            <DeleteDialog.Description>
                <p>Are you sure you want to delete this {configuration || component}? </p>
            </DeleteDialog.Description>
        </DeleteDialog>
    )
    return (
        <div>
            {!showCannotDeleteDialogModal && renderDeleteDialog()}
            {showCannotDeleteDialogModal && renderCannotDeleteDialogModal()}
        </div>
    )
}

export default DeleteComponent
