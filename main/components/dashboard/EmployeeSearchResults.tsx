import Link from 'next/link';
import React from 'react';
import { Button, Col, ListGroup, Row } from 'react-bootstrap';
import { Employee } from '../../pages/admin/employees';

interface Props {
	loaded: boolean;
	employees: Employee[];
	page: number;
	setPage: (page: number) => void
}

function EmployeeSearchResults(props: Props): JSX.Element {

	const [ employeeItems, setEmployeeItems ] = React.useState<JSX.Element[]>([]);

	React.useEffect(() => {
		const result: JSX.Element[] = [];
		for (const employee of props.employees) {
			result.push(
				<Link key={employee.employee_id} href={"/employee/" + employee.employee_id}>
					<ListGroup.Item action>
						<div className="d-flex">
							<h4 className="mb-0">{employee.name}</h4>
						</div>
					</ListGroup.Item>
				</Link>
			);
		}
		setEmployeeItems(result);
	}, [props.employees]);

	if (props.loaded && props.employees.length === 0) {
		return (
			<>
				<Row className="mt-5 mb-2">
					<Col>
						<h3 className="mb-0">Results</h3>
					</Col>
					<Col className="d-flex align-items-center justify-content-end">
						<Button variant="link" className="no-style-button mr-2" onClick={() => props.setPage(Math.max(1, props.page - 1))}><i className="fas fa-chevron-left"></i></Button>
                        <p className="mb-0">Page {props.page}</p>
                        <Button variant="link" className="no-style-button ml-2" onClick={() => props.setPage(props.page + 1)}><i className="fas fa-chevron-right"></i></Button>
					</Col>
				</Row>
				<h5>No Results Found</h5>
			</>
		)
	}

	return (
		<div className={(props.employees.length === 0 ? "d-none" : "") + " mt-5"}>
			<Row className="mt-5 mb-2">
				<Col>
					<h3 className="mb-0">Results</h3>
				</Col>
				<Col className="d-flex align-items-center justify-content-end">
					<Button variant="link" className="no-style-button mr-2" onClick={() => props.setPage(Math.max(1, props.page - 1))}><i className="fas fa-chevron-left"></i></Button>
					<p className="mb-0">Page {props.page}</p>
					<Button variant="link" className="no-style-button ml-2" onClick={() => props.setPage(props.page + 1)}><i className="fas fa-chevron-right"></i></Button>
				</Col>
			</Row>
			<ListGroup>
				{employeeItems}
			</ListGroup>
		</div>
	)
}

export default EmployeeSearchResults;