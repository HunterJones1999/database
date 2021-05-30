import React, { useState, useEffect } from 'react';
import { Button, Nav, Navbar } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Link from 'next/link';

function Sidebar(): JSX.Element {

	const router = useRouter();
	const [ sidebarCollapsed, setSidebarCollapsed ] = useState(false);

	useEffect(() => {
		if (localStorage.getItem('collapsedSidebar') === 'true') {
			setSidebarCollapsed(true);
		}
	}, []);

	return (
		<Navbar 
			className={"navbar-dark sidebar sidebar-dark position-relative " + 
				(sidebarCollapsed ? "collapsed" : "")}>
			<Nav className="sidebar-nav w-inherit">
				<Navbar.Brand href="/" className="align-items-center justify-items-center d-flex">
					<div className="sidebar-brand-icon">
						<i className="fas fa-eye" />
					</div>
					<div className="sidebar-brand-text">
						Horus
					</div>
				</Navbar.Brand>
				<hr className="sidebar-divider my-0" />
				<Nav.Item className={(router.pathname.match(/^\/admin\/employees\/?$/) ? "active" : "")}>
					<Link href="/admin/employees/" passHref>
						<Nav.Link>
							<i className="fas fa-fw fa-user" />
							<span>Employees</span>
						</Nav.Link>
					</Link>
				</Nav.Item>
				<Nav.Item className={(router.pathname.match(/^\/admin\/ranks\/?$/) ? "active" : "")}>
					<Link href="/admin/ranks/" passHref>
						<Nav.Link>
							<i className="fas fa-fw fa-users" />
							<span>Ranks</span>
						</Nav.Link>
					</Link>
				</Nav.Item>
				<Nav.Item className={(router.pathname.match(/^\/admin\/qualifications\/?$/) ? "active" : "")}>
					<Link href="/admin/qualifications" passHref>
						<Nav.Link>
							<i className="fas fa-fw fa-certificate" />
							<span>Qualifications</span>
						</Nav.Link>
					</Link>
				</Nav.Item>
				<Nav.Item className={(router.pathname.match(/^\/admin\/medals\/?$/) ? "active" : "")}>
					<Link href="/admin/medals" passHref>
						<Nav.Link>
							<i className="fas fa-fw fa-medal" />
							<span>Medals</span>
						</Nav.Link>
					</Link>
				</Nav.Item>
				<div className="text-center d-none d-md-inline position-fixed w-inherit sidebar-toggle-wrapper">
					<Button className="rounded-circle border-0" id="sidebarToggle" onClick={() => {
						if (localStorage.getItem('collapsedSidebar') === null || localStorage.getItem('collapsedSidebar') === 'false') {
							localStorage.setItem('collapsedSidebar', 'true');
							setSidebarCollapsed(true);
						} else {
							localStorage.setItem('collapsedSidebar', 'false');
							setSidebarCollapsed(false);
						}
					}}/>
				</div>
			</Nav>
		</Navbar>
	)
}

export default Sidebar;
