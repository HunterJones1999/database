import React, { useEffect } from 'react';
import { useRouter } from "next/router";

function Login(): JSX.Element {

	const router = useRouter();

	useEffect(() => {
		router.push('/api/login');
	}, [router]);

	return <p>Redirecting...</p>
}

export default Login;