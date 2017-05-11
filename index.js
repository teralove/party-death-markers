// vers 1.1.0

/*
Item IDs that have unique glows

91116	Amarun's Relic Piece
55658	Bahaar's Relic Piece
91166	Dagon's Relic Piece
91114	Elinu's Relic Piece
91118	Gidd's Relic Piece
91177	Ishara's Relic Piece
91113	Isren's Relic Piece
91119	Karas's Relic Piece
91188	Oriyn's Relic Piece
57000	Seren's Relic Piece
91115	Tithus's Relic Piece
91117	Zuras's Relic Piece
98260	Vergos's Head			// Vergo pieces all have the same effect
98263	Vergos's Horn
98262	Vergos's Scale
98264	Vergos's Bone
98261	Vergos's Fang
*/
const ItemToSpawn = 98260;

const format = require('./format.js');

module.exports = function PartyDeathMarkers(dispatch) {

	let enabled = true;
	let cid, userId;
	let deadPeople = [];	
	let partyMembers = [];
			
	dispatch.hook('S_LOGIN', 1, (event) => {	
		cid = event.cid;
		removeAll();
    })
	
	dispatch.hook('S_PARTY_MEMBER_LIST', 4, (event) => {
		if (!enabled) return;
		partyMembers = [];
		for(let i in event.members) {
			if (cid - event.members[i].cID === 0) {
				userId = event.members[i].playerId
			} else {
				partyMembers.push({
					cid: event.members[i].cID,
					playerId: event.members[i].playerId,
					x: 0,
					y: 0,
					z: 0
				});
			}
		}
    })
		
 	dispatch.hook('S_DEAD_LOCATION', 1, (event) => {
		 if (!enabled) return;
		 for(let i in partyMembers) {
			 if (partyMembers[i].cid - event.target == 0) {	
				 partyMembers[i].x = event.x;
				 partyMembers[i].y = event.y;
				 partyMembers[i].z = event.z;
				 spawnMarker(partyMembers[i].playerId);
			 }
		}
	})
	 		
	dispatch.hook('S_PARTY_MEMBER_STAT_UPDATE', 2, (event) => {
		if (!enabled || event.playerId == userId) return;
		if (event.curHp <= 0) {
			spawnMarker(event.playerId);
		} else {
			removeMarker(event.playerId);
		}
	})
		 
	function spawnMarker(playerId) {	
		if (deadPeople.includes(playerId)) {
			dispatch.toClient('S_DESPAWN_DROPITEM', 1, {
				id: playerId
			});	
		} else {
			deadPeople.push(playerId);	
		}
			
		let index = getIndexOfPlayerId(partyMembers, playerId);
		
		dispatch.toClient('S_SPAWN_DROPITEM', 1, {
			id: playerId,
			x: partyMembers[index].x,
			y: partyMembers[index].y,
			z: partyMembers[index].z,
			item: ItemToSpawn,
			amount: 1,
			expiry: 999999,
			owners: [{id: userId}]
		});	
	}
	
	function removeMarker(playerId) {
		if (deadPeople.includes(playerId)) {
			let index = deadPeople.indexOf(playerId);
			deadPeople.splice(index, 1);
			
			dispatch.toClient('S_DESPAWN_DROPITEM', 1, {
				id: playerId
			});	
		}
	}
	
	function removeAll() {
		for (let i in deadPeople) {
			removeMarker(deadPeople[i]);
		}
	}
	
	function getIndexOfPlayerId(arr, playerId) {
		for (var i=0; i<arr.length; i++) {
			if (arr[i].playerId-playerId==0) return i;
		}
		return -1;
	}
	
    dispatch.hook('S_LEAVE_PARTY_MEMBER', 2, (event) => {
		removeMarker(event.playerId);
    })	
	
    dispatch.hook('S_LEAVE_PARTY', 1, (event) => {
		removeAll();
    })	
	
    const chatHook = event => {		
		let command = format.stripTags(event.message).split(' ');
		
		if (['!cleardeathmarkers'].includes(command[0].toLowerCase())) {
			removeAll();
			return false;
		} else if (['!partydeathmarkers'].includes(command[0].toLowerCase())) {
			toggleModule();
			return false;
		}
    }
    dispatch.hook('C_CHAT', 1, chatHook)	
	dispatch.hook('C_WHISPER', 1, chatHook)
  
	function toggleModule() {
		enabled = !enabled;
		if (!enabled) removeAll();
		systemMsg( enabled ? 'enabled' : 'disabled' );
	}
	
	// slash support
	try {
		const Slash = require('slash')
		const slash = new Slash(dispatch)
		slash.on('cleardeathmarkers', args => removeAll())
		slash.on('partydeathmarkers', args => toggleModule())
	} catch (e) {
		// do nothing because slash is optional
	}
	
	function systemMsg(msg) {
        dispatch.toClient('S_CHAT', 1, {
            channel: 24,
            authorID: 0,
            unk1: 0,
            gm: 0,
            unk2: 0,
            authorName: '',
            message: ' (party-death-markers) ' + msg
        });
    }
			
}