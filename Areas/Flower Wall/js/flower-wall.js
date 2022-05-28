/* Constants */

const harpSounds = [
    new Audio("../audio/harp1.wav"),
    new Audio("../audio/harp2.wav"),
    new Audio("../audio/harp3.wav"),
    new Audio("../audio/harp4.wav"),
    new Audio("../audio/harp5.wav"),
    new Audio("../audio/harp6.wav"),
    new Audio("../audio/harp7.wav"),
    new Audio("../audio/harp8.wav"),
    new Audio("../audio/harp9.wav"),
    new Audio("../audio/harp10.wav"),
]

const resetDuration = 1500;

const appContent = document.getElementById("app-content");

const resetButton = document.getElementById("reset-button");


// Pre-loading

let audiosToLoad = harpSounds.length;
let audioLoaded = 0;

for(let i = 0; i < harpSounds.length; i++){
    harpSounds[i].addEventListener("canplaythrough", loadingAudio, {once: true});
}

/**
 * This function is fired whenever an audio is completely loaded. When all are loaded, this initializes the app, allowing the user to interact with the board.
 */

function loadingAudio(){
    audioLoaded++;
    if(audioLoaded >= audiosToLoad){
        // Remove cursor-wait
        appContent.classList.remove("cursor-wait");

        // Add cursor-pointer
        appContent.classList.add("cursor-pointer");

        // Init the app
        resetButton.addEventListener("click", resetButtonAction, {once: true});
        appContent.addEventListener("click", createFlower);

    }
}

/**
 * Creates a flower where the user clicked.
 * @param {MouseEvent} e A MouseEvent corresponding to where a user clicked.
 */

function createFlower(e){
    let offsetX = e.clientX;
    let offsetY = e.clientY;

    let pistilRadius = 25;
    let petalHeight = 100;
    let petalWidth = 32;
    let flowerSize = 2 * petalHeight + 2 * pistilRadius;

    let flowerScale = getFlowerScale();
    let petalNumber = getPetalNumber();
    let crownNumber = getCrownNumber();
    let minCrownScaleSize = getMinCrownScaleSize();

    let pistilBackgroundColor = getPistilColor();
    let petalColors = getPetalColors(crownNumber);
    if(Math.random() >= 0.5){
        petalColors.reverse();
    }

    // Add to use a wrapper on the flower because, whenever an element is undergoing a transform effect, its zIndex is considered 0 (more or less), which meant new flowers appeared underneath the old ones, then popped above once the animation finished. 
    let flowerBox = document.createElement("div");
    flowerBox.style.position = "absolute";
    flowerBox.style.top = `${offsetY}px`;
    flowerBox.style.left = `${offsetX}px`;
    flowerBox.style.height = `${flowerSize}px`;
    flowerBox.style.width = `${flowerSize}px`;
    flowerBox.style.transform = `translate(-50%, -50%) scale(${flowerScale})`;
    appContent.appendChild(flowerBox);
    
    let flower = document.createElement("div");
    flower.classList.add("flower");
    flowerBox.appendChild(flower);

    let rotationBaseDirection = Math.random() >= 0.5 ? 1 : -1;

    
    let pistilBorder = document.createElement("div");
    pistilBorder.classList.add("pistil-border");
    pistilBorder.style.height = `${2.8 * pistilRadius}px`; // Could not work if petals were different in style (length, width, etc), this is a bit of a magic number situation
    pistilBorder.style.width = `${2.8 * pistilRadius}px`;
    flower.appendChild(pistilBorder);

    let crowns = document.createElement("div");
    crowns.style.width = "100%";
    crowns.style.height = "100%";
    flower.appendChild(crowns);

    for(let i = 0; i < crownNumber; i++ ){

        let crown = document.createElement("div");
        crown.classList.add("crown");
        crown.style.zIndex = crownNumber - i;
        crowns.appendChild(crown);


        for(let j = 0; j < petalNumber; j++){

            let petalSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            petalSvg.classList.add("petal");
            petalSvg.style.zIndex = `${crownNumber - i}`;
            petalSvg.style.transformOrigin = `50% calc(100% + ${pistilRadius}px)`;
            petalSvg.style.transform = `translateX(-50%) 
                                        rotate(${i * (360 / petalNumber) / crownNumber + j * 360 / petalNumber}deg)`;
            petalSvg.style.fill = petalColors[i];
            petalSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            petalSvg.setAttribute("height", `${petalHeight}px`);
            petalSvg.setAttribute("width", `${petalWidth}px`);
            petalSvg.setAttribute("viewBox", "0 0 32 100");
            crown.appendChild(petalSvg);
    
            let petalPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            petalPath.setAttribute("d", "M 16.00,0.00 C -14.00,20.00 6.00,80.00 16.00,100.00 26.00,80.00 46.00,20.00 16.00,0.00 Z");
            petalSvg.appendChild(petalPath);

        }
        
        crown.animate(
            [
                { transform: `scale(0) rotate(${rotationBaseDirection * 360}deg)`, offset: 0},
                { transform: `scale(${ 1.4 * (1 - (crownNumber - 1 - i) * ( (1 - minCrownScaleSize) / crownNumber)) }) rotate(${rotationBaseDirection * 0.2 * 360}deg)`, offset: 0.8},
                { transform:  `scale(${1 - (crownNumber - 1 - i) * ( (1 - minCrownScaleSize) / crownNumber)}) rotate(0deg)`, offset: 1}
            ],
            {
                fill: "forwards",
                duration: 1000,
                easing: "ease-out",
                iterations: 1
            }
        )

        rotationBaseDirection = -rotationBaseDirection;
    }

    let pistil = document.createElement("div");
    pistil.classList.add("pistil");
    pistil.style.zIndex = crownNumber + 1;
    pistil.style.height = `${2 * pistilRadius}px`;
    pistil.style.width = `${2 * pistilRadius}px`;
    pistil.style.backgroundColor = pistilBackgroundColor;
    flower.appendChild(pistil);

    // This was all once a simple animation on the whole flower, however, this made the pistil go beneath the petals during the animation on Chrome.

    pistil.animate(
        [
            { transform: `translate(-50%, -50%) scale(0)`},
            { transform: `translate(-50%, -50%) scale(1)`}
        ],
        {
            duration: 1000,
            easing: "ease-out",
            iterations: 1
        }
    )
    
    pistilBorder.animate(
        [
            { transform: `translate(-50%, -50%) scale(0)`},
            { transform: `translate(-50%, -50%) scale(1)`}
        ],
        {
            duration: 1000,
            easing: "ease-out",
            iterations: 1
        }
    )

    crowns.animate(
        [
            { transform: `scale(0)`},
            { transform: `scale(1)`}
        ],
        {
            duration: 1000,
            easing: "ease-out",
            iterations: 1
        }
    )

    /* Play the harp baby */
    let audio = createAudio(harpSounds[getRandomHarpSoundNumber()]);
    audio.play();

}

function resetButtonAction(){
    let flowers = document.getElementsByClassName("flower");
    if(flowers.length == 0){
        resetButton.addEventListener("click", resetButtonAction, {once: true});
    }else{

        // Remove the possibility to create flowers
        appContent.removeEventListener("click", createFlower);
        appContent.classList.remove("cursor-pointer");

        // Animate the reset button
        resetButton.animate(
            [
                { transform: "rotate(0deg)"},
                { transform: "rotate(720deg)"},
            ],
            {
                fill: "forwards",
                duration: resetDuration,
                easing: "ease-in-out",
                iterations: 1,
            }
        )

        // Sound
        
        let notesToBePlayed = harpSounds.length - Math.max(harpSounds.length - flowers.length, 0);

        // notesToBePlayed should never be equal to 0, but just to be sure, let's check
        let durationBetweenNotes = notesToBePlayed == 0 ? 0 : resetDuration / notesToBePlayed;

        if(durationBetweenNotes == 0){
            harpSounds[0].play();
        }else{

            // Play a sound immediately
            let notesPlayed = 0;
            harpSounds[harpSounds.length - 1 - notesPlayed].play();
            notesPlayed++;

            // Play following sounds at an interval
            if(notesPlayed != notesToBePlayed){
                var interval = setInterval(function () {
                    harpSounds[harpSounds.length - 1 - notesPlayed].play();
                    notesPlayed++;
                    if (notesPlayed == notesToBePlayed) {
                        clearInterval(interval);
                    }
                }, durationBetweenNotes);
            }
        }

        // Animate stuff, remove flowers, readd the events
        Array.from(flowers).forEach(flower => {

            // Animate petals
            let petals = flower.getElementsByClassName("petal");

            Array.from(petals).forEach(petal => {
                // Keep the original transformation by storing it first
                petalOriginalTransform = window.getComputedStyle(petal, null).getPropertyValue("transform");

                // Move the petal away and fade it out
                petal.animate(
                [
                    {   
                        opacity: 1,
                        transform: `${petalOriginalTransform}`
                    },
                    {
                        opacity: 0,
                        transform: `${petalOriginalTransform} translateY(-75px)`}
                ],
                {
                    fill: "forwards",
                    easing: "ease-in-out",
                    duration: resetDuration,
                    iterations: 1
                });
            });

            // Animate pistils
            let pistil = flower.getElementsByClassName("pistil")[0];
            let pistilBorder = flower.getElementsByClassName("pistil-border")[0];

            let pistilAnimation = pistil.animate(
                [
                    {
                        opacity: 1,
                        transform: "translate(-50%, -50%) scale(1)",
                    },
                    {
                        opacity: 0,
                        transform: "translate(-50%, -50%) scale(0)"
                    }
                ],
                {
                    duration: resetDuration,
                    easing: "ease-out",
                    iterations: 1
                }
            )

            pistilBorder.animate(
                [
                    {
                        opacity: 1,
                        transform: "translate(-50%, -50%) scale(1)",
                    },
                    {
                        opacity: 0,
                        transform: "translate(-50%, -50%) scale(0)"
                    }
                ],
                {
                    duration: resetDuration,
                    easing: "ease-out",
                    iterations: 1
                }
            )
            
            pistilAnimation.addEventListener("finish", function(){
                flower.parentNode.remove();

                // If all flowers have been removed, reactivate the reset button and the possibility to create flowers
                if(document.getElementsByClassName("flower").length == 0){
                    console.log("hm");
                    resetButton.addEventListener("click", resetButtonAction, {once: true});
                    appContent.addEventListener("click", createFlower);
                    appContent.classList.add("cursor-pointer");
                }
            }); 
            
        });

    }


}

function getPistilColor(){
    let h = Math.random() * 20 + 35;
    let s = Math.random() * 50 + 50;
    let l = Math.random() * 30 + 60;

    return `hsl(${h}, ${s}%, ${l}%)`
}

function getPetalColors(n = 1){
    let h;

    // Prevent colors from being too close to our green background, or too yellow
    do{
        h = Math.random() * 360;
    }while(h <= 140 && h >= 25);
    
    let s = Math.random() * 10 + 50;
    let l = Math.random() * 10 + 60;

    if(Number.isInteger(n) && n >= 1){
        let colors = [];
        for(let i = 0; i < n; i++){
            colors.push(`hsl(${h}, ${s + i * (80 - s) / n}%, ${l + i * (90 - l) / n}%)`)
        }
        return colors;
    }
    return [`hsl(${h}, ${s}%, ${l}%)`];
}

function getPetalNumber(){
    return Math.floor(9 + Math.random() * 6);
}

function getCrownNumber(){
    return Math.floor(2 + Math.random() * 2); 
}

function getMinCrownScaleSize(){
    return 0.5 + Math.random() * 0.5;
}

function getRandomPastelColor(){
    let h = Math.random() * 360;
    let s = Math.random() * 10 + 65;
    let l = Math.random() * 10 + 75;
    
    return `hsl(${h}, ${s}%, ${l}%)`
}

function getFlowerScale(){
    return 0.7 + 0.4 * Math.random();
}


/**
 * Prevents the same note from being played twice in a row
 */

let previousHarpSoundNumber;

function getRandomHarpSoundNumber(){
    let newHarpSoundNumber;

    do{
        newHarpSoundNumber = Math.floor(Math.random() * harpSounds.length);
    }while(previousHarpSoundNumber == newHarpSoundNumber);

    previousHarpSoundNumber = newHarpSoundNumber;

    return newHarpSoundNumber;
}