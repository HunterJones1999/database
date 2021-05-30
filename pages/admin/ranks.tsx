import { GetServerSidePropsContext } from 'next';
import React from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import Sidebar from '../../components/admin/Sidebar';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { getUser } from '../../lib/func';
import { collectStreams, streamsToProps } from '../../src/streams';
import { toast } from 'react-toastify';
import EditRankModal from '../../components/admin/ranks/EditRankModal';

export interface Rank {
    rank_id: number;
    name: string;
    color: string;
}

interface Props {
    ranks: Rank[];
}

function Ranks(props: Props): JSX.Element {

    const [ ranks, setRanks ] = React.useState<Rank[]>([]);
    const [ rankRows, setRankRows ] = React.useState<JSX.Element[]>();
    const [ search, setSearch ] = React.useState("");
    const [ page, setPage ] = React.useState(1);
    const [ path, setPath ] = React.useState("/api/searchRanks?");
    const [ selectedRank, setSelectedRank ] = React.useState<Rank>();
    const [ showDeleteRankModal, setShowDeleteRankModal ] = React.useState(false);
    const [ showEditRankModal, setShowEditRankModal ] = React.useState(false);
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
        setRanks(props.ranks);
    }, [props.ranks]);

    React.useEffect(() => {
        const result: JSX.Element[] = [];
        for (const rank of ranks) {
            result.push(
                <tr key={rank.rank_id}>
                    <td>{rank.name}</td>
                    <td className="text-right">
                        <h5 className="fas fa-edit text-warning mr-2 mb-0 cursor-pointer" onClick={() => handleEditRank(rank)}></h5>
                        <h5 className="fas fa-times-circle text-danger mb-0 cursor-pointer" onClick={() => handleDeleteRank(rank)}></h5>
                    </td>
                </tr>
            );
        }
        setRankRows(result);
    }, [ranks]);

    const fetchPath = () => {
        fetch(path + "&page=" + page).then((response: Response) => {
			if (response.status !== 200) {
                return;
			}
			response.json().then((data) => {
				setRanks(data);
			});
		});
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPath("/api/searchRanks?search=" + search);
    }

    const handleCreateRank = () => {
        setCreateMode(true);
        setShowEditRankModal(true);
    }

    const handleEditRank = (rank: Rank) => {
        setSelectedRank(rank);
        setCreateMode(false);
        setShowEditRankModal(true);
    }

    const handleDeleteRank = (rank: Rank) => {
        setSelectedRank(rank);
        setShowDeleteRankModal(true);
    }

    const handleDelete = () => {
        fetch("/api/action/deleteRank", { 
            method: "POST",
            body: JSON.stringify({
                rank_id: selectedRank
            })
        }).then(response => {
            if (response.status === 200) {
                toast.success("Rank was deleted");
            } else {
                toast.error("Something went wrong!");
            }
            fetchPath();
        });
        setShowDeleteRankModal(false);
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
                        <Button variant="link" className="mr-2" onClick={handleCreateRank}><i className="fas fa-plus text-success"></i></Button>
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
                        {rankRows}
                    </tbody>
                </Table>
            </Container>
            <DeleteConfirmModal show={showDeleteRankModal} onHide={() => setShowDeleteRankModal(false)} handleDelete={handleDelete} />
            <EditRankModal rank={selectedRank} show={showEditRankModal} createMode={createMode} onHide={() => { 
                setShowEditRankModal(false);
                fetchPath();
            }} />
        </div>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext & Horus.SessionContext): Promise<any> {
	const user = await getUser(context);
	return { props: { ...user, ...streamsToProps(await collectStreams(context, user?.user, ["ranks"])) }};
}

export default Ranks;