import { GetServerSidePropsContext } from 'next';
import React from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import EditQualificationModal from '../../components/admin/qualifications/EditQualificationModal';
import Sidebar from '../../components/admin/Sidebar';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { getUser } from '../../lib/func';
import { collectStreams, streamsToProps } from '../../src/streams';
import { toast } from 'react-toastify';

export interface Qualification {
    qualification_id: number;
    name: string;
}

interface Props {
    qualifications: Qualification[];
}

function Qualifications(props: Props): JSX.Element {

    const [ qualifications, setQualifications ] = React.useState<Qualification[]>([]);
    const [ qualificationRows, setQualificationRows ] = React.useState<JSX.Element[]>();
    const [ search, setSearch ] = React.useState("");
    const [ page, setPage ] = React.useState(1);
    const [ path, setPath ] = React.useState("/api/searchQualifications?");
    const [ selectedQualification, setSelectedQualification ] = React.useState<Qualification>();
    const [ showDeleteQualificationModal, setShowDeleteQualificationModal ] = React.useState(false);
    const [ showEditQualificationModal, setShowEditQualificationModal ] = React.useState(false);
    const [ createMode, setCreateMode ] = React.useState(false);

    const loaded = React.useRef(false);
    React.useEffect(() => {
        if (!loaded.current) {
			loaded.current = true;
		} else {
			fetchPath();
		}
    }, [page, path]);

    React.useEffect(() => {
        setQualifications(props.qualifications);
    }, [props.qualifications]);

    React.useEffect(() => {
        const result: JSX.Element[] = [];
        for (const qualification of qualifications) {
            result.push(
                <tr key={qualification.qualification_id}>
                    <td>{qualification.name}</td>
                    <td className="text-right">
                        <h5 className="fas fa-edit text-warning mr-2 mb-0 cursor-pointer" onClick={() => handleEditQualification(qualification)}></h5>
                        <h5 className="fas fa-times-circle text-danger mb-0 cursor-pointer" onClick={() => handleDeleteQualification(qualification)}></h5>
                    </td>
                </tr>
            );
        }
        setQualificationRows(result);
    }, [qualifications]);

    const fetchPath = () => {
        fetch(path + "&page=" + page).then((response: Response) => {
			if (response.status !== 200) {
                return;
			}
			response.json().then((data) => {
				setQualifications(data);
			});
		});
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPath("/api/searchQualifications?search=" + search);
    }

    const handleCreateQualification = () => {
        setCreateMode(true);
        setShowEditQualificationModal(true);
    }

    const handleEditQualification = (qualification: Qualification) => {
        setSelectedQualification(qualification);
        setCreateMode(false);
        setShowEditQualificationModal(true);
    }

    const handleDeleteQualification = (qualification: Qualification) => {
        setSelectedQualification(qualification);
        setShowDeleteQualificationModal(true);
    }

    const handleDelete = () => {
        fetch("/api/action/deleteQualification", { 
            method: "POST",
            body: JSON.stringify({
                qualification_id: selectedQualification
            })
        }).then(response => {
            if (response.status === 200) {
                toast.success("Qualification was deleted");
            } else {
                toast.error("Something went wrong!");
            }
            fetchPath();
        });
        setShowDeleteQualificationModal(false);
    }

    return (
        <div className="d-flex">
            <Sidebar />
            <Container fluid className="d-flex flex-column">
                <Row className="mb-4">
                    <Col>
                        <Form inline onSubmit={handleSearch}>
                            <Form.Control className="mr-3" placeholder="Search..." onChange={event => setSearch(event.target.value)} value={search} />
                            <Button type="submit">Search</Button>
                        </Form>
                    </Col>
                    <Col className="d-flex align-items-center justify-content-end">
                        <Button variant="link" className="mr-2" onClick={handleCreateQualification}><i className="fas fa-plus text-success"></i></Button>
                        <Button variant="link" className="no-style-button mr-2" onClick={() => setPage(Math.max(1, page - 1))}><i className="fas fa-chevron-left"></i></Button>
                        <p className="mb-0">Page {page}</p>
                        <Button variant="link" className="no-style-button ml-2" onClick={() => setPage(page + 1)}><i className="fas fa-chevron-right"></i></Button>
                    </Col>
                </Row>
                <Table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {qualificationRows}
                    </tbody>
                </Table>
            </Container>
            <DeleteConfirmModal show={showDeleteQualificationModal} onHide={() => setShowDeleteQualificationModal(false)} handleDelete={handleDelete} />
            <EditQualificationModal qualification={selectedQualification} show={showEditQualificationModal} createMode={createMode} onHide={() => { 
                setShowEditQualificationModal(false);
                fetchPath();
            }} />
        </div>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext & Horus.SessionContext): Promise<any> {
	const user = await getUser(context);
	return { props: { ...user, ...streamsToProps(await collectStreams(context, user?.user, ["qualifications"])) }};
}

export default Qualifications;