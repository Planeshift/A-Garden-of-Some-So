/* Constants */

const floodTilesLevelLimit = 100;
const minTileSize = 16;
const maxTileSize = 256;

// AUDIO STUFF

// Initialize volume types

let volumeMaster = new VolumeType("master", document.getElementById("volume-master"));
volumeMaster.init();

let volumeMusic = new VolumeType("music", document.getElementById("volume-music"));
volumeMusic.init();

let volumeSounds = new VolumeType("sounds", document.getElementById("volume-sounds"));
volumeSounds.init();

// Audio files

const audioBoings = [
    new Audio("/Source/Areas/Flooding Tiles/audio/boing1.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/boing2.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/boing3.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/boing4.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/boing5.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/boing6.mp3")
]

const audioRemoves = [
    new Audio("/Source/Areas/Flooding Tiles/audio/plop1.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/plop2.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/plop3.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/plop4.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/plop5.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/plop6.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/plop7.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/plop8.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/plop9.mp3"),
    new Audio("/Source/Areas/Flooding Tiles/audio/plop10.mp3"),
]

// Pre-loading

let audiosToLoad = audioBoings.length + audioRemoves.length;
let audioLoaded = 0;

for(let i = 0; i < audioBoings.length; i++){
    audioBoings[i].addEventListener("canplaythrough", loadingAudio, {once: true});
}

for(let i = 0; i < audioRemoves.length; i++){
    audioRemoves[i].addEventListener("canplaythrough", loadingAudio, {once: true});
}

/**
 * This function is fired whenever an audio is completely loaded. When all are loaded, this fires floodTilesInit, initializing the app and the flooding tiles, allowing the user to interact with the board.
 */
function loadingAudio(){
    audioLoaded++;
    if(audioLoaded >= audiosToLoad){
        // Remove cursor-wait
        document.getElementById("app-content").classList.remove("cursor-wait");

        // Init the app
        floodTilesInit();

    }
}

/**
 * Initialize the app by showing a pointer cursor (instead of the previous cursor-wait while loading) and adding event listeners for the reset button and the board, allowing to spawn the central Flood Tile.
 */

function floodTilesInit(){

    // Add the cursor pointer
    document.getElementById("app-content").classList.add("cursor-pointer");

    // Add the first tile spawning event
    document.getElementById("app-content").addEventListener("click", spawnBaseFloodTile, {
        once: true,
    });

    // Add the reset functionnality
    document.getElementById("reset-button").addEventListener("click", resetButtonAction, { once: true });
}

// Stores the current flood tiles
let floodTiles = [];

/**
 * A class to represent Flood Tiles.
 * 
 * @param {HTMLElement} tile The tile, as in the HTML Element itself.
 * @param {Number} level The level for this flood tile. Flood tiles go lower and lower. This is automatically adjusted at creation based on the level of the creating tile (or set to the max value if it's the base tile).
 * @param {Number} X The X offset for this tile.
 * @param {Number} Y The Y offset for this tile.
 */

class FloodTile {
    constructor(
        tile,
        level,
        X,
        Y,
    ) {
        this.tile = tile;
        this.level = level;
        this.X = X;
        this.Y = Y;
        this.audioRemove;
    }

    /**
     * Initialize the tile by adding the spawnFloodTile event. Also store the AudioRemove sound.
     */

    init() {
        this.tile.addEventListener("click", e => this.spawnFloodTile(e));
        this.audioRemove = new CustomAudio(audioRemoves[Math.floor(Math.random() * audioRemoves.length)], "sounds");
        this.audioRemove.init();
    }

    /**
     * Remove this tile and play the audio
     */
    remove() {
        this.tile.remove();
        this.audioRemove.updateVolume();
        this.audioRemove.play();
    }
    /**
     * Create another flood tile from a click event, using its coordinates as the center of our new tile.
     * 
     * @param {MouseEvent} e The click event.
     */
    spawnFloodTile(e) {
        let offsetX = e.offsetX;
        let offsetY = e.offsetY;

        let spawningTileSize = this.tile.offsetWidth;

        // Get the lowest orthogonal distance between the point clicked and any side of the tile, then multiply by 3 to set our minimal size for the new tile
        let minSize = 3 * Math.min(offsetX, offsetY, spawningTileSize - offsetX, spawningTileSize - offsetY);

        // Slightly bigger, in order to prevent tiles from overlapping too much at min size
        minSize += 20;

        // Set minSize to minTileSize if it’s still lower than it
        minSize = Math.max(minSize, minTileSize);

        // Same as earlier, but for the maximal size
        let maxSize = 1.5 * Math.max(offsetX, offsetY, spawningTileSize - offsetX, spawningTileSize - offsetY);

        // Same logic
        maxSize -= 20;

        // Again, compare this maxSize and maxTileSize
        maxSize = Math.min(maxSize, maxTileSize);

        // Get a random tileSize between our two border values
        let newTileSize = Math.random() * (maxSize - minSize) + minSize;

        // Create a new tile
        let newTile = document.createElement("div");
        newTile.classList.add("flood-tile");
        newTile.style.width = `${newTileSize}px`;
        newTile.style.height = `${newTileSize}px`;
        newTile.style.zIndex = parseInt(window.getComputedStyle(this.tile).getPropertyValue("z-index"), 10) - 1;
        newTile.style.position = "absolute";
        let newOffsetX = this.X - (spawningTileSize / 2 - offsetX);
        let newOffsetY = this.Y - (spawningTileSize / 2 - offsetY);
        newTile.style.top = `calc(50% + ${newOffsetY}px)`;
        newTile.style.left = `calc(50% + ${newOffsetX}px)`;

        /* 
        Kept for historical reasons

        // Background-color is randomized based on the spawning tile one, but the deviation gets smaller and smaller with each level
        let initialTileColor = this.tile.style.backgroundColor;
        let matchColors = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
        let match = matchColors.exec(initialTileColor).slice(1);
        let newTileColor = "rgb(" + match.map(color => Math.min(255, Math.max(0, (Math.random() - 1) * (1 / (this.level + 1)) * 128 + parseInt(color))) ).join(",") +")";

        */

        // Get a random pastel color as the background for the new tile
        newTile.style.backgroundColor = getRandomPastelColor();

        this.tile.parentNode.appendChild(newTile);

        // Play the sound for the animation
        let audio = new CustomAudio(audioBoings[Math.floor(Math.random() * audioBoings.length)], "sounds");
        audio.init();
        audio.play();

        // Create our flood tile object
        let newFloodTile = new FloodTile(newTile, this.level + 1, newOffsetX, newOffsetY);
        newFloodTile.init();

        floodTiles.push(newFloodTile);
    }
}

/**
 * Spawn the base flood tile.
 * 
 */
function spawnBaseFloodTile() {
    let baseTile = document.createElement("div");

    baseTile.id = "base-tile";
    baseTile.classList.add("flood-tile");

    let color = getRandomPastelColor();

    baseTile.style.backgroundColor = color;

    document.getElementById("app-content").appendChild(baseTile);
    document.getElementById("app-content").classList.remove("cursor-pointer");

    baseFloodTile = new FloodTile(baseTile, 0, 0, 0);
    baseFloodTile.init();

    /* For strange reasons, this would create a very strange bug (on Firefox at least) after reset where you could fire spawnBaseFloodTile multiple times, either by clicking twice rapidly, or by waiting that the sound effect properly ended before clicking again. I still don't know why it does that.

    BUGFIX: I keep this comment for historical reasons, but the reason was due to loadingAudio that would fire more than once.
    */

    /*
    audioBoings[0].volume = getCurrentVolume();
    audioBoings[0].play();
    */

    let audio = new CustomAudio(audioBoings[Math.floor(Math.random() * audioBoings.length)], "sounds");
    audio.init();
    audio.play();

    floodTiles.push(baseFloodTile);
}

/**
 * Produces a random pastel color by returning an HSL string with high saturation and high light values.
 * 
 * @returns {String} A string giving the hsl value for a CSS color.
 */
function getRandomPastelColor() {
    let h = Math.random() * 360;
    let s = Math.random() * 10 + 65;
    let l = Math.random() * 10 + 75;

    return `hsl(${h}, ${s}%, ${l}%)`
}

/**
 * Handles the reset of the app.
 */

function resetButtonAction() {

    // Play an animation on the reset button
    document.getElementById("reset-button").animate(
        [
            { transform: "rotate(0deg)" },
            { transform: "rotate(720deg)" },
        ],
        {
            fill: "forwards",
            duration: 1000,
            easing: "ease-in-out",
            iterations: 1,
        }
    )

    // Check if there are any flood tiles before trying to remove them
    if (floodTiles.length != 0) {
        // This plays the sound and remove the tile immediately if there is only one tile
        if (floodTiles.length == 1) {
            floodTiles.pop().remove();
        }
        else {
            // Remove all flood tiles over one second
            let delay = 1000 / floodTiles.length;

            var interval = setInterval(function () {
                floodTiles.pop().remove();
                if (floodTiles.length == 0) {
                    clearInterval(interval);
                }
            }, delay);
        }
    }

    // Reinit the app after one second
    setTimeout(floodTilesInit, 1000);
}

