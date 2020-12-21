/* eslint-disable no-undef */
import React, { useEffect, useRef } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import { useReplicant } from 'use-nodecg';

import { StyledToggleButton } from '../../atoms/toggle-button';
// React imports
import { theme } from '../../theme';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider } from '@material-ui/styles';
// Import { Tooltip, YAxis, AreaChart, Area } from 'recharts';

// Interfaces
import { bundleStatus as DummyBundle } from '../../../extension/dummyData';
import { BundleStatus } from '../../../types/bundle-status';
import { Button } from '@material-ui/core';

const HlaeActive = styled.div`
	width: 100%;
	padding: 16px 0;
	text-align: center;
	text-transform: uppercase;
	color: ${(props: ActiveProps) => props.active ? '#44a047' : '#e53835'};
`;

interface ActiveProps {
	active?: boolean;
}

// Const beginningData = [
// 	{ rate: 0 },
// 	{ rate: 0 },
// 	{ rate: 0 },
// 	{ rate: 0 },
// 	{ rate: 0 },
// 	{ rate: 0 },
// 	{ rate: 0 },
// 	{ rate: 0 },
// 	{ rate: 0 },
// 	{ rate: 0 },
// 	{ rate: 0 }
// ];

export const Server: React.FunctionComponent = () => {
	const [bundleStatus] = useReplicant<BundleStatus>('bundleStatus', DummyBundle);
	const [serverRateRep] = useReplicant<number>('serverRate', 0);
	const [hlaeActiveRep] = useReplicant<boolean>('hlaeActive', false);
	const serverBtn = useRef<StyledToggleButton>(null);
	// Const [serverData, setServerData] = useState(beginningData);
	// const [serverIter, setServerIter] = useState(0);

	function toggleServer(): void {
		if (bundleStatus.isServerOn) {
			// Turning off
			nodecg.sendMessage('closeServer');
			console.log('Closing server');
		} else {
			// Turning on
			nodecg.sendMessage('listenServer');
			console.log('Starting server');
		}
	}

	useEffect(() => {
		if (!bundleStatus) {
			return;
		}

		if (serverBtn && serverBtn.current) {
			serverBtn.current.toggleButton(bundleStatus.isServerOn);
		}
	}, [bundleStatus]);

	// UseEffect(() => {
	// 	const interval = setInterval(() => {
	// 		const oldServerData = serverData;
	// 		oldServerData.shift();
	// 		oldServerData.push({ rate: serverRateRep });
	// 		setServerData(oldServerData);
	// 		setServerIter(serverIter + 1);
	// 	}, 1000);

	// 	return (): void => {
	// 		clearInterval(interval);
	// 	};
	// }, [serverData, serverIter, serverRateRep]);

	/* 
		This button should only be used for dev
		Match kills should be cleared at the end of a match or when a new one is started
	*/
	function resetMatchKills() {
		nodecg.sendMessage('resetMatchKills');
	}

	return (
		<ThemeProvider theme={theme}>
			<StyledToggleButton
				ref={serverBtn}
				value="serverBtn"
				style={{ width: '100%' }}
				initialText="Start"
				toggleText="Stop"
				onClick={toggleServer}
			/>
			<Grid container spacing={1}>
				<Grid item xs>
					<Typography color="textSecondary" display="inline">
						Host
					</Typography>
					<Typography display="inline"> {nodecg.config.host}</Typography>
				</Grid>
				<Grid item xs>
					<Typography color="textSecondary" display="inline">
						Port
					</Typography>
					<Typography display="inline"> {nodecg.bundleConfig.port}</Typography>
				</Grid>
			</Grid>
			<Typography>Msg/s {~~serverRateRep}</Typography>
			{/* <AreaChart width={242} height={100} data={serverData} margin={{ left: -40 }} key={serverIter}>
				<Area
					type="monotone"
					dataKey="rate"
					stroke="#8884d8"
					fill="#8884d8"
					animationDuration={0}
				/>
				<Tooltip />
				<YAxis domain={[0, 60]} />
			</AreaChart> */}
			<HlaeActive active={hlaeActiveRep}>
				HLAE is currently {hlaeActiveRep ? 'active': 'inactive'}
			</HlaeActive>
			<Button onClick={resetMatchKills} variant="contained">Reset Match Kills (Dev)</Button>
		</ThemeProvider>
	);
};

render(<Server />, document.getElementById('server'));
