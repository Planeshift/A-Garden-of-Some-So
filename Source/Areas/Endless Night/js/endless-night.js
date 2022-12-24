/**
 * APP PARAMETERS
 */

// Debugging

const isDebugging = false;
const removeBlackScreen = false;

// Grid parameters
const maxStarsPerTile = 80;
const minStarsPerTile = 50;

const minStarSize = 1;
const maxStarSize = 3;

const minDistance = 25; // Minimal distance in pixels between stars

const maxTriesPerStar = 3 // Maximum number of tries for placing a star before giving up

/**
 * AUDIO
 */

// Initialize volume types

let volumeMaster = new VolumeType("master", document.getElementById("volume-master"));
volumeMaster.init();

let volumeMusic = new VolumeType("music", document.getElementById("volume-music"));
volumeMusic.init();

let volumeSounds = new VolumeType("sounds", document.getElementById("volume-sounds"));
volumeSounds.init();

// Audio files

const music = [
    new Audio("../audio/ambient-piano-prod-by-balancebay.mp3"),
]

const sounds = {
    UFOAudios: [
        new Audio("../audio/ufo1.mp3"),
    ],
    clickAudios: [
        new Audio("../audio/click_stuff.mp3"),
    ]
};

let soundsLength = 0;

for (let i = 0; i < music.length; i++) {
    music[i].addEventListener("canplaythrough", loadingAudio, { once: true });

    music[i].loop = true;
}

for (let key in sounds) {
    sounds[key].forEach(sound => {
        soundsLength++;
        sound.addEventListener("canplaythrough", loadingAudio, { once: true });
    });
}

let audiosToLoad = music.length + soundsLength;
let audioLoaded = 0;

/**
 * This function is fired whenever an audio is completely loaded. When all are loaded, this initializes the app, allowing the user to interact with the board.
 */

function loadingAudio() {
    audioLoaded++;
    if (audioLoaded >= audiosToLoad) {
        // Remove cursor-wait
        appContent.classList.remove("cursor-wait");

        // Init the app

        // resetButton.addEventListener("click", resetButtonAction, {once: true});

        telescope.addEventListener("click", telescopeAction, { once: true });

    }
}

/**
 * ITEMS PARAMETERS
 */



class ItemParameters {
    constructor(
        type,
        classPrefix = "",
        emoji,
        minDistanceSpawn = 0,
        maxDistanceSpawn = 0,
        minDistanceDestination = 0,
        maxDistanceDestination = 0,
        minTravelTime,
        maxTravelTime,
        minSize,
        maxSize,
        minTimeBetweenSpawn,
        maxTimeBetweenSpawn,
        audio = undefined,
    ) {
        this.type = type;
        this.classPrefix = classPrefix;
        this.emoji = emoji;
        this.minDistanceSpawn = minDistanceSpawn;
        this.maxDistanceSpawn = maxDistanceSpawn;
        this.minDistanceDestination = minDistanceDestination;
        this.maxDistanceDestination = maxDistanceDestination;
        this.minTravelTime = minTravelTime;
        this.maxTravelTime = maxTravelTime;
        this.minSize = minSize;
        this.maxSize = maxSize;
        this.minTimeBetweenSpawn = minTimeBetweenSpawn;
        this.maxTimeBetweenSpawn = maxTimeBetweenSpawn;
        this.audio = audio;
    }
}

// ITEM PARAMETERS

let itemParametersObject = {};

// SHOOTING STAR

let shootingStarParams = new ItemParameters(
    "shootingStar",
    "shooting-star",
    "🌠",
    0.8,
    1.2,
    0.8,
    1.2,
    12000,
    18000,
    2,
    6,
    45000,
    90000
)

itemParametersObject.shootingStar = shootingStarParams;

// COMET

let cometParams = new ItemParameters(
    "comet",
    "comet",
    "☄️",
    0.8,
    1.2,
    0.7,
    1,
    7000,
    10000,
    2,
    6,
    50000,
    100000
)

itemParametersObject.comet = cometParams;

// ROCKET

let rocketParams = new ItemParameters(
    "rocket",
    "rocket",
    "🚀",
    1.2,
    1.5,
    3,
    3.5,
    30000,
    35000,
    3,
    5,
    90000,
    100000,
)

itemParametersObject.rocket = rocketParams;

// UFO

let UFOParams = new ItemParameters(
    "ufo",
    "ufo",
    "🛸",
    1.5,
    3,
    2,
    4,
    20000,
    40000,
    4,
    7,
    240000,
    480000,
    sounds.UFOAudios[0],
)

//itemParametersObject.ufo = UFOParams;

// THE MOON

// The moon (and constellations) are a bit different from the rest, because they spawn on certain tiles (only once for the moon of course), meaning they don't use itemParameters

let moonElement = undefined; // Stores the moon when it's created.

const moonSpawnProbabilityOnTile = 0.01; // This is meant to be a percentage. It's basically the chance, each time a tile is revealed, that the moon would be in it (if it did not yet spawn). Default: 0.01

const moonSize = 10; // Size of the moon (in em). Default: 10.

// CONSTELLATIONS

// Oh boy
const constellationSpawnProbabilityOnTile = 0;

const minConstellationStars = 4;
const maxConstellationStars = 12;

/**
 * TILES
 */

class Tile{
    constructor(
        DOMElement,
        x,
        y
    ){
        this.DOMElement = DOMElement;
        this.x = x;
        this.y = y;
        this.stars = [];
        this.limitingStars = [];
    }

    populateTile(){

        let existingStars = [];

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if ((i != 0 || j != 0) && grid?.[this.x + i]?.[this.y + j] != undefined) {
                    Array.prototype.push.apply(existingStars, Array.from(grid[this.x + i][this.y + j].getElementsByClassName("star")));
                }
            }
        }

        let tileRect = this.DOMElement.getBoundingClientRect();

        this.limitingStars = existingStars.filter(star => {
            let starRect = star.getBoundingClientRect();

            let isWithinLeftOrRightLimit = (
                starRect.top <= tileRect.bottom + minDistance &&
                starRect.bottom >= tileRect.top - minDistance &&
                (
                    starRect.left <= tileRect.left && starRect.right + minDistance >= tileRect.left ||
                    starRect.right >= tileRect.right && starRect.left - minDistance <= tileRect.right
                )
            )

            let isWithinTopOrBottomLimit = (
                starRect.left <= tileRect.right + minDistance &&
                starRect.right >= tileRect.left - minDistance &&
                (
                    starRect.bottom <= tileRect.top && starRect.top + minDistance >= tileRect.top ||
                    starRect.top >= tileRect.bottom && starRect.bottom - minDistance <= tileRect.bottom
                )
            )

            return isWithinLeftOrRightLimit || isWithinTopOrBottomLimit;

        })

        // Throw the dice to spawn the moon, if possible
        this.spawnMoon();
        
        // Create constellation, maybe
        // let numberOfStarsInConstellation = this.spawnConstellation();

        // Add stars
        let numberOfStars = minStarsPerTile + Math.floor(Math.random() * (maxStarsPerTile - minStarsPerTile + 1));

        // numberOfStars -= numberOfStarsInConstellation;

        if(numberOfStars > 0){
            let a = this.addStars(numberOfStars);
            console.log(a);
        }
    }

    spawnMoon(){
        if (moonElement == undefined) {
            if (Math.random() <= moonSpawnProbabilityOnTile) {
                let moon = document.createElement("div");
                moon.id = "moon";
                moon.classList.add("star"); // We don't want stars to clutter on the moon or around it
                moon.textContent = "🌑";
                moonElement = moon;

                // Just put the moon in the middle
                moon.style.top = `50%`;
                moon.style.left = `50%`;

                moon.style.fontSize = `${moonSize}em`;

                this.DOMElement.appendChild(moon);

                moon.addEventListener("click", function () {
                    clickObjectSound();

                    let boundingRectNightGrid = nightGridContainer.getBoundingClientRect();
                    let boundingRectMoon = moon.getBoundingClientRect();

                    flourish(boundingRectMoon.left - boundingRectNightGrid.left + boundingRectMoon.width / 2, boundingRectMoon.top - boundingRectNightGrid.top + boundingRectMoon.height / 2, 3);

                    achievements.moon.check();
                    achievements.moon.popUp(appContent);
                }, { once: true });

                this.limitingStars.push(moon);
            }
        }
    }

    spawnConstellation(){
        if(Math.random() <= constellationSpawnProbabilityOnTile){
            let numberOfStarsInConstellation = minConstellationStars + Math.floor(Math.random() * (maxConstellationStars - minConstellationStars + 1));

            console.log("numberOfStarsInConstellation: ", numberOfStarsInConstellation);
            let starsInConstellation = this.addStars(numberOfStarsInConstellation, true);
            console.log("starsInConstellation: ", starsInConstellation);

            let coordinates = [];

            let starsWithCoordinates = [];

            starsInConstellation.forEach(star =>{
                let rect = star.getBoundingClientRect();
                // Doesn't matter if coordinates are inverted in CSS, the triangulation works the same way

                coordinates.push(rect.left + rect.width / 2, rect.top + rect.height / 2);
                starsWithCoordinates.push(
                    {
                        star: star,
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2
                    }
                )
            })

            let delaunay = new Delaunator(coordinates);
            //delaunay.from(coordinates);

            console.log("coordinates: ", coordinates);
            console.log("delaunay: ", delaunay);
            console.log("starsWithCoordinates: ", starsWithCoordinates);

            

            return starsInConstellation.length;
        }

        return 0;
    }
    
    addStars(n, isConstellation = false){

        let createdStars = [];

        let tileRect = this.DOMElement.getBoundingClientRect();

        for (let i = 0; i < n; i++) {
            for (let i = 0; i < maxTriesPerStar; i++) {

                let star = document.createElement("div");
                star.classList.add("star");

                if(isConstellation){
                    star.classList.add("star-constellation");
                }
                star.textContent = "⭐";
    
                let starSize = minStarSize + Math.random() * (maxStarSize - minStarSize);
                star.style.fontSize = `min( ${starSize}vw, ${starSize}vh)`;

                // Append the star to the grid right now so we can use getBoundingClientRect on it, which will help us on proper placement and distance from other stars.
                this.DOMElement.appendChild(star);
    
                let starRect = star.getBoundingClientRect();
    
                // We want the star to be within the boundaries of the tile, and the randomization process should be as uniform as possible. Therefore, we first put it on the grid, then we grab its effective size in both dimensions (X or width and Y or height), then we randomly get a value between 0 and the appropriate dimension of the tile minus that dimension for each dimension. We then divide that by the grid dimension and multiply that by 100 to get a value in percentage, which is what we want in the end.
    
                let starX = 100 * (Math.random() * (tileRect.width - starRect.width)) / tileRect.width;
                let starY = 100 * (Math.random() * (tileRect.height - starRect.height)) / tileRect.height;
    
                star.style.top = `${starY}%`;
                star.style.left = `${starX}%`;
    
                // Udpate the values
                starRect = star.getBoundingClientRect();
    
                let starCenterX = starRect.left + starRect.width / 2;
                let starCenterY = starRect.top + starRect.height / 2;
    
                // Stars are assumed to fit within the square/imaginary circle they reside in, therefore to get the radius we get either the width or the height. Otherwise, we'd have to do even more maths.
    
                let starRadius = starRect.width / 2;
    
                let isFurtherThanMinDistance = true;
    
                this.limitingStars.every(limitingStar => {
                    let limitingStarRect = limitingStar.getBoundingClientRect();
    
                    let limitingStarCenterX = limitingStarRect.left + limitingStarRect.width / 2;
                    let limitingStarCenterY = limitingStarRect.top + limitingStarRect.height / 2;
    
                    let limitingStarRadius = limitingStarRect.width / 2;
    
                    let distance = Math.hypot(limitingStarCenterX - starCenterX, limitingStarCenterY - starCenterY) - starRadius - limitingStarRadius;
    
                    if (minDistance >= distance) {
                        this.DOMElement.removeChild(star);
                        isFurtherThanMinDistance = false;
                        return false;
                    } else {
                        isFurtherThanMinDistance = true;
                        return true;
                    }
                });
    
                // If this star is far enough from all other limiting stars, stop this loop
                if (isFurtherThanMinDistance) {
                    this.limitingStars.push(star);
                    this.stars.push(star);
                    createdStars.push(star);
                    break;
                }
    
            }
        }

        return createdStars;
    }


}
/**
 * ACHIEVEMENTS
 */

let achievements = {
    shootingStar : new Achievement("Make A Wish", "Interact with a shooting star.", "🌠", "emoji", true, true),
    comet : new Achievement("Almost A Rock Star", "Interact with a comet.", "☄️", "emoji", true, true),
    satellite : new Achievement("Beep Beep Little Satellite", "Interact with a satellite.", "🛰️", "emoji", true, true),
    rocket : new Achievement("Actual Rocket Science", "Interact with a rocket.", "🚀", "emoji", true, true),
    ufo : new Achievement("First Contact", "Interact with an UFO.", "🛸", "emoji", false, true),
    moon : new Achievement("Fly Me To The Moon", "Interact with the moon.", "🌑", "emoji", true, true),

}

// Add the achievements to the interface
populateAchievements(achievements);

// Common access stuff

let telescope = document.getElementById("telescope");

let appContent = document.getElementById("app-content");

var nightGridContainer;

var hole;

let grid = [];

let musicAudio = new CustomAudio(music[0], "music", false, true);
musicAudio.init();

let currentTimeouts = {};

// Drag stuff

const Friction = 0.95;

let isDragging = false;

let mousePosition = {
    x: 0,
    y: 0
}

let velocity = {
    x: 0,
    y: 0
}

let gridPosition = {
    x: 0,
    y: 0
}


// Start the app babyyyy

function telescopeAction() {
    let blackScreen = document.createElement("div");
    blackScreen.classList.add("black-screen");
    appContent.appendChild(blackScreen);

    hole = document.createElement("div");
    hole.classList.add("hole");
    blackScreen.appendChild(hole);

    let holeAnimation = hole.animate([
        {
            width: "max(200vw, 200vh)",
            height: "max(200vw, 200vh)"
        },
        {
            width: "0%",
            height: "0%"
        },
    ],
        {
            duration: 1000,
            easing: "ease-out",
            iterations: 1
        });

    holeAnimation.addEventListener("finish", function () {
        createNightSky();

        playMusic();

        let open = hole.animate([
            {
                width: "0%",
                height: "0%",
                offset: 0,
            },
            {
                width: "0%",
                height: "0%",
                offset: 0.33333,
            },
            {
                width: "min(95vw, 95vh)",
                height: "min(95vw, 95vh)",
            }
        ],
            {
                duration: 3000,
                easing: "ease-out",
                iterations: 1,
            });

        open.addEventListener("finish", function () {
            initSpawn();

            // Testing only
            // createUFO();
            // createRocket();

            // Debugging
            if (removeBlackScreen) {
                blackScreen.remove();
            }
        });

    })

}

function playMusic(fromStart = true) {
    musicAudio.audio.pause();
    if (fromStart) {
        musicAudio.audio.currentTime = 0;
    }
    musicAudio.audio.play();
}

function createNightSky() {
    let nightSky = document.createElement("div");
    nightSky.classList.add("night-sky");
    appContent.appendChild(nightSky);

    nightGridContainer = document.createElement("div");
    nightGridContainer.classList.add("night-grid");
    nightSky.appendChild(nightGridContainer);

    nightGridContainer.addEventListener("mousedown", onGridMouseDown);
    document.addEventListener("mousemove", onGridMouseMove);
    document.addEventListener("mouseup", onGridMouseUp);

    step();

    addTileToGrid(0, 0, true);
}

function addTileToGrid(x, y, addNeighbours) {

    if (grid?.[x]?.[y] == undefined) {

        let nightTile = document.createElement("div");
        nightTile.classList.add("night-tile");
        nightGridContainer.appendChild(nightTile);

        if (grid[x] == undefined) {
            grid[x] = [];
        }

        grid[x][y] = nightTile;

        nightTile.style.transform = `translateX(calc(${x} * 100vw)) translateY(calc(${y} * 100vh))`;

        let tile = new Tile(nightTile, x, y);
        // Populate the grid with stars

        tile.populateTile();
    }

    if (addNeighbours) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                addTileToGrid(x + i, y + j, false);
            }
        }
    }

}

// SPAWNING STUFF

function spawnNextItem(itemParams){
    let time = itemParams.minTimeBetweenSpawn + Math.random() * (itemParams.maxTimeBetweenSpawn - itemParams.minTimeBetweenSpawn);

    currentTimeouts[itemParams.type] = setTimeout(createItem.bind(null, itemParams), time);
}


function initSpawn() {
    for(let key in itemParametersObject){
        spawnNextItem(itemParametersObject[key]);
    }
}

/**
 * 
 * @param {ItemParameters} itemParams 
 */

function createItem(itemParams) {
    let itemContainer = document.createElement("div");
    itemContainer.classList.add(itemParams.classPrefix + "-container");

    let itemMovementX = document.createElement("div");
    itemMovementX.style.position = "absolute";
    itemMovementX.style.left = 0;
    itemMovementX.style.top = 0;

    let itemMovementY = document.createElement("div");
    itemMovementY.style.position = "absolute";
    itemMovementY.style.left = 0;
    itemMovementY.style.top = 0;

    let itemSizeChange = document.createElement("div");
    let itemRotation = document.createElement("div");
    let item = document.createElement("div");
    item.classList.add(itemParams.classPrefix);
    item.textContent = itemParams.emoji;

    let itemSize = itemParams.minSize + Math.random() * (itemParams.maxSize - itemParams.minSize);
    item.style.fontSize = `${itemSize}em`;

    itemContainer.appendChild(itemMovementX);
    itemMovementX.appendChild(itemMovementY);
    itemMovementY.appendChild(itemSizeChange);
    itemSizeChange.appendChild(itemRotation);
    itemRotation.appendChild(item);

    nightGridContainer.appendChild(itemContainer);

    // Inverted for X because gridPositions are inverted in regards to X (for usal cartesian coordinates that is)
    let centerScreenX = - (gridPosition.x - window.innerWidth / 2);
    let centerScreenY = gridPosition.y - window.innerHeight / 2;

    let angle;
    let distanceSpawn;
    let x;
    let y;
    let distanceDestination;
    let angleDestination;

    let angleRotation;
    let translateX;
    let translateY;

    let movementXAnim;
    let movementYAnim;

    let travelXDuration;
    let travelYDuration;

    let easingX;
    let easingY;

    let easingRotation;

    let fadeInDuration;
    let fadeOutDuration;

    console.log(itemParams.type);

    // Get the angle based on the type
    switch (itemParams.type) {
        case "shootingStar":
            // (__)
            angle = Math.random() * Math.PI;
            break;

        case "comet":

            // Angle between [PI/8, 3PI/8] or [5PI/8, 7PI/8]
            angle = Math.PI / 8 + Math.random() * Math.PI / 4 + Math.floor(Math.random() * 2) * Math.PI / 2;
            break;

        case "rocket":
            
            // Two cases: if moon is on the grid, the rocket has to go towards it; if not, it goes from the bottom of the screen to the top.

            if (moonElement != undefined) {
                // First we get the coordinates of the moon, relative to the nightGrid container
                let moonBoundingRect = moonElement.getBoundingClientRect();
                let nightGridBoundingRect = nightGridContainer.getBoundingClientRect();

                let moonX = moonBoundingRect.left - nightGridBoundingRect.left + moonBoundingRect.width / 2;
                let moonY = - (moonBoundingRect.top - nightGridBoundingRect.top + moonBoundingRect.height / 2);

                // Then, we get the angle from the center of the screen to the moon (angle as determined by usual cartesian coordinates, yadda yadda)

                // TODO?: If the moon is close enough to the center of the screen, spawn at a random angle then go towards the moon

                angle = Math.atan2(centerScreenY - moonY, centerScreenX - moonX);
            } else {
                // Get an angle between Pi and 2Pi (we want the rocket coming from the bottom of the screen)
                angle = Math.PI * (Math.random() + 1);
            }
            break;

        default:
            // All other cases (ie. UFO)
            // (  )
            angle = 2 * Math.PI * Math.random();
            break;
    }

    console.log("angle: ", angle);

    // Get the distanceSpawn

    // Same for all cases so far
    distanceSpawn = (Math.random() * (itemParams.maxDistanceSpawn - itemParams.minDistanceSpawn) + itemParams.minDistanceSpawn) * Math.max(window.innerWidth, window.innerHeight);

    console.log("distanceSpawn: ", distanceSpawn);

    // Get x and y

    // Same for all cases so far

    x = Math.cos(angle) * distanceSpawn + centerScreenX;
    // Throw a minus here because coordinates are inverted in regards to CSS (top / left positionning)
    y = -Math.sin(angle) * distanceSpawn - centerScreenY;

    // Now we adjust the item so its center is at the calculated coordinates
    let itemBoundingRect = itemContainer.getBoundingClientRect();

    x -= itemBoundingRect.width / 2;
    y -= itemBoundingRect.height / 2;

    console.log("x, y: ", x, y);

    itemContainer.style.left = `${x}px`;
    itemContainer.style.top = `${y}px`;


    // Distance travelled

    // Special case for the rocket
    if(itemParams.type == "rocket" && moonElement != undefined){
        // The distance travelled is a tad more tricky there: we want the rocket to not overshoot the moon.

        let distanceRocketMoon = getDistanceBetweenElements(moonElement, itemContainer);

        // We must convert this distance to something similar to our other distance destination, therefore:
        distanceRocketMoon = distanceRocketMoon / Math.max(window.innerHeight, window.innerWidth);

        /* The distance must be one of these:
                - the distance between the rocket and the moon, if it's smaller than min rocket distance destination
                - a value between the min rocket distance destination and the distance between the rocket and the moon, if the distance Rocket > Moon is smaller than the max rocket distance destination
                - the normal value between the min rocket distance and the max rocket distance destination if the moon is too far away
        
                Therefore, we get:
                    The minimal value between :
                        distance R>M AND
                        the minimal distance destination +
                            the minimal value between :
                                maxRocketDistanceDest - minusRockteDistanceDestination
                                Maximal value between : 0 / distance R>M - minRocketDistanceDestination
                
                This should always give us what we want.
                */
        distanceDestination = Math.min(distanceRocketMoon, itemParams.minDistanceDestination + Math.random() * Math.min(itemParams.maxDistanceDestination - itemParams.minDistanceDestination, Math.max(distanceRocketMoon - itemParams.minDistanceDestination, 0)));

    }else{
        // All other cases
        distanceDestination = itemParams.minDistanceDestination + Math.random() * (itemParams.maxDistanceDestination - itemParams.minDistanceDestination);
    }

    console.log("distanceDestination: ", distanceDestination);

    // Angle Destination
    switch(itemParams.type){
        case "shootingStar":
            angleDestination = angle + Math.PI - (1 / 16 * Math.PI) + Math.random() * (1 / 8 * Math.PI);
            break;

        case "comet":
            angleDestination = angle + Math.PI - (1 / 16 * Math.PI) + Math.random() * (1 / 8 * Math.PI);
            break;

        case "rocket":
            if(moonElement != undefined){
                angleDestination = angle + Math.PI;
            }else{
                angleDestination = Math.PI / 2;
            }
            break;
        case "ufo":
            angleDestination = angle + Math.PI - (1 / 16 * Math.PI) + Math.random() * (1 / 8 * Math.PI);
            break;
        default:
            angleDestination = angle + Math.PI;
            break;
    }

    console.log("angleDestination: ", angleDestination);

    // Rotation angle
    if(itemParams.type == "ufo"){
        angleRotation = 0;
    }else{
        // All due to the way coordinates are backwards in regards to the Y axis.
        angleRotation = -angleDestination;
    }

    console.log("angleRotation: ", angleRotation);

    // Translate values

    // Same for everyone so far
    translateX = Math.cos(angleDestination) * distanceDestination * Math.max(window.innerWidth, window.innerHeight);
    // Still a minus, for the same reasons as before: CSS is backwards in regard to the Y axis
    translateY = -Math.sin(angleDestination) * distanceDestination * Math.max(window.innerWidth, window.innerHeight);

    console.log("translateX, translateY: ", translateX, translateY);

    // Travel duration

    // Same for all cases so far, might change back to travelDuration if it stays that way
    travelXDuration = itemParams.minTravelTime + Math.random() * (itemParams.maxTravelTime - itemParams.minTravelTime);

    travelYDuration = travelXDuration;
    

    console.log("travelXDuration, travelYDuration: ", travelXDuration, travelYDuration);

    // Easing

    // Same for all except comet

    if(itemParams.type == "comet"){
        easingY = "linear";
        easingX = `cubic-bezier(0, ${Math.random() / 2}, ${Math.random() / 2}, 1)`;
        easingRotation = easingY;
    }else{
        easingX = "linear";
        easingY = "linear";
        easingRotation = "linear";
    }

    // Rotation movement

    // No rotation over time except for comets
    if(itemParams.type == "comet"){
        let initialAngleRotation = angle >= Math.PI / 2 ? 0 : Math.PI;
        angleRotation = Math.PI / 2;

        itemRotation.animate(
            [
                {
                    transform: `rotate(${initialAngleRotation}rad)`,
                },
                {
                    transform: `rotate(${angleRotation}rad)`,
                }
            ],
            {
                fill: "forwards",
                duration: Math.max(travelXDuration, travelYDuration),
                easing: easingRotation,
                iterations: 1,
            }
        )
    }else{
        itemRotation.style.transform = `rotate(${angleRotation}rad)`;
    }

    // Translate movement

    // Same for all cases so far
    movementXAnim = itemMovementX.animate(
        [
            {
                transform: `translateX(0)`,
            },
            {
                transform: `translateX(${translateX}px)`,
            }
        ],
        {
            fill: "forwards",
            duration: travelXDuration,
            easing: easingX,
            iterations: 1,
        });

    movementYAnim = itemMovementY.animate(
        [
            {
                transform: `translateY(0)`,
            },
            {
                transform: `translateY(${translateY}px)`,
            }
        ],
        {
            fill: "forwards",
            duration: travelYDuration,
            easing: easingY,
            iterations: 1,
        }
    );

    fadeInDuration = Math.min( Math.max(travelXDuration / 3, travelYDuration / 3), 1000);
    fadeOutDuration = Math.min( Math.max(travelXDuration / 3, travelYDuration / 3), 1000);

    let itemSizeUp = itemSizeChange.animate([
        {
            transform: "scale(0)",
        },
        {
            transform: "scale(1)",
        },
    ],
        {
            fill: "forwards",
            duration: fadeInDuration,
            easing: "ease-in-out",
            iterations: 1,
        });

    let itemSizeDown = itemSizeChange.animate([
        {
            transform: "scale(1)",
        },
        {
            transform: "scale(0)",
        }
    ], {
        fill: "forwards",
        delay: Math.max(travelXDuration, travelYDuration) - fadeOutDuration,
        duration: fadeOutDuration,
        iterations: 1,
        easing: "linear",
    });

    // Audio

    let itemAudio;
    let itemAudioEmitter;
    let timeoutID;

    if(itemParams.audio){
        console.log("Audio has been found.");

        itemAudio = new CustomAudio(itemParams.audio, "sounds", false, true);

        // TODO: Check how this works.
        itemAudioEmitter = new AudioEmitter(item, itemAudio, { x: "50%", y: "50%" }, 3 * Math.max(window.innerWidth, window.innerHeight));

        console.log(itemAudioEmitter);

        itemAudio.init();
        itemAudio.fade(fadeInDuration, 10);
        itemAudioEmitter.init();

        // Fadeout
        timeoutID = setTimeout(function () {
            itemAudio.fade(fadeOutDuration, 10, false);
        },
        Math.max(travelXDuration, travelYDuration) - fadeOutDuration);
        
        movementXAnim.addEventListener("finish", function(){
            itemAudioEmitter.remove(true);
        })
    }

    console.log("itemAudioEmitter: ", itemAudioEmitter);

    // Either itemMovementX or Y, both have the same length
    movementXAnim.addEventListener("finish", function () {
        console.log("Finished.");
        itemContainer.remove();
        spawnNextItem(itemParams);
    });

    item.addEventListener("click", function () {
        // pause animations
        movementXAnim.pause();
        movementYAnim.pause();
        itemSizeUp.pause();
        itemSizeDown.pause();

        // Stop the timer
        if(timeoutID != undefined) clearTimeout(timeoutID);

        // Constant, may change it
        let shrinkTime = 350;

        let boundingRectNightGrid = nightGridContainer.getBoundingClientRect();
        let boundingRectItem = item.getBoundingClientRect();

        flourish(boundingRectItem.left - boundingRectNightGrid.left + boundingRectItem.width / 2, boundingRectItem.top - boundingRectNightGrid.top + boundingRectItem.height / 2);

        let currentTransform = window.getComputedStyle(item, null).getPropertyValue("transform");

        let initialTransform = currentTransform == "none" ? "" : currentTransform + " ";

        let shrink = item.animate([
            {
                transform: `${initialTransform}scale(1)`,
            },
            {
                transform: `${initialTransform}scale(0)`,
            }
        ],
            {
                fill: "forwards",
                duration: shrinkTime, // TODO: duration based on the size on the object at the time of clicking relative to its max size.
                iterations: 1,
                easing: "linear",
            }
        )

        if (itemAudioEmitter != undefined) {
            itemAudioEmitter.customAudio.fade(shrinkTime, 10, false);
        }

        clickObjectSound();

        shrink.addEventListener("finish", function () {
            if (itemAudioEmitter != undefined) {
                console.log("Remove audio emitter.");
                itemAudioEmitter.remove(true);
            }
            itemContainer.remove();
        });

        // Achievement
        if (!achievements[itemParams.type].isChecked()) {
            achievements[itemParams.type].check();
            achievements[itemParams.type].popUp(appContent);
        }

        // Trigger spawn for next item
        spawnNextItem(itemParams);
    }, { once: true });

}

// Click stuff

function clickObjectSound() {
    let clickSound = new CustomAudio(sounds.clickAudios[0], "sounds");
    clickSound.init();
    clickSound.play();
}

/**
 * 
 * @param {AudioEmitter|HTMLElement} stuff 
 */
function clickStuff(stuff) {

    let isAudioEmitter = stuff instanceof AudioEmitter;
    let DOMElement = isAudioEmitter ? stuff.DOMElement : stuff;
    // Constant, may change it
    let shrinkTime = 350;

    let boundingRectNightGrid = nightGridContainer.getBoundingClientRect();
    let boundingRectEmitter = DOMElement.getBoundingClientRect();

    flourish(boundingRectEmitter.left - boundingRectNightGrid.left + boundingRectEmitter.width / 2, boundingRectEmitter.top - boundingRectNightGrid.top + boundingRectEmitter.height / 2);

    let currentTransform = window.getComputedStyle(DOMElement, null).getPropertyValue("transform");

    let shrink = DOMElement.animate([
        {
            transform: `${currentTransform} scale(1)`,
        },
        {
            transform: `${currentTransform} scale(0)`,
        }
    ],
        {
            fill: "forwards",
            duration: shrinkTime, // TODO: duration based on the size on the object at the time of clicking relative to its max size.
            iterations: 1,
            easing: "linear",
        }
    )

    if (isAudioEmitter) {
        stuff.customAudio.fade(shrinkTime, 10, false);
    }

    clickObjectSound();

    shrink.addEventListener("finish", function () {
        if (isAudioEmitter) {
            stuff.remove(true);
        } else {
            DOMElement.remove();
        }
    });

}

function flourish(x, y, scale = 1) {
    let sparkles = [];
    let glowingStars = [];

    // Parameters

    let spawnDuration = 500;
    let fadeDuration = 200;

    let sparkleDistScale = 1.5 * scale;
    let sparkleSize = 1.25 * scale;

    let glowingStarDistScale = 2.5 * scale;
    let glowingStarSize = 1.5 * scale;

    for (let i = 0; i < 4; i++) {


        // Sparkles
        sparkles[i] = document.createElement("div");
        sparkles[i].classList.add("sparkle-container");

        let sparkleFade = document.createElement("div");
        let sparkle = document.createElement("div");

        sparkle.textContent = "✨";
        sparkle.style.fontSize = `${sparkleSize}em`;

        let directionX = 1;
        let directionY = 1;

        let transform = `translate(max(${sparkleDistScale}vw, ${sparkleDistScale}vh), max(${sparkleDistScale}vw, ${sparkleDistScale}vh)) scale(1)`;

        switch (i) {
            case 1:
                directionX = 1;
                directionY = -1;

                transform = `translate(max(${sparkleDistScale}vw, ${sparkleDistScale}vh), min(${-sparkleDistScale}vw, ${-sparkleDistScale}vh))`;

                break;

            case 2:
                directionX = -1;
                directionY = -1;

                transform = `translate(min(${-sparkleDistScale}vw, ${-sparkleDistScale}vh), min(${-sparkleDistScale}vw, ${-sparkleDistScale}vh))`;
                break;
            case 3:
                directionX = -1;
                directionY = 1;

                transform = `translate(min(${-sparkleDistScale}vw, ${-sparkleDistScale}vh), max(${sparkleDistScale}vw, ${sparkleDistScale}vh))`;
            default:
                break;
        }

        sparkle.style.transform = `scale(${directionX},${directionY})`;

        nightGridContainer.appendChild(sparkles[i]);
        sparkles[i].appendChild(sparkleFade);
        sparkleFade.appendChild(sparkle);

        let sparkleBoundingRect = sparkles[i].getBoundingClientRect();

        sparkles[i].style.top = `${y - sparkleBoundingRect.height / 2}px`;
        sparkles[i].style.left = `${x - sparkleBoundingRect.width / 2}px`;

        let sparkleMovement = sparkles[i].animate([
            {
                transform: `translate(0, 0) scale(0)`,
            },
            {
                transform: transform,
            },
        ],
            {
                fill: "forwards",
                duration: spawnDuration,
                easing: "ease-out",
                iterations: 1,
            });

        sparkleMovement.addEventListener("finish", function () {
            let sparkleFadeOut = sparkleFade.animate([
                {
                    opacity: 1,
                    transform: "scale(1)",
                },
                {
                    opacity: 0,
                    transform: "scale(0)",
                },
            ],
                {
                    fill: "forwards",
                    duration: fadeDuration,
                    easing: "linear",
                    iterations: 1,
                })

            sparkleFadeOut.addEventListener("finish", function () {
                sparkles[i].remove();
            })
        })


        // Glowing stars

        glowingStars[i] = document.createElement("div");
        glowingStars[i].classList.add("glowing-star-container");

        let glowingStarFade = document.createElement("div");

        let glowingStar = document.createElement("div");
        glowingStar.textContent = "🌟";
        glowingStar.style.fontSize = `${glowingStarSize}em`;
        glowingStar.style.transformOrigin = `center`;
        glowingStar.style.transform = `rotate(${i * 90}deg)`;

        nightGridContainer.appendChild(glowingStars[i]);
        glowingStars[i].appendChild(glowingStarFade);
        glowingStarFade.appendChild(glowingStar);

        let glowingStarBoundingRect = glowingStars[i].getBoundingClientRect();

        glowingStars[i].style.top = `${y - glowingStarBoundingRect.height / 2}px`;
        glowingStars[i].style.left = `${x - glowingStarBoundingRect.width / 2}px`;

        switch (i) {
            case 0:
                transform = `translate(0, min(${-glowingStarDistScale}vw, ${-glowingStarDistScale}vh)) scale(1)`;
                break;

            case 1:
                transform = `translate(max(${glowingStarDistScale}vw, ${glowingStarDistScale}vh), 0) scale(1)`;
                break;

            case 2:
                transform = `translate(0, max(${glowingStarDistScale}vw, ${glowingStarDistScale}vh)) scale(1)`;
                break;

            case 3:
                transform = `translate(min(${-glowingStarDistScale}vw, ${-glowingStarDistScale}vh), 0) scale(1)`;
                break;
        }

        let glowingStarMovement = glowingStars[i].animate(
            [
                {
                    transform: `translate(0,0) scale(0)`,
                },
                {
                    transform: transform,
                }
            ],
            {
                fill: "forwards",
                duration: spawnDuration,
                easing: "ease-out",
                iterations: 1,
            }
        )

        glowingStarMovement.addEventListener("finish", function () {
            let glowingStarFadeOut = glowingStarFade.animate([
                {
                    opacity: 1,
                    transform: "scale(1)",
                },
                {
                    opacity: 0,
                    transform: "scale(0)",
                },
            ],
                {
                    fill: "forwards",
                    duration: fadeDuration,
                    easing: "linear",
                    iterations: 1,
                })

            glowingStarFadeOut.addEventListener("finish", function () {
                glowingStars[i].remove();
            })
        })

    }



}

// 
// Dragging around

/**
 * 
 * @param {MouseEvent} e 
 */

function onGridMouseDown(e) {
    isDragging = true;
    velocity.x = 0;
    velocity.y = 0;
    mousePosition.x = e.pageX;
    mousePosition.y = e.pageY;
}

/**
 * 
 * @param {MouseEvent} e 
 */

function onGridMouseMove(e) {
    if (isDragging) {
        velocity.x = e.pageX - mousePosition.x;
        velocity.y = e.pageY - mousePosition.y;

        mousePosition.x = e.pageX;
        mousePosition.y = e.pageY;

        gridPosition.x += velocity.x;
        gridPosition.y += velocity.y;
    }
}

/**
 * 
 */

function onGridMouseUp() {
    isDragging = false;
}

function step() {

    requestAnimationFrame(step);

    if (!isDragging && Math.abs(velocity.x) > 0.01 && Math.abs(velocity.y) > 0.01) {
        gridPosition.x += velocity.x;
        gridPosition.y += velocity.y;

        velocity.x *= Friction;
        velocity.y *= Friction;
    }

    let x = -Math.round(gridPosition.x / window.innerWidth);
    let y = -Math.round(gridPosition.y / window.innerHeight);

    addTileToGrid(x, y, true);

    nightGridContainer.style.left = gridPosition.x + "px";
    nightGridContainer.style.top = gridPosition.y + "px";
}




/**
 * Debugging
 */


if (isDebugging) {
    let debugWindow = document.createElement("div");
    debugWindow.classList.add("debug-window");

    let debugWindowTitle = document.createElement("div");
    debugWindowTitle.textContent = "Debug Window";
    debugWindow.appendChild(debugWindowTitle);

    appContent.appendChild(debugWindow);

    let debug = {
        window: debugWindow,
        data: [],
        updateDebugWindow: function () {

            requestAnimationFrame(debug.updateDebugWindow);

            let dataLength = debug.data.length;

            for (let i = 0; i < dataLength; i++) {
                if (debug.data[i].DOMElement) {
                    debug.data[i].DOMElement.textContent = debug.data[i].pointer[debug.data[i].key];
                } else {
                    let dataLine = document.createElement("div");
                    dataLine.textContent = debug.data[i].name + ": ";

                    debug.data[i].DOMElement = document.createElement("span");
                    debug.data[i].DOMElement.textContent = debug.data[i].pointer[debug.data[i].key];

                    dataLine.appendChild(debug.data[i].DOMElement);
                    debugWindow.appendChild(dataLine);
                }
            }
        }
    }

    debug.data.push(
        {
            name: "mouse position X",
            pointer: mousePosition,
            key: "x",
        },
        {
            name: "mouse position Y",
            pointer: mousePosition,
            key: "y",
        },
        {
            name: "velocity X",
            pointer: velocity,
            key: "x",
        },
        {
            name: "velocity Y",
            pointer: velocity,
            key: "y"
        },
        {
            name: "grid position X",
            pointer: gridPosition,
            key: "x",
        },
        {
            name: "grid position Y",
            pointer: gridPosition,
            key: "y"
        }
    )

    debug.updateDebugWindow();

}