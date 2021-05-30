import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React from 'react'
import { Card, Col, Container, Image, Row, Table } from 'react-bootstrap';
import Header from '../../components/Header';
import { getUser } from '../../lib/func';
import { collectStreams, streamsToProps } from '../../src/streams';
import { DetailedEmployee } from '../admin/employees';

interface Props {
    user: Horus.User;
    employeeDetails: DetailedEmployee;
}

interface Medals {
	row1: JSX.Element[],
	row2: JSX.Element[],
	row3: JSX.Element[],
}

const defaultMedals = {row1: [], row2: [], row3: []}

function EmployeePage(props: Props): JSX.Element {

	const [ qualificationRows, setQualificationRows ] = React.useState<JSX.Element[]>([]);
	const [ medalImages, setMedalImages ] = React.useState<Medals>(defaultMedals);

	React.useEffect(() => {
		const qualRows = [];
		for (const qual of props.employeeDetails.qualifications) {
			qualRows.push(
				<tr key={qual.id}>
					<td>{qual.name}</td>
					<td>
						<Link href={`/employee/${qual.trainer_id}`}>{qual.trainer_name}</Link>
					</td>
					<td>{new Date(qual.entry_date * 1000).toLocaleDateString()}</td>
				</tr>
			);
		}
		setQualificationRows(qualRows);

		const medalRows = defaultMedals;
		let col = 1;
		for (const medal of props.employeeDetails.medals) {
			const element = (
				<Image className="d-block" width={120} height={35} src={medal.image_url} />
			);
			switch (col) {
				case 1:
					medalRows.row1.push(element);
					break;
				case 2:
					medalRows.row2.push(element);
					break;
				case 3:
					medalRows.row3.push(element);
			}
			col += 1;
			if (col > 3) {
				col = 1;
			}
		}
		setMedalImages(medalRows);

	}, [props.employeeDetails]);

    return (
        <>
            <Image className="mb-2" src="https://via.placeholder.com/1920x300?text=Placeholder" fluid />
            <Container>
				<Header title="Profile" user={props.user} />
				<Row className="mb-3">
					<Col sm="auto" >
						<Image width={150} height={200} src={props.employeeDetails.basic.profile_url} />
					</Col>
					<Col>
						<h2 style={{color: props.employeeDetails.basic.color}} >{props.employeeDetails.basic.name}</h2>
						<h5>{props.employeeDetails.basic.rank_name}</h5>
						<hr />
						<p>{`Joined ${new Date(props.employeeDetails.basic.start_date).toLocaleDateString()} (${Math.floor((new Date().getTime() - new Date(props.employeeDetails.basic.start_date).getTime()) / 86400000)} Days)`}</p>
					</Col>
				</Row>
				<Row>
					<Col>
						<Card>
							<Card.Header>
								<h6 className="m-0 font-weight-bold text-primary">Qualifications</h6>
							</Card.Header>
							<Card.Body>
								<Table bordered>
									<thead>
										<tr>
											<th>Name</th>
											<th>Instructor</th>
											<th className="shrink-column" >Date Completed</th>
										</tr>
									</thead>
									<tbody>
										{qualificationRows}
									</tbody>
								</Table>
							</Card.Body>
						</Card>
					</Col>
					<Col sm="auto">
						<Card>
							<Card.Header>
								<h6 className="m-0 font-weight-bold text-primary">Medals</h6>
							</Card.Header>
							<Card.Body style={{minWidth: 360}}>
								<Row>
									<Col className="pr-0">{medalImages.row1}</Col>
									<Col className="p-0">{medalImages.row2}</Col>
									<Col className="pl-0">{medalImages.row3}</Col>
								</Row>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
        </>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext & Horus.SessionContext): Promise<any> {
    const mockContext: any = context;
    mockContext.req.query = {};
    mockContext.req.query.id = context.query.employee_id;
    const user = await getUser(context);
    const streams = streamsToProps(await collectStreams(mockContext, user?.user, ["employeeDetails"]))
    return { props: {...user, ...streams} }
}

export default EmployeePage;
