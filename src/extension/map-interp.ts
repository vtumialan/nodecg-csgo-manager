import * as nodecgApiContext from './util/nodecg-api-context';
import _ from 'lodash';
const nodecg = nodecgApiContext.get();

import { MapPlayerData } from '../types/map-data';
import { CSGOOutputPhaseCountdowns } from '../types/csgo-gsi';

const interpMapPlayersRep = nodecg.Replicant<{ [key: string]: MapPlayerData }>('interpMapPlayers', {
	defaultValue: {},
	persistent: false
});

const mapPlayersRep = nodecg.Replicant<MapPlayerData[]>('mapPlayers', {
	defaultValue: [],
	persistent: false
});

const phaseRep = nodecg.Replicant<CSGOOutputPhaseCountdowns>('phase');

// 10 array's for 10 players, in future maybe have this be dynamic
const playerBuffer: MapPlayerData[][] = [[], [], [], [], [], [], [], [], [], []];

const INTERPOLATION_STEPS = 10;

let haveReset = false;

setInterval(() => {
	const clonedMapPlayers = [...mapPlayersRep.value];

	const newInterp: { [key: string]: MapPlayerData } = {};
	playerBuffer.forEach((playersSet, i) => {
		if (clonedMapPlayers.length === 0) return;

		playersSet.unshift(clonedMapPlayers[i]);

		if (phaseRep.value.phase === 'freezetime' && !haveReset) {
			haveReset = true;
			playersSet = playersSet.slice(0, 1);
		} else {
			playersSet = playersSet.slice(0, INTERPOLATION_STEPS);
		}

		// This is way less code than averaging multiple arrays
		const avgX = playersSet.reduce((a, b) => a + b.position[0], 0) / playersSet.length;
		const avgY = playersSet.reduce((a, b) => a + b.position[1], 0) / playersSet.length;
		const avgZ = playersSet.reduce((a, b) => a + b.position[2], 0) / playersSet.length;
		const avgAngleX = playersSet.reduce((a, b) => a + b.rotation[0], 0) / playersSet.length;
		const avgAngleY = playersSet.reduce((a, b) => a + b.rotation[1], 0) / playersSet.length;

		newInterp[clonedMapPlayers[i].steamId] = {
			...clonedMapPlayers[i],
			position: [avgX, avgY, avgZ],
			rotation: [avgAngleX, avgAngleY, clonedMapPlayers[i].rotation[2]],
		}
	});

	interpMapPlayersRep.value = newInterp;

	if (phaseRep.value.phase === 'live' && haveReset) {
		haveReset = false;
	}
}, 20);