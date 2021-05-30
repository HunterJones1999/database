import React from 'react';
import { Button, Col, Container, Form, Image, Row } from 'react-bootstrap';
import Header from '../components/Header';
import { getUser } from '../lib/func';
import { GetServerSidePropsContext } from 'next';
import { collectStreams, streamsToProps } from '../src/streams';
import ProfileSearchResultsCard from '../components/dashboard/EmployeeSearchResults';
import { Employee } from './admin/employees';

interface Props {
	user: Horus.User;
	qualifications: any[];
}

function Dashboard(props: Props): JSX.Element {

	const [ qualificationOptions, setQualificationOptions ] = React.useState<JSX.Element[]>([]);
	const [ nameSearch, setNameSearch ] = React.useState("");
	const [ qualificationSearch, setQualificationSearch ] = React.useState(1);
	const [ page, setPage ] = React.useState(1);
    const [ path, setPath ] = React.useState("/api/searchEmployees?");
	const [ employees, setEmployees ] = React.useState<Employee[]>([]);
	const [ searched, setSearched ] = React.useState(false);

    React.useEffect(() => {
        const result = [];
        for (const qual of props.qualifications) {
            result.push(
                <option key={qual.qualification_id} value={qual.qualification_id} >{qual.name}</option>
            );
        }
        setQualificationOptions(result);
    }, [props.qualifications]);

	const loaded = React.useRef(false);
    React.useEffect(() => {
        if (!loaded.current) {
			loaded.current = true;
		} else {
			fetchPath();
		}
    }, [page, path]);

	const handleNameSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPath("/api/searchEmployees?search=" + nameSearch);
	}

	const handleQualificationSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPath("/api/searchEmployees?qualification=" + qualificationSearch);
	}

	const fetchPath = () => {
		fetch(path + "&page=" + page).then((response: Response) => {
			if (response.status !== 200) {
                return;
			}
			response.json().then((data) => {
				setEmployees(data);
				setSearched(true);
			});
		});
	}

	return (
		<>
			<Image src="/header.png" fluid />
			<Container fluid className="d-flex flex-column">
				<Header user={props.user} title="" />
				<Container>
					<Form onSubmit={handleNameSearch}>
						<Form.Group as={Row}>
							<Form.Label column sm={2}>
								Search By Name
							</Form.Label>
							<Col>
								<Form.Control minLength={3} onChange={event => setNameSearch(event.target.value)} value={nameSearch} />
							</Col>
							<Col sm={"auto"}>
								<Button type="submit">Submit</Button>
							</Col>
						</Form.Group>
					</Form>
					<Form onSubmit={handleQualificationSearch}>
						<Form.Group as={Row}>
							<Form.Label column sm={2}>
								Search By Qualification
							</Form.Label>
							<Col>
								<Form.Control as="select" onChange={event => setQualificationSearch(parseInt(event.target.value))} value={qualificationSearch} >
									{qualificationOptions}
								</Form.Control>
							</Col>
							<Col sm={"auto"}>
								<Button type="submit">Submit</Button>
							</Col>
						</Form.Group>
					</Form>
					<ProfileSearchResultsCard page={page} setPage={setPage} loaded={searched} employees={employees} />
				</Container>
			</Container>
		</>
	);

}

export async function getServerSideProps(context: GetServerSidePropsContext & Horus.SessionContext): Promise<any> {
	const user = await getUser(context);
	return { props: { ...user, ...streamsToProps(await collectStreams(context, user?.user, ["qualifications"])) }};
}

export default Dashboard;