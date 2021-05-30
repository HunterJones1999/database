import { GetServerSidePropsContext } from 'next';
import React from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import EditMedalModal from '../../components/admin/medals/EditMedalModal';
import Sidebar from '../../components/admin/Sidebar';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { getUser } from '../../lib/func';
import { collectStreams, streamsToProps } from '../../src/streams';
import { toast } from 'react-toastify';

export interface Medal {
    medal_id: number;
    name: string;
    image_url: string;
}

interface Props {
    medals: Medal[];
}

function Medals(props: Props): JSX.Element {

    const [ medals, setMedals ] = React.useState<Medal[]>([]);
    const [ medalRows, setMedalRows ] = React.useState<JSX.Element[]>();
    const [ search, setSearch ] = React.useState("");
    const [ page, setPage ] = React.useState(1);
    const [ path, setPath ] = React.useState("/api/searchMedals?");
    const [ selectedMedal, setSelectedMedal ] = React.useState<Medal>();
    const [ showDeleteMedalModal, setShowDeleteMedalModal ] = React.useState(false);
    const [ showEditMedalModal, setShowEditMedalModal ] = React.useState(false);
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
        setMedals(props.medals);
    }, [props.medals]);

    React.useEffect(() => {
        const result: JSX.Element[] = [];
        for (const medal of medals) {
            result.push(
                <tr key={medal.medal_id}>
                    <td>{medal.name}</td>
                    <td className="text-right">
                        <h5 className="fas fa-edit text-warning mr-2 mb-0 cursor-pointer" onClick={() => handleEditMedal(medal)}></h5>
                        <h5 className="fas fa-times-circle text-danger mb-0 cursor-pointer" onClick={() => handleDeleteMedal(medal)}></h5>
                    </td>
                </tr>
            );
        }
        setMedalRows(result);
    }, [medals]);

    const fetchPath = () => {
        fetch(path + "&page=" + page).then((response: Response) => {
			if (response.status !== 200) {
                return;
			}
			response.json().then((data) => {
				setMedals(data);
			});
		});
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPath("/api/searchMedals?search=" + search);
    }

    const handleCreateMedal = () => {
        setCreateMode(true);
        setShowEditMedalModal(true);
    }

    const handleEditMedal = (medal: Medal) => {
        setSelectedMedal(medal);
        setCreateMode(false);
        setShowEditMedalModal(true);
    }

    const handleDeleteMedal = (medal: Medal) => {
        setSelectedMedal(medal);
        setShowDeleteMedalModal(true);
    }

    const handleDelete = () => {
        fetch("/api/action/deleteMedal", { 
            method: "POST",
            body: JSON.stringify({
                medal_id: selectedMedal
            })
        }).then(response => {
            if (response.status === 200) {
                toast.success("Medal was deleted");
            } else {
                toast.error("Something went wrong!");
            }
            fetchPath();
        });
        setShowDeleteMedalModal(false);
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
                        <Button variant="link" className="mr-2" onClick={handleCreateMedal}><i className="fas fa-plus text-success"></i></Button>
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
                        {medalRows}
                    </tbody>
                </Table>
            </Container>
            <DeleteConfirmModal show={showDeleteMedalModal} onHide={() => setShowDeleteMedalModal(false)} handleDelete={handleDelete} />
            <EditMedalModal medal={selectedMedal} show={showEditMedalModal} createMode={createMode} onHide={() => { 
                setShowEditMedalModal(false);
                fetchPath();
            }} />
        </div>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext & Horus.SessionContext): Promise<any> {
	const user = await getUser(context);
	return { props: { ...user, ...streamsToProps(await collectStreams(context, user?.user, ["medals"])) }};
}

export default Medals;