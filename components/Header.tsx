import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import Link from 'next/link';
import styles from './Header.module.scss';
import { defaultPermissions } from './admin/employees/EditEmployeeModal';

interface Props {
	user: Horus.User;
	title: string;
}

function Header(props: Props): JSX.Element {

	return (
		<div className="d-sm-flex align-items-center justify-content-between mb-4">
			<h1 className="h3 mb-0 text-gray-300 d-inline">{props.title}</h1>
			{props.user ? 
				<Dropdown className={styles.userDropdown}>
					<Dropdown.Toggle variant="link" className="no-style-button d-flex align-items-center">
						<span className="mr-2 d-none d-lg-inline text-gray-600 medium">{props.user.personaname}</span>
						<img className="img-profile rounded-circle"
							src={props.user.avatarfull} alt="Profile" />
					</Dropdown.Toggle>
					<Dropdown.Menu renderOnMount={false} align="right" className="shadow">
						<Link href={"/employee/" + props.user.employee_id} passHref>
							<Dropdown.Item>
								<i className="fa fa-sm fa-fw mr-2 text-gray-400 fa-user" />
								Profile
							</Dropdown.Item>
						</Link>
						{ props.user.priv !== defaultPermissions ?
						<Link href={"/admin/employees"} passHref>
							<Dropdown.Item>
								<i className="fa fa-sm fa-fw mr-2 text-gray-400 fa-tools" />
								Admin Panel
							</Dropdown.Item>
						</Link>
						: ""}
						<Dropdown.Divider />
						<Link href="/api/logout" passHref>
							<Dropdown.Item >
								<i className="fa fa-sm fa-fw mr-2 text-gray-400 fa-sign-out-alt" />
								Log Out
							</Dropdown.Item>
						</Link>
					</Dropdown.Menu>
				</Dropdown>
			:
				<Link href="/api/login" passHref>
					<Button>Log In</Button>
				</Link>
			}
		</div>
		
	)
}

export default Header;
