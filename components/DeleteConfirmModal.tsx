import React from 'react';
import { Button, Modal } from 'react-bootstrap';

interface Props {
    show: boolean;
    onHide: () => void;
    handleDelete: () => void;
}

function DeleteConfirmModal(props: Props): JSX.Element {
    return (
        <Modal show={props.show} onHide={props.onHide}>
            <Modal.Header>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-0">Are you sure you want to delete this? This action cannot be undone</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onHide}>Cancel</Button>
                <Button variant="danger" onClick={props.handleDelete}>Delete</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteConfirmModal;