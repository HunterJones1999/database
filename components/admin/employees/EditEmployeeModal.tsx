import React from 'react'
import { Button, Col, Dropdown, DropdownButton, Form, Modal, Table } from 'react-bootstrap';
import { DetailedEmployee, Employee, MedalEntry, QualificationEntry } from '../../../pages/admin/employees';
import { Rank } from '../../../pages/admin/ranks';
import { toast } from 'react-toastify';
import { Qualification } from '../../../pages/admin/qualifications';
import { Medal } from '../../../pages/admin/medals';
import Image from 'next/image';

interface Props {
    employee: Employee;
    ranks: Rank[];
    qualifications: Qualification[];
    medals: Medal[];
    show: boolean;
    onHide: () => void;
    createMode: boolean;
    user: Horus.User;
}

export const defaultPermissions: Horus.UserPrivileges = {
    createEmployee: false,
    editEmployee: {
        base: false,
        name: false,
        rank: false,
        steamId: false,
        giveMedal: false,
        takeMedal: false,
        profileURL: false,
        editPermissions: false,
        giveQualification: false,
        takeQualification: false
    },
    deleteEmployee: false,
    createRank: false,
    editRank: {
        base: false,
        name: false,
        color: false
    },
    deleteRank: false,
    createQualification: false,
    editQualification: {
        base: false,
        name: false
    },
    deleteQualification: false,
    createMedal: false,
    editMedal: {
        base: false,
        name: false,
        imageUrl: false
    },
    deleteMedal: false
};

function EditEmployeeModal(props: Props): JSX.Element {

    const [ employeeDetails, setEmployeeDetails ] = React.useState<DetailedEmployee>();
    const [ rankOptions, setRankOptions ] = React.useState<JSX.Element[]>([]);
    const [ qualificationOptions, setQualificationOptions ] = React.useState<JSX.Element[]>([]);
    const [ medalOptions, setMedalOptions ] = React.useState<JSX.Element[]>([]);
    
    const [ name, setName ] = React.useState("");
    const [ steamId, setSteamId ] = React.useState("");
    const [ rankId, setRankId ] = React.useState(1);
    const [ profileURL, setProfileURL ] = React.useState("");

    const [ employeeQualifications, setEmployeeQualifications ] = React.useState<QualificationEntry[]>([]);
    const [ qualificationRows, setQualificationRows ] = React.useState<JSX.Element[]>([]);
    const [ qualificationNames, setQualificationNames ] = React.useState<{[key: number]: string}>({});
    const [ nextQualificationId, setNextQualificationId ] = React.useState(0);

    const [ employeeMedals, setEmployeeMedals ] = React.useState<MedalEntry[]>([]);
    const [ medalRows, setMedalRows ] = React.useState<JSX.Element[]>([]);
    const [ medalNames, setMedalNames ] = React.useState<{[key: number]: string}>({});
    const [ nextMedalId, setNextMedalId ] = React.useState(0);

    const [ employeePermissions, setEmployeePermissions ] = React.useState<Horus.UserPrivileges>(defaultPermissions);

    React.useEffect(() => {
        if (props.employee && !props.createMode) {
            fetch(`/api/employeeDetails?id=${props.employee.employee_id}`).then(result => {
                result.json().then(data => {
                    setEmployeeDetails(data);
                });
            });
        }
    }, [props.employee]);

    React.useEffect(() => {
        const result = [];
        for (const rank of props.ranks) {
            result.push(
                <option key={rank.rank_id} value={rank.rank_id} >{rank.name}</option>
            );
        }
        setRankOptions(result);
    }, [props.ranks]);

    React.useEffect(() => {
        const names = {};
        const result = [];
        for (const qualification of props.qualifications) {
            result.push(
                <Dropdown.Item key={qualification.qualification_id} as="button" onClick={(e) => { 
                    e.preventDefault();
                    addQualification(qualification.qualification_id);
                }} >{qualification.name}</Dropdown.Item>
            );
            names[qualification.qualification_id] = qualification.name;
        }
        setQualificationOptions(result);
        setQualificationNames(names);
    }, [employeeDetails, props.qualifications, employeeQualifications, employeeMedals]); // I don't know why I need to include employeeQualifications, medals, and employeeDetails here, but I do.

    React.useEffect(() => {
        const names = {};
        const result = [];
        for (const medal of props.medals) {
            result.push(
                <Dropdown.Item key={medal.medal_id} as="button" onClick={(e) => { 
                    e.preventDefault();
                    addMedal(medal.medal_id);
                }} >{medal.name}</Dropdown.Item>
            );
            names[medal.medal_id] = medal.name;
        }
        setMedalOptions(result);
        setMedalNames(names);
    }, [employeeDetails, props.qualifications, employeeQualifications, employeeMedals]); // See above comment

    React.useEffect(() => {
        if (employeeDetails) {
            setName(employeeDetails.basic.name ?? "");
            setSteamId(employeeDetails.basic.steamid ?? "");
            setRankId(employeeDetails.basic.rank_id ?? 1);
            setEmployeeQualifications(employeeDetails.qualifications ?? []);
            setEmployeeMedals(employeeDetails.medals ?? []);
            setProfileURL(employeeDetails.basic.profile_url ?? "");
            setEmployeePermissions(employeeDetails.basic.priv);
        }
    }, [employeeDetails]);

    React.useEffect(() => {
        if (!employeeDetails) {
            return;
        }
        const result = [];
        for (const qual of employeeQualifications) {
            setNextQualificationId(Math.max(nextQualificationId, qual.id) + 1);
            result.push(
                <tr key={qual.id} >
                    <td>{qual.name}</td>
                    <td>{qual.trainer_name}</td>
                    <td>{new Date(qual.entry_date * 1000).toLocaleDateString()}</td>
                    { props.user?.priv.editEmployee.takeQualification ?
                    <td><h5 className="fas fa-times-circle text-danger mb-0 cursor-pointer" onClick={() => removeQualification(qual.id)}></h5></td>
                    : ""}
                </tr>
            );
        }
        setQualificationRows(result);
    }, [employeeQualifications, employeeDetails]);

    React.useEffect(() => {
        if (!employeeDetails) {
            return;
        }
        const result = [];
        for (const medal of employeeMedals) {
            setNextMedalId(Math.max(nextMedalId, medal.id) + 1);
            result.push(
                <tr key={medal.id} >
                    <td>{medal.name}</td>
                    { props.user?.priv.editEmployee.takeMedal ?
                    <td><h5 className="fas fa-times-circle text-danger mb-0 cursor-pointer" onClick={() => removeMedal(medal.id)}></h5></td>
                    : ""}
                </tr>
            );
        }
        setMedalRows(result);
    }, [employeeMedals, employeeDetails]);

    const addQualification = (qualification_id: number) => {
        const result: QualificationEntry[] = [];
        result.push(...employeeQualifications);
        fetch(`/api/employeeDetails?id=${props.user?.employee_id}`).then(response => {
            response.json().then(data => {
                const qual: QualificationEntry = {
                    id: nextQualificationId,
                    qualification_id,
                    name: qualificationNames[qualification_id],
                    receiver_id: employeeDetails.basic.employee_id,
                    trainer_id: props.user?.employee_id,
                    trainer_name: data?.basic.name,
                    entry_date: (new Date()).getTime() / 1000
                }
                setNextQualificationId(nextQualificationId + 1);
                result.push(qual);
                setEmployeeQualifications(result);
            });
        });
    }

    const removeQualification = (id: number) => {
        const result: QualificationEntry[] = [];
        for (const qual of employeeQualifications) {
            if (qual.id !== id) {
                result.push(qual);
            }
        }
        setEmployeeQualifications(result);
    }

    const addMedal = (medal_id: number) => {
        const result: MedalEntry[] = [];
        result.push(...employeeMedals);
        const medal: MedalEntry = {
            id: nextMedalId,
            medal_id,
            name: medalNames[medal_id],
            image_url: null // This isn't used here, so this is fine
        }
        setNextMedalId(nextMedalId + 1);
        result.push(medal);
        setEmployeeMedals(result);
    }

    const removeMedal = (id: number) => {
        const result: MedalEntry[] = [];
        for (const medal of employeeMedals) {
            if (medal.id !== id) {
                result.push(medal);
            }
        }
        setEmployeeMedals(result);
    }

    const hide = () => {
        props.onHide();
        setName("");
        setSteamId("");
        setRankId(1);
        setEmployeeQualifications([]);
        setQualificationRows([]);
        setQualificationOptions([]);
        setQualificationNames({});
        setEmployeeMedals([]);
        setMedalRows([]);
        setMedalOptions([]);
        setMedalNames({});
        setEmployeePermissions(defaultPermissions);
        setEmployeeDetails(null);
    }

    const save = () => {
        if (props.createMode) {
            fetch("/api/action/createEmployee", { 
                method: "POST",
                body: JSON.stringify({
                    name,
                    steamid: steamId,
                    rank_id: rankId,
                    profile_url: profileURL,
                    access_blob: JSON.stringify(employeePermissions)
                })
            }).then(response => {
                if (response.status === 200) {
                    toast.success("Employee was created!");
                } else {
                    toast.error("Something went wrong!");
                }
                hide();
            });
        } else {
            const obj = {
                employee_id: employeeDetails.basic.employee_id
            };

            let modified = false;

            if (name !== employeeDetails.basic.name) {
                obj["name"] = name;
                modified = true;
            }
            if (rankId !== employeeDetails.basic.rank_id) {
                obj["rank_id"] = rankId;
                modified = true;
            }
            if (steamId !== employeeDetails.basic.steamid) {
                obj["steamid"] = steamId;
                modified = true;
            }
            if (profileURL !== employeeDetails.basic.profile_url) {
                obj["profile_url"] = profileURL;
                modified = true;
            }
            if (employeePermissions !== employeeDetails.basic.priv) {
                obj["access_blob"] = JSON.stringify(employeePermissions);
                modified = true;
            }

            if (modified) {
                fetch("/api/action/editEmployee", { 
                    method: "POST",
                    body: JSON.stringify(obj)
                }).then(response => {
                    if (response.status === 200) {
                        toast.success("Employee was edited");
                    } else {
                        toast.error("Something went wrong");
                    }
                });
            }

            const promises = [];

            if (employeeQualifications !== employeeDetails.qualifications) {
                for (const qual of employeeQualifications) {
                    if (!employeeDetails.qualifications.includes(qual)) {
                        promises.push(new Promise(resolve => {
                            fetch("/api/action/giveQualification", {
                                method: "POST",
                                body: JSON.stringify({
                                    qualification_id: qual.qualification_id,
                                    receiver_id: employeeDetails.basic.employee_id,
                                    entry_date: qual.entry_date
                                })
                            }).then(response => {
                                resolve(response.status);
                            });
                        }));
                    }
                }
                for (const qual of employeeDetails.qualifications) {
                    if (!employeeQualifications.includes(qual)) {
                        promises.push(new Promise(resolve => {
                            fetch("/api/action/takeQualification", {
                                method: "POST",
                                body: JSON.stringify({
                                    id: qual.id
                                })
                            }).then(response => {
                                resolve(response.status);
                            });
                        }));
                    }
                }
            }

            if (employeeMedals !== employeeDetails.medals) {
                for (const medal of employeeDetails.medals) {
                    if (!employeeMedals.includes(medal)) {
                        promises.push(new Promise(resolve => {
                            fetch("/api/action/takeMedal", {
                                method: "POST",
                                body: JSON.stringify({
                                    id: medal.id
                                })
                            }).then(response => {
                                resolve(response.status);
                            });
                        }));
                    }
                }
                for (const medal of employeeMedals) {
                    if (!employeeDetails.medals.includes(medal)) {
                        promises.push(new Promise(resolve => {
                            fetch("/api/action/giveMedal", {
                                method: "POST",
                                body: JSON.stringify({
                                    medal_id: medal.medal_id,
                                    employee_id: employeeDetails.basic.employee_id
                                })
                            }).then(response => {
                                resolve(response.status);
                            });
                        }));
                    }
                }
            }

            if (promises.length !== 0) {
                Promise.all(promises).then(results => {
                    hide();
                    if (!modified) {
                        for (const result of results) {
                            if (result !== 200) {
                                toast.error("Something went wrong");
                                return;
                            }
                        }
                        toast.success("Employee was edited")
                    }
                });
            } else {
                hide();
            }
        }
    }

    if (!employeeDetails && !props.createMode) {
        return (
            <Modal 
                show={props.show} 
                onHide={hide}
                backdrop="static"
                size="lg"
            >
                <p>Loading...</p>
            </Modal>
        )
    }

    return (
        <Modal 
            show={props.show} 
            onHide={hide}
            backdrop="static"
            size="lg"
        >
            <Modal.Header>
                <Modal.Title>{props.createMode ? "Create" : "Edit"} Employee</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Row className="mb-2">
                        <Col className="d-flex flex-column justify-content-between">
                            <Form.Group>
                                <Form.Label htmlFor="name" >Name</Form.Label>
                                <Form.Control disabled={!props.user?.priv.editEmployee.name} id="name" onChange={(event) => setName(event.target.value)} value={name} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label htmlFor="steamid" >Steam ID</Form.Label>
                                <Form.Control disabled={!props.user?.priv.editEmployee.steamId} id="steamid" onChange={(event) => setSteamId(event.target.value)} value={steamId} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label htmlFor="rank" >Rank</Form.Label>
                                <Form.Control disabled={!props.user?.priv.editEmployee.rank} id="rank" as="select" onChange={(event) => setRankId(parseInt(event.target.value))} value={rankId}>
                                    {rankOptions}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col sm={5} className="d-flex flex-column align-items-center">
                            {employeeDetails?.basic.profile_url ?
                            <Image className="mb-1" width={150} height={200} src={employeeDetails.basic.profile_url} alt="Profile Picture" />
                            :
                            <Image className="mb-1" width={150} height={200} src="https://via.placeholder.com/150x200?text=Placeholder" alt="Profile Picture" />}
                            <Form.Group className="w-100">
                                <Form.Label htmlFor="profile" >Profile Picture URL</Form.Label>
                                <Form.Control disabled={!props.user?.priv.editEmployee.profileURL} id="profile" onChange={(event) => setProfileURL(event.target.value)} value={profileURL} />
                            </Form.Group>
                        </Col>
                    </Form.Row>
                    {!props.createMode ? <>
                    <Form.Row className="mb-3">
                        <Form.Row className="mb-2 justify-content-between w-100" >
                            <Col className="flex-grow-0 d-flex align-items-center">
                                <h5 className="mb-0 ml-1">Qualifications</h5>
                            </Col>
                            <Col className="flex-grow-0">
                                {props.user?.priv.editEmployee.giveQualification ?
                                <DropdownButton title="Add">
                                    {qualificationOptions}
                                </DropdownButton>
                                : ""}
                            </Col>
                        </Form.Row>
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Given By</th>
                                    <th>Date Given</th>
                                    {props.user?.priv.editEmployee.takeQualification ?
                                    <th className="shrink-column"></th>
                                    : ""}
                                </tr>
                            </thead>
                            <tbody>
                                {qualificationRows}
                            </tbody>
                        </Table>
                    </Form.Row>
                    <Form.Row className="mb-3" >
                        <Form.Row className="mb-2 justify-content-between w-100" >
                            <Col className="flex-grow-0 d-flex align-items-center">
                                <h5 className="mb-0 ml-1">Medals</h5>
                            </Col>
                            <Col className="flex-grow-0">
                                {props.user?.priv.editEmployee.giveMedal ?
                                <DropdownButton title="Add">
                                    {medalOptions}
                                </DropdownButton>
                                : ""}
                            </Col>
                        </Form.Row>
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    {props.user?.priv.editEmployee.takeMedal ?
                                    <th className="shrink-column"></th>
                                    : ""}
                                </tr>
                            </thead>
                            <tbody>
                                {medalRows}
                            </tbody>
                        </Table>
                    </Form.Row>
                    </> : ""}
                    { props.user?.priv.editEmployee.editPermissions ? <>
                    <Form.Row>
                        <h5 className="ml-1">Permissions</h5>
                    </Form.Row>
                    <Form.Row>
                        <Col md={6} lg={3} className="mb-4">
                            <Form.Check label="Create Employee" onChange={event => setEmployeePermissions({ ...employeePermissions, createEmployee: event.target.checked })} checked={employeePermissions.createEmployee} />
                            <Form.Check label="Edit Employee" onChange={event => setEmployeePermissions({ ...employeePermissions, editEmployee: { ...employeePermissions.editEmployee, base: event.target.checked } })} checked={employeePermissions.editEmployee?.base} />
                            <Form.Check className="ml-4" label="Name" onChange={event => setEmployeePermissions({ ...employeePermissions, editEmployee: { ...employeePermissions.editEmployee, name: event.target.checked } })} checked={employeePermissions.editEmployee?.name} disabled={!employeePermissions.editEmployee?.base} />
                            <Form.Check className="ml-4" label="Steam ID" onChange={event => setEmployeePermissions({ ...employeePermissions, editEmployee: { ...employeePermissions.editEmployee, steamId: event.target.checked } })} checked={employeePermissions.editEmployee?.steamId} disabled={!employeePermissions.editEmployee?.base} />
                            <Form.Check className="ml-4" label="Rank" onChange={event => setEmployeePermissions({ ...employeePermissions, editEmployee: { ...employeePermissions.editEmployee, rank: event.target.checked } })} checked={employeePermissions.editEmployee?.rank} disabled={!employeePermissions.editEmployee?.base} />
                            <Form.Check className="ml-4" label="Profile URL" onChange={event => setEmployeePermissions({ ...employeePermissions, editEmployee: { ...employeePermissions.editEmployee, profileURL: event.target.checked } })} checked={employeePermissions.editEmployee?.profileURL} disabled={!employeePermissions.editEmployee?.base} />
                            <Form.Check className="ml-4" label="Give Qualification" onChange={event => setEmployeePermissions({ ...employeePermissions, editEmployee: { ...employeePermissions.editEmployee, giveQualification: event.target.checked } })} checked={employeePermissions.editEmployee?.giveQualification} disabled={!employeePermissions.editEmployee?.base} />
                            <Form.Check className="ml-4" label="Take Qualification" onChange={event => setEmployeePermissions({ ...employeePermissions, editEmployee: { ...employeePermissions.editEmployee, takeQualification: event.target.checked } })} checked={employeePermissions.editEmployee?.takeQualification} disabled={!employeePermissions.editEmployee?.base} />
                            <Form.Check className="ml-4" label="Give Medal" onChange={event => setEmployeePermissions({ ...employeePermissions, editEmployee: { ...employeePermissions.editEmployee, giveMedal: event.target.checked } })} checked={employeePermissions.editEmployee?.giveMedal} disabled={!employeePermissions.editEmployee?.base} />
                            <Form.Check className="ml-4" label="Take Medal" onChange={event => setEmployeePermissions({ ...employeePermissions, editEmployee: { ...employeePermissions.editEmployee, takeMedal: event.target.checked } })} checked={employeePermissions.editEmployee?.takeMedal} disabled={!employeePermissions.editEmployee?.base} />
                            <Form.Check className="ml-4" label="Edit Permissions" onChange={event => setEmployeePermissions({ ...employeePermissions, editEmployee: { ...employeePermissions.editEmployee, editPermissions: event.target.checked } })} checked={employeePermissions.editEmployee?.editPermissions} disabled={!employeePermissions.editEmployee?.base} />
                            <Form.Check label="Delete Employee" onChange={event => setEmployeePermissions({ ...employeePermissions, deleteEmployee: event.target.checked })} checked={employeePermissions.deleteEmployee} />
                        </Col>
                        <Col md={6} lg={3} className="mb-4">
                            <Form.Check label="Create Rank" onChange={event => setEmployeePermissions({ ...employeePermissions, createRank: event.target.checked })} checked={employeePermissions.createRank} />
                            <Form.Check label="Edit Rank" onChange={event => setEmployeePermissions({ ...employeePermissions, editRank: { ...employeePermissions.editRank, base: event.target.checked } })} checked={employeePermissions.editRank?.base} />
                            <Form.Check className="ml-4" label="Name" onChange={event => setEmployeePermissions({ ...employeePermissions, editRank: { ...employeePermissions.editRank, name: event.target.checked } })} checked={employeePermissions.editRank?.name} disabled={!employeePermissions.editRank?.base} />
                            <Form.Check className="ml-4" label="Color" onChange={event => setEmployeePermissions({ ...employeePermissions, editRank: { ...employeePermissions.editRank, color: event.target.checked } })} checked={employeePermissions.editRank?.color} disabled={!employeePermissions.editRank?.base} />
                            <Form.Check label="Delete Rank" onChange={event => setEmployeePermissions({ ...employeePermissions, deleteRank: event.target.checked })} checked={employeePermissions.deleteRank} />
                        </Col>
                        <Col md={6} lg={3} className="mb-4">
                            <Form.Check label="Create Qualification" onChange={event => setEmployeePermissions({ ...employeePermissions, createQualification: event.target.checked })} checked={employeePermissions.createQualification} />
                            <Form.Check label="Edit Qualification" onChange={event => setEmployeePermissions({ ...employeePermissions, editQualification: { ...employeePermissions.editQualification, base: event.target.checked } })} checked={employeePermissions.editQualification?.base} />
                            <Form.Check className="ml-4" label="Name" onChange={event => setEmployeePermissions({ ...employeePermissions, editQualification: { ...employeePermissions.editQualification, name: event.target.checked } })} checked={employeePermissions.editQualification?.name} disabled={!employeePermissions.editQualification?.base} />
                            <Form.Check label="Delete Qualification" onChange={event => setEmployeePermissions({ ...employeePermissions, deleteQualification: event.target.checked })} checked={employeePermissions.deleteQualification} />
                        </Col>
                        <Col md={6} lg={3}>
                            <Form.Check label="Create Medal" onChange={event => setEmployeePermissions({ ...employeePermissions, createMedal: event.target.checked })} checked={employeePermissions.createMedal} />
                            <Form.Check label="Edit Medal" onChange={event => setEmployeePermissions({ ...employeePermissions, editMedal: { ...employeePermissions.editMedal, base: event.target.checked } })} checked={employeePermissions.editMedal?.base} />
                            <Form.Check className="ml-4" label="Name" onChange={event => setEmployeePermissions({ ...employeePermissions, editMedal: { ...employeePermissions.editMedal, name: event.target.checked } })} checked={employeePermissions.editMedal?.name} disabled={!employeePermissions.editMedal?.base} />
                            <Form.Check className="ml-4" label="Image URL" onChange={event => setEmployeePermissions({ ...employeePermissions, editMedal: { ...employeePermissions.editMedal, imageUrl: event.target.checked } })} checked={employeePermissions.editMedal?.imageUrl} disabled={!employeePermissions.editMedal?.base} />
                            <Form.Check label="Delete Medal" onChange={event => setEmployeePermissions({ ...employeePermissions, deleteMedal: event.target.checked })} checked={employeePermissions.deleteMedal} />
                        </Col>
                    </Form.Row>
                    </> : ""}
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>Discard</Button>
                <Button onClick={save}>Save</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default EditEmployeeModal;
