import React, { useEffect } from 'react';
import { useRouter } from "next/router";

function Logout(): JSX.Element {

	const router = useRouter();

	useEffect(() => {
		router.push('/api/logout');
	}, [router]);

	return <p>Redirecting...</p>
}

export default Logout;