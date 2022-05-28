
/* Flower wall */

createGardenFlower(85, 8);
createGardenFlower(15, 18);
createGardenFlower(17, 92);
createGardenFlower(79, 83);
createGardenFlower(56, 47);


/**
 * A modification of createFlower from flower-wall.js, in order to easily create flowers in the garden.
 * 
 * @param {Number} offsetX 
 * @param {Number} offsetY 
 */

function createGardenFlower(offsetX, offsetY){

    let gardenBox = document.getElementById("area-tile-background-flower-wall");

    let pistilRadius = 25;
    let petalHeight = 100;
    let petalWidth = 32;
    let flowerSize = 2 * petalHeight + 2 * pistilRadius;

    let flowerScale = getFlowerScale();
    let petalNumber = getPetalNumber();
    let crownNumber = getCrownNumber();

    let pistilBackgroundColor = getPistilColor();
    let petalColors = getPetalColors(crownNumber);

    let flowerBox = document.createElement("div");
    flowerBox.style.position = "absolute";
    flowerBox.style.top = `${offsetY}%`; // Changed to %
    flowerBox.style.left = `${offsetX}%`; // Changed to %
    flowerBox.style.height = `${flowerSize}px`;
    flowerBox.style.width = `${flowerSize}px`;
    flowerBox.style.transform = `translate(-50%, -50%) scale(${flowerScale})`;
    gardenBox.appendChild(flowerBox);
    
    let flower = document.createElement("div");
    flower.classList.add("flower");
    flowerBox.appendChild(flower);
    
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
    
    }

    let pistil = document.createElement("div");
    pistil.classList.add("pistil");
    pistil.style.zIndex = crownNumber + 1;
    pistil.style.height = `${2 * pistilRadius}px`;
    pistil.style.width = `${2 * pistilRadius}px`;
    pistil.style.backgroundColor = pistilBackgroundColor;
    flower.appendChild(pistil);
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

