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
    let myGameId = 0;
    const deadPeople = new Map(); // playerId -> {loc}
    let partyMembers = [];

    dispatch.hook('S_LOGIN', '10', ({gameId}) => {
        myGameId = gameId;
        deadPeople.clear();
    });

    dispatch.hook('S_PARTY_MEMBER_LIST', 7, ({members}) => {
        partyMembers = members.filter((mem) => !mem.gameId.equals(myGameId));
    });

    dispatch.hook('S_DEAD_LOCATION', 2, ({gameId, loc}) => {
        const member = partyMembers.find((mem) => mem.gameId.equals(gameId));
        if (member)
            updateMarker(member, loc);
    });

    dispatch.hook('S_SPAWN_USER', 13, ({alive, gameId, loc}) => {
        if (!alive) {
            const member = partyMembers.find((mem) => mem.gameId.equals(gameId));
            if (member)
                updateMarker(member, loc);
        }
    });

    dispatch.hook('S_PARTY_MEMBER_STAT_UPDATE', 3, ({playerId, curHp}) => {
        if (deadPeople.has(playerId) && curHp > 0) {
            removeMarker(playerId);
            deadPeople.delete(playerId);
        }
    });

    dispatch.hook('S_LEAVE_PARTY_MEMBER', 2, ({playerId}) => {
        removeMarker(playerId);
        deadPeople.delete(playerId);
        partyMembers = partyMembers.filter((mem) => mem.playerId === playerId);
    });

    dispatch.hook('S_LEAVE_PARTY', 'raw', () => {
        partyMembers = [];
        deadPeople.forEach((k) => removeMarker(k));
        deadPeople.clear();
    });

    function spawnMarker(member, loc) {
        dispatch.toClient('S_SPAWN_DROPITEM', 6, {
            // just use playerId as item's gameId; unlikely to have conflicts and easy to track
            gameId: member.playerId,
            loc: loc,
            item: getSpawnItem(member.class),
            amount: 1,
            explode: 1, // TOTEST
            source: myGameId, // TOTEST
            expiry: 999999,
            owners: [{playerId: playerId}],
        });
    }

    function updateMarker(member, loc) {
        if (deadPeople.has(member.playerId))
            removeMarker(member.playerId);
        if (enabled)
            spawnMarker(member, loc);
        deadPeople.set(member.playerId, loc);
    }

    function removeMarker(playerId) {
        if (deadPeople.has(playerId)) {
            dispatch.toClient('S_DESPAWN_DROPITEM', 4, {
                gameId: playerId,
            });
        }
    }

    function getSpawnItem(jobId) {
        if (UseJobSpecificMarkers) {
            for (const markers of JobSpecificMarkers) {
                if (markers.jobs.includes(jobId)) {
                    return markers.marker;
                }
            }
        }

        return DefaultItemSpawn;
    }

    command.add(['partydeathmarkers', 'pdm'], {
        clear () {
            deadPeople.forEach((k, v) => removeMarker(k));
            deadPeople.clear();
            command.message('Death markers cleared');
        },
        toggle () {
            enabled = !enabled;
            if (enabled) {
                deadPeople.forEach((playerId, loc) => {
                    const member = partyMembers.find((mem) => mem.playerId === playerId);
                    if (member)
                        spawnMarker(member, loc);
                });
            } else {
                deadPeople.forEach((k, v) => removeMarker(k));
            }

            command.message("Death markers " + (enabled ? 'enabled' : 'disabled'));
        },
    });
}
