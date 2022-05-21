(function(){

    const floodTilesLevelLimit = 100;
    const minTileSize = 16;
    const maxTileSize = 256;

    // Audio files

    const audioBoings = [
            new Audio("../audio/boing1.mp3"), 
            new Audio("../audio/boing2.mp3"), 
            new Audio("../audio/boing3.mp3"), 
            new Audio("../audio/boing4.mp3"), 
            new Audio("../audio/boing5.mp3"), 
        ]
    
    let floodTiles = [];

    document.getElementById("reset-button").addEventListener("click", resetButtonAction, {once: true});

    function resetButtonAction(){

        // Play an animation
        document.getElementById("reset-button").animate(
            [
                { transform: "rotate(0deg)"},
                { transform: "rotate(720deg)"},
            ],
            {
                fill: "forwards",
                duration: 1000,
                easing: "ease-in-out",
                iterations: 1,
            }
        )

        if(floodTiles.length){
            if(floodTiles.length == 1){
                floodTiles.pop().remove();
            }
            else{
                // Remove all flood tiles
                let delay = 1000 / floodTiles.length;

                var interval = setInterval(function(){
                    floodTiles.pop().remove();
                    if(floodTiles.length == 0){
                        clearInterval(interval);
                    }
                }, delay);
            }
        }


        setTimeout(
            function(){ 
                document.getElementById("reset-button").addEventListener("click", resetButtonAction, {
                    once: true,
                });
                document.getElementById("app-content").addEventListener("click", spawnBaseFloodTile, {
                    once: true,
                });
                document.getElementById("app-content").classList.add("cursor-pointer");
            }, 1000);
    }
    class FloodTile{
        /**
         * 
         * @param {HTMLElement} tile 
         */
        constructor(
            tile,
            level,
            X,
            Y,
        ){
            this.tile = tile;
            this.level = level;
            this.X = X;
            this.Y = Y;
            this.audioRemove;
        }

        init(){
            this.tile.addEventListener("click", e => this.spawnFloodTile(e));
            this.audioRemove = new Audio("../audio/plop" + Math.floor(Math.random() * 10 + 1) + ".mp3");
        }

        remove(){
            this.tile.remove();
            this.audioRemove.play();
        }
        /**
         * 
         * @param {Event} e 
         */
        spawnFloodTile(e){
            let offsetX = e.offsetX;
            let offsetY = e.offsetY;

            let spawningTileSize = this.tile.offsetWidth;
            
            // Get the lowest orthogonal distance between the point clicked and any side of the tile
            let minSize = 3 * Math.min(offsetX, offsetY, spawningTileSize - offsetX, spawningTileSize - offsetY);

            // Slightly bigger, in order to prevent tiles from overlapping too much at min size
            minSize += 20;

            // Set minSize to minTileSize if it’s still lower than it
            minSize = Math.max(minSize, minTileSize);

            let maxSize = 1.5 * Math.max(offsetX, offsetY, spawningTileSize - offsetX, spawningTileSize - offsetY);
            
            maxSize -= 20;

            maxSize = Math.min(maxSize, maxTileSize);

            let newTileSize = Math.random() * (maxSize - minSize) + minSize;
            
            // Create a new tile
            let newTile = document.createElement("div");
            newTile.classList.add("flood-tile");
            newTile.style.width = `${newTileSize}px`;
            newTile.style.height = `${newTileSize}px`;
            newTile.style.zIndex = parseInt(window.getComputedStyle(this.tile).getPropertyValue("z-index")) - 1;
            newTile.style.position = "absolute";
            let newOffsetX = this.X - (spawningTileSize / 2 - offsetX);
            let newOffsetY = this.Y - (spawningTileSize / 2 - offsetY);
            newTile.style.top = `calc(50% + ${newOffsetY}px)`;
            newTile.style.left =  `calc(50% + ${newOffsetX}px)`;

            /* 
            // Background-color is randomized based on the spawning tile one, but the deviation gets smaller and smaller with each level
            let initialTileColor = this.tile.style.backgroundColor;
            let matchColors = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
            let match = matchColors.exec(initialTileColor).slice(1);
            let newTileColor = "rgb(" + match.map(color => Math.min(255, Math.max(0, (Math.random() - 1) * (1 / (this.level + 1)) * 128 + parseInt(color))) ).join(",") +")";
            */
            newTile.style.backgroundColor = getRandomPastelColor();

            this.tile.parentNode.appendChild(newTile);

            // Play the sound for the animation
            let audio = new Audio("../audio/boing" + Math.floor(Math.random() * 5 + 1) + ".mp3");
            audio.play();
            
            let newFloodTile = new FloodTile(newTile, this.level + 1, newOffsetX, newOffsetY);
            newFloodTile.init();

            floodTiles.push(newFloodTile);
        }
    }

    /* Init */

    /* Random background-color for base-tile */

    /**
     * 
     * @param {Event} e 
     */
    function spawnBaseFloodTile(){
        console.log("oy");
        let baseTile = document.createElement("div");
        baseTile.id = "base-tile";
        baseTile.classList.add("flood-tile");
        let color = getRandomPastelColor();
        console.log(color);
        baseTile.style.backgroundColor = color;
        document.getElementById("app-content").appendChild(baseTile);
        document.getElementById("app-content").classList.remove("cursor-pointer");
        baseFloodTile = new FloodTile(baseTile, 0, 0, 0);
        baseFloodTile.init();
        audioBoings[0].play();
        floodTiles.push(baseFloodTile);
    }

    function getRandomPastelColor(){
        let h = Math.random() * 360;
        let s = Math.random() * 10 + 65;
        let l = Math.random() * 10 + 75;
        
        return `hsl(${h}, ${s}%, ${l}%)`
    }

    document.getElementById("app-content").addEventListener("click", spawnBaseFloodTile, {
        once: true,
    });

})();