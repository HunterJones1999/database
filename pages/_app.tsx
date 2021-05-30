import '../style/sb-admin-2.css';
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
import '../style/horus.scss';
import React from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';

function HorusApp({ Component, pageProps }: AppProps): JSX.Element {
	return (
		<div>
			<Head>
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css" 
				integrity="sha512-HK5fgLBL+xu6dm/Ii3z4xhlSUyZgTT9tuc/hSrtw6uzJOvgRr2a9jyxxT1ely+B+xFAmJKVSTbpM/CuL7qxO8w==" 
				crossOrigin="anonymous" />
				<meta
					name="description"
					content="View this server's current status"
				/>
			</Head>
			<Component {...pageProps} />
			<ToastContainer
				pauseOnHover={false}
			/>
		</div>
	);
}

export default HorusApp;