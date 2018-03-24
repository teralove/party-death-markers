# party-death-markers
tera-proxy module that spawns large beacons on top of dead party members.

## Usage
### `PartyDeathMarkers`
- Toggle on/off
- Default is on

## Info
- Tanks = red. Healers = blue. DPS = tall beacon.
- The item cannot be picked up. It's fake. Spawned client-side for your eyes only. No body else can see them.

## Changelog
<details>

    1.30
    - Updated code aesthetics
    - Fixed bug with beacons spawning on players no longer in party.
    - Added S_SPAWN_USER hook. Fixes issues with beacons not spawning.
    - Removed ClearDeathMarkers command
    - Added Command dependency
    - Removed slash support
    1.20
    - Added class specific markers
    1.11
    - Optimized a couple functions
    1.10
    - Fixed bug with markers spawning on wrong positions

</details>

---

![Screenshot](http://i.imgur.com/bOSA6Lx.jpg)
