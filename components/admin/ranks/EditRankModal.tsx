import React from 'react'
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { Rank } from '../../../pages/admin/ranks';
import { toast } from 'react-toastify';

interface Props {
    rank: Rank;
    show: boolean;
    onHide: () => void;
    createMode: boolean;
}

function EditRankModal(props: Props): JSX.Element {

    const [ name, setName ] = React.useState("");
    const [ color, setColor ] = React.useState("");

    React.useEffect(() => {
        if (props.rank && !props.createMode) {
            setName(props.rank.name);
            setColor(props.rank.color);
        }
    }, [props.rank]);

    const hide = () => {
        props.onHide();
        setName("");
        setColor("");
    }

    const save = () => {
        if (props.createMode) {
            fetch("/api/action/createRank", { 
                method: "POST",
                body: JSON.stringify({
                    name,
                    color
                })
            }).then(response => {
                if (response.status === 200) {
                    toast.success("Rank was created!");
                } else {
                    toast.error("Something went wrong!");
                }
                hide();
            });
        } else {
            const obj = {
                rank_id: props.rank.rank_id
            };

            if (name !== props.rank.name) {
                obj["name"] = name;
            }

            if (color !== props.rank.color) {
                obj["color"] = color;
            }

            fetch("/api/action/editRank", { 
                method: "POST",
                body: JSON.stringify(obj)
            }).then(response => {
                if (response.status === 200) {
                    toast.success("Rank was edited!");
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
                <Modal.Title>{props.createMode ? "Create" : "Edit"} Rank</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label htmlFor="name">Name</Form.Label>
                        <Form.Control id="name" onChange={event => setName(event.target.value)} value={name} />
                    </Form.Group>
                    <Form.Label htmlFor="color">Color</Form.Label>
                    <InputGroup hasValidation >
                        <InputGroup.Prepend>
                            <InputGroup.Text>#</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control isInvalid={/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.exec(color) === null} id="color" onChange={event => setColor(event.target.value)} value={color} />
                        <Form.Control.Feedback type="invalid">{"That's not a valid color code"}</Form.Control.Feedback>
                    </InputGroup>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>Discard</Button>
                <Button onClick={save}>Save</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default EditRankModal;
