import { GetServerSidePropsContext } from 'next';
import React from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import EditEmployeeModal from '../../components/admin/employees/EditEmployeeModal';
import Sidebar from '../../components/admin/Sidebar';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { getUser } from '../../lib/func';
import { collectStreams, streamsToProps } from '../../src/streams';
import { toast } from 'react-toastify';
import { Rank } from './ranks';
import { Qualification } from './qualifications';
import { Medal } from './medals';

export interface Employee {
    employee_id: number;
    rank_id: number;
    name: string;
    start_date: number;
    steamid: string;
    profile_url: string;
    priv: Horus.UserPrivileges;
}

export type QualificationEntry = Qualification & {
    id: number;
    receiver_id: number;
    trainer_id: number;
    entry_date: number;
    trainer_name: string;
}

export type MedalEntry = Medal & {
    id: number;
}

export interface DetailedEmployee {
    basic: Employee & {
        rank_name: string;
        color: string;
    },
    qualifications: QualificationEntry[],
    medals: MedalEntry[],
}

interface Props {
    employees: Employee[];
    ranks: Rank[];
    qualifications: Qualification[];
    medals: Medal[];
    user: Horus.User
}

function Employees(props: Props): JSX.Element {

    const [ employees, setEmployees ] = React.useState<Employee[]>([]);
    const [ employeeRows, setEmployeeRows ] = React.useState<JSX.Element[]>();
    const [ search, setSearch ] = React.useState("");
    const [ page, setPage ] = React.useState(1);
    const [ path, setPath ] = React.useState("/api/searchEmployees?");
    const [ selectedEmployee, setSelectedEmployee ] = React.useState<Employee>();
    const [ showDeleteEmployeeModal, setShowDeleteEmployeeModal ] = React.useState(false);
    const [ showEditEmployeeModal, setShowEditEmployeeModal ] = React.useState(false);
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
        setEmployees(props.employees);
    }, [props.employees]);

    React.useEffect(() => {
        const result: JSX.Element[] = [];
        for (const employee of employees) {
            result.push(
                <tr key={employee.employee_id}>
                    <td>{employee.name}</td>
                    <td className="text-right">
                        {props.user.priv.editEmployee.base ?
                        <h5 className="fas fa-edit text-warning mr-2 mb-0 cursor-pointer" onClick={() => handleEditEmployee(employee)}></h5>
                        : ""}
                        {props.user.priv.deleteEmployee ?
                        <h5 className="fas fa-times-circle text-danger mb-0 cursor-pointer" onClick={() => handleDeleteEmployee(employee)}></h5>
                        : ""}
                    </td>
                </tr>
            );
        }
        setEmployeeRows(result);
    }, [employees]);

    const fetchPath = () => {
        fetch(path + "&page=" + page).then((response: Response) => {
			if (response.status !== 200) {
                return;
			}
			response.json().then((data) => {
				setEmployees(data);
			});
		});
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPath("/api/searchEmployees?search=" + search);
    }

    const handleCreateEmployee = () => {
        setCreateMode(true);
        setShowEditEmployeeModal(true);
    }

    const handleEditEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setCreateMode(false);
        setShowEditEmployeeModal(true);
    }

    const handleDeleteEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowDeleteEmployeeModal(true);
    }

    const handleDelete = () => {
        fetch("/api/action/deleteEmployee", { 
            method: "POST",
            body: JSON.stringify({
                employee_id: selectedEmployee
            })
        }).then(response => {
            if (response.status === 200) {
                toast.success("Employee was deleted");
            } else {
                toast.error("Something went wrong!");
            }
            fetchPath();
        });
        setShowDeleteEmployeeModal(false);
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
                        {props.user.priv.createEmployee ?
                        <Button variant="link" className="mr-2" onClick={handleCreateEmployee}><i className="fas fa-plus text-success"></i></Button>
                        : ""}
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
                        {employeeRows}
                    </tbody>
                </Table>
            </Container>
            <DeleteConfirmModal show={showDeleteEmployeeModal} onHide={() => setShowDeleteEmployeeModal(false)} handleDelete={handleDelete} />
            <EditEmployeeModal user={props.user} employee={selectedEmployee} ranks={props.ranks} qualifications={props.qualifications} medals={props.medals} show={showEditEmployeeModal} createMode={createMode} onHide={() => { 
                setShowEditEmployeeModal(false);
                fetchPath();
            }} />
        </div>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext & Horus.SessionContext): Promise<any> {
	const user = await getUser(context);
	return { props: { ...user, ...streamsToProps(await collectStreams(context, user?.user, ["employees", "ranks", "qualifications", "medals"])) }};
}

export default Employees;