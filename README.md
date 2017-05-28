**New version 1.2 - Specific markers/beacons can be spawned for each class. This helps to identify and prioritize ressing piles of dead bodies. Tanks will spawn a Red relic piece, Healers will spawn a Blue relic piece, DPS will spawn the large rare item beacon. If you wish for all classes to be the large rare beacon like how this mod originally was, then open the index.js and change to variable "useJobSpecificMarkers" to false (const useJobSpecificMarkers = false;)**


# Party Death Markers
Spawns large visible markers on top of dead party members.

## Chat commands:
* **!PartyDeathMarkers**    - Toggles the module off/on
* **!ClearDeathMarkers**    - Removes all present markers

Commands are not case-sensitive. [slash](https://github.com/baldera-mods/slash) is supported but not required

## Known issues:
* If you logout, any present markers will be removed.
* When someone dies, you have to be present for the markers to spawn.

## Info:
* No you cannot pickup the item, it's fake. Spawned client-side just for the visual effect and only you can see them.
* Any item can be spawned, such as relic pieces which have different visual effects. See index.js for list.

## Changelog 
### 1.2.0
* [+] Added class specific markers
### 1.1.1
* [+] Optimized a couple functions
### 1.1.0
* [+] Fixed bug with markers spawning on wrong positions


![Screenshot](http://i.imgur.com/bOSA6Lx.jpg)