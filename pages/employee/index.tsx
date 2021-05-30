import { useRouter } from 'next/router';
import React from 'react';

function EmployeeIndex(): JSX.Element {

	const router = useRouter();

	React.useEffect(() => {
		router.replace("/");
	});

	return (
		<>
		</>
	);
}

export default EmployeeIndex;