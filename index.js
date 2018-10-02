const Command = require('command');

module.exports = function PartyDeathMarkers(dispatch) {
    const command = Command(dispatch);
    
    const DefaultItemSpawn = 98260;
    const UseJobSpecificMarkers = true;
    /*
    warrior = 0, lancer = 1, slayer = 2, berserker = 3,
    sorcerer = 4, archer = 5, priest = 6, mystic = 7,
    reaper = 8, gunner = 9, brawler = 10, ninja = 11, valkyrie = 12
    */
    const JobSpecificMarkers = [
        {
            // tanks
            jobs: [1, 10], 
            marker: 91177
        },
        {
            // healers
            jobs: [6, 7], 
            marker: 91113
        }
    ];
    
    let enabled = true;
    let playerId = 0;
    let partyMembers = [];
    let spawnedBeacons = [];
    
    dispatch.hook('S_LOGIN', 10, (event) => {
        playerId = event.playerId;
        removeAllMarkers();
    })
        
    dispatch.hook('S_PARTY_MEMBER_LIST', 7, (event) => {
        partyMembers = event.members;
    })
    
    dispatch.hook('S_DEAD_LOCATION', 2, (event) => {
        for (let i = 0; i < partyMembers.length; i++) { 
            if (partyMembers[i].gameId.equals(event.gameId)) {
                spawnMarker(partyMembers[i].playerId, event.loc);
                return;
            }
        }
    })
    
    dispatch.hook('S_SPAWN_USER', 13, (event) => {
        if (!event.alive) {
            for (let i = 0; i < partyMembers.length; i++) { 
                if (partyMembers[i].gameId.equals(event.gameId)) {
                    spawnMarker(partyMembers[i].playerId, event.loc);
                    return;
                }
            }
        }
    })
    
    dispatch.hook('S_PARTY_MEMBER_STAT_UPDATE', 3, (event) => {
        if (playerId == event.playerId) return;
        
        if (event.curHp > 0) {
            for (let i = 0; i < partyMembers.length; i++) { 
                if (partyMembers[i].playerId == event.playerId) {
                    removeMarker(event.playerId);
                    return;
                }
            }
        }
    })
    
    dispatch.hook('S_LEAVE_PARTY_MEMBER', 2, (event) => {
        for (let i = 0; i < partyMembers.length; i++) {
            if (partyMembers[i].playerId == event.playerId) {
                removeMarker(partyMembers[i].gameId);
            }
        }
    })
    
    dispatch.hook('S_LEAVE_PARTY', 1, (event) => {
        removeAllMarkers();
        partyMembers = [];
    })
    
    function spawnMarker(id, loc) {
        if (!enabled) return;
        if (playerId == id) return;
        
        removeMarker(id); //refresh
        spawnedBeacons.push(id);
        
        dispatch.toClient('S_SPAWN_DROPITEM', 6, {
            gameId: id,
            loc: loc,
            item: getSpawnItem(id),
            amount: 1,
            expiry: 999999,
            owners: [{playerId: playerId}]
        });
    }
    
    function removeMarker(id) {
        if (spawnedBeacons.includes(id)) {
            let index = spawnedBeacons.indexOf(id);
            spawnedBeacons.splice(index, 1);
            
            dispatch.toClient('S_DESPAWN_DROPITEM', 4, {
                gameId: id
            });
        }
    }
    
    function removeAllMarkers() {
        for (let i = 0; i < spawnedBeacons.length; i++) { 
            removeMarker(spawnedBeacons[i]);
        }
        spawnedBeacons = [];
    }
    
    function getSpawnItem(id) {
        if (UseJobSpecificMarkers) {
            let jobId;
            for (let i = 0; i < partyMembers.length; i++) { 
                if (partyMembers[i].playerId == id) {
                    jobId = partyMembers[i].class;
                }
            }
            
            for (let i = 0; i < JobSpecificMarkers.length; i++) { 
                if (JobSpecificMarkers[i].jobs.includes(jobId)) {
                    return JobSpecificMarkers[i].marker;
                }
            }
        }
        
        return DefaultItemSpawn;
    }
    
    command.add('partydeathmarkers', () => {
        enabled = !enabled;
        if (!enabled) removeAllMarkers();
        command.message('(party-death-markers) ' + (enabled ? 'enabled' : 'disabled'));
    });
    
}