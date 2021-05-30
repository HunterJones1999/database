import React from 'react'
import { Button, Col, Form, Modal } from 'react-bootstrap';
import { Medal } from '../../../pages/admin/medals';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface Props {
    medal: Medal;
    show: boolean;
    onHide: () => void;
    createMode: boolean;
}

function EditMedalModal(props: Props): JSX.Element {

    const [ name, setName ] = React.useState("");
    const [ imageUrl, setImageUrl ] = React.useState("");

    React.useEffect(() => {
        if (props.medal && !props.createMode) {
            setName(props.medal.name);
            setImageUrl(props.medal.image_url);
        }
    }, [props.medal]);

    const hide = () => {
        props.onHide();
        setName("");
        setImageUrl("");
    }

    const save = () => {
        if (props.createMode) {
            fetch("/api/action/createMedal", { 
                method: "POST",
                body: JSON.stringify({
                    name,
                    image_url: imageUrl
                })
            }).then(response => {
                if (response.status === 200) {
                    toast.success("Medal was created!");
                } else {
                    toast.error("Something went wrong!");
                }
                hide();
            });
        } else {
            const obj = {
                medal_id: props.medal.medal_id
            };

            if (name !== props.medal.name) {
                obj["name"] = name;
            }
            if (imageUrl !== props.medal.image_url) {
                obj["image_url"] = imageUrl;
            }

            fetch("/api/action/editMedal", { 
                method: "POST",
                body: JSON.stringify(obj)
            }).then(response => {
                if (response.status === 200) {
                    toast.success("Medal was edited!");
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
                <Modal.Title>{props.createMode ? "Create" : "Edit"} Medal</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label htmlFor="name">Name</Form.Label>
                        <Form.Control id="name" onChange={(event) => setName(event.target.value)} value={name} />
                    </Form.Group>
                    <Form.Row>
                        <Col>
                            <Form.Group>
                                <Form.Label htmlFor="imageUrl">Image URL</Form.Label>
                                <Form.Control id="imageUrl" onChange={(event) => setImageUrl(event.target.value)} value={imageUrl} />
                            </Form.Group>
                        </Col>
                        <Col sm="auto" className="d-flex align-items-end justify-content-center" >
							<div className="mb-3">
							{props.medal?.image_url ?
							<Image width={120} height={35} src={props.medal.image_url} quality={100} />
							:
                            <Image width={120} height={35} src="https://via.placeholder.com/120x35?text=Image" quality={100} />}
							</div>
                        </Col>
                    </Form.Row> 
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>Discard</Button>
                <Button onClick={save}>Save</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default EditMedalModal;
