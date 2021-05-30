import React from 'react'
import { Button, Form, Modal } from 'react-bootstrap';
import { Qualification } from '../../../pages/admin/qualifications';
import { toast } from 'react-toastify';

interface Props {
    qualification: Qualification;
    show: boolean;
    onHide: () => void;
    createMode: boolean;
}

function EditQualificationModal(props: Props): JSX.Element {

    const [ name, setName ] = React.useState("");

    React.useEffect(() => {
        if (props.qualification && !props.createMode) {
            setName(props.qualification.name);
        }
    }, [props.qualification]);

    const hide = () => {
        props.onHide();
        setName("");
    }

    const save = () => {
        if (props.createMode) {
            fetch("/api/action/createQualification", { 
                method: "POST",
                body: JSON.stringify({
                    name
                })
            }).then(response => {
                if (response.status === 200) {
                    toast.success("Qualification was created!");
                } else {
                    toast.error("Something went wrong!");
                }
                hide();
            });
        } else {
            const obj = {
                qualification_id: props.qualification.qualification_id
            };

            if (name !== props.qualification.name) {
                obj["name"] = name;
            }

            fetch("/api/action/editQualification", { 
                method: "POST",
                body: JSON.stringify(obj)
            }).then(response => {
                if (response.status === 200) {
                    toast.success("Qualification was edited!");
                } else {
                    toast.error("Something went wrong!");
                }
                hide();
            });

        }
    }

    return (
        <Modal 
            show={props.show} 
            onHide={hide}
            backdrop="static"
        >
            <Modal.Header>
                <Modal.Title>{props.createMode ? "Create" : "Edit"} Qualification</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label htmlFor="name">Name</Form.Label>
                        <Form.Control id="name" onChange={(event) => setName(event.target.value)} value={name} />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>Discard</Button>
                <Button onClick={save}>Save</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default EditQualificationModal;
