/* Volume functions */

let audios = [];

let VolumeTypes = {}

class VolumeType {
    constructor(
        type,
        DOMelement,
    ){
        this.type = type;
        this.DOMelement = DOMelement;
    }

    init(){
        this.DOMelement.addEventListener("change", changeVolume.bind(this));
        VolumeTypes[this.type] = this;
    }
}

/**
 * 
 */
class CustomAudio {
    /**
     * 
     * @param {String|HTMLElement} source 
     * @param {String} volumeType 
     * @param {Number} volumeModifier 
     * @param {Boolean} playOnce 
     */
    constructor(
        source,
        volumeType = "master",
        volumeModifiers = {},
        playOnce = true,
        fadeInDuration = 0,
        fadeOutDuration = 0,
    ){
        this.source = source;
        this.volumeType = volumeType;
        this.volumeModifiers = volumeModifiers;
        this.playOnce = playOnce;
        this.audio = undefined;
        this.fadeInDuration = fadeInDuration;
        this.fadeOutDuration = fadeOutDuration;
    }

    init(override = false){
        if(typeof(this.source) == "string"){
            if(override || this.audio == undefined){
                this.audio = new Audio(this.source);
            }
        }else if(this.source instanceof HTMLAudioElement){
            if(override || this.audio == undefined){
                this.audio = this.source.cloneNode();
            }
        }else{
            return undefined;
        }

        if(this.audio){
            if(this.playOnce){
                this.audio.addEventListener("ended", removeAudioFromAudios)
            }

            this.updateVolume();

            if(this.fadeInDuration){
                let remainingDuration = this.fadeInDuration;
                this.volumeModifiers["fadeIn"] = 0;
                let step = 10;
                let volumeIncrease = Math.min(1, step / this.fadeInDuration);

                function fadeInVolume(rD, step, volInc){
                    this.volumeModifiers["fadeIn"] = Math.min(1, this.volumeModifiers["fadeIn"] + volInc);

                    this.updateVolume();

                    if(rD > 0){
                        setInterval(fadeInVolume(rD - step, step, volInc).bind(this), step);
                    }
                }

                fadeInVolume(remainingDuration, step, volumeIncrease).bind(this);
            }
        }

        audios.push(this);
    }

    play(){
        this.audio.play();
    }

    updateVolume(value = undefined, ignoreModifiers = false){

        if(typeof value === "number"){
            this.audio.volume = value;
        }else{
            let volumeTypeValue = 1;

            if(this.volumeType != "master"){
                volumeTypeValue *= VolumeTypes["master"].DOMelement.value / 100;
            }

            for(let key in VolumeTypes){
                if(key == this.volumeType){
                    volumeTypeValue *= VolumeTypes[key].DOMelement.value / 100;
                    break;
                }
            }

            this.audio.volume = volumeTypeValue;
        }

        // Apply modifiers
        if(!ignoreModifiers){
            for(let key in this.volumeModifiers){
                this.audio.volume *= this.volumeModifiers[key];
            }
        }
    }
}

class AudioEmitter{
    constructor(
        DOMElement,
        customAudio,
        center = {x: "50%", y: "50%"},
        maxDistance = "200vw",
    ){
        this.DOMElement = DOMElement;
        this.customAudio = customAudio;
        this.center = center;
        this.maxDistance = maxDistance;
    }

    init(){
        this.customAudio.play();
        this.updateDistanceVolumeModifier(50);
    }

    updateDistanceVolumeModifier(step = 0){
        let centerX = this.center.x.trim();
        let centerY = this.center.y.trim();
        let maxD = this.maxDistance;
        
        // TODO: Proper CSS interpretation

        // Test percentage
        let regexPercentage = /^-{0,1}\d{1,}\.{0,1}\d{0,}%$/;

        if(regexPercentage.exec(centerX)){
            centerX = window.innerWidth * parseFloat(centerX) / 100;
        }

        if(regexPercentage.exec(centerY)){
            centerY = window.innerHeight * parseFloat(centerY) / 100;
        }

        // Test vw / vh

        let regexVW = /^-{0,1}\d{1,}\.{0,1}\d{0,}vw$/;

        if(regexVW.exec(centerX)){
            centerX = window.innerWidth * parseFloat(centerX) / 100;
        }
        if(regexVW.exec(centerY)){
            centerY = window.innerWidth * parseFloat(centerY) / 100;
        }

        if(regexVW.exec(maxD)){
            maxD = window.innerWidth * parseFloat(maxD) / 100;
        }

        let regexVH = /^-{0,1}\d{1,}\.{0,1}\d{0,}vh$/;

        if(regexVH.exec(centerX)){
            centerX = window.innerHeight * parseFloat(centerX) / 100;
        }

        if(regexVH.exec(centerY)){
            centerY = window.innerHeight * parseFloat(centerY) / 100;
        }

        if(regexVW.exec(maxD)){
            maxD = window.innerHeight * parseFloat(maxD) / 100;
        }

        // Test px

        let regexPX = /^-{0,1}\d{1,}\.{0,1}\d{0,}px$/;

        if(regexPX.exec(centerX)){
            centerX = parseFloat(centerX);
        }

        if(regexPX.exec(centerY)){
            centerY = parseFloat(centerY);
        }

        if(regexPX.exec(maxD)){
            maxD = parseFloat(maxD);
        }


        let position = getPositionAtCenter(this.DOMElement);

        let distance = getDistanceBetweenPoints(position.x, centerX, position.y, centerY);

        if(distance >= maxD){
            this.customAudio.volumeModifiers[distance] = 0;
        }else{
            this.customAudio.volumeModifiers[distance] = (1 - distance / maxD);
        }

        if(this.DOMElement && step){
            setInterval(this.updateDistanceVolumeModifier(step), step);
        }
    }
}

/**
 * Change the volume for each element in the audios array.
 */

function changeVolume(){
    let currentVolume = parseInt(this.DOMelement.value, 10) / 100;

    if(this.type != "master"){
        // If not the master volume, we need to get the master volume value to make our volumes properly relative to it
        currentVolume *= parseInt(document.getElementById("volume-master").value, 10) / 100;
        audios.forEach(audio => {
            if(audio.volumeType == this.type){
                audio.updateVolume(currentVolume);
            }
        });
    }else{
        // If master volume, then we need to update every audio to adjust its level based on the master level
        audios.forEach(audio => {
            audio.updateVolume(currentVolume * audio.audio.volume);
        })
    }
}

/**
 * Removes an HTMLAudioElement from the audios array.
 * 
 * @param {Event} event 
 */

function removeAudioFromAudios(event){
    let length = audios.length;

    for(let i = 0; i < length; i++){
        if(audios[i].audio == event.target){
            event.target.remove();
            audios.splice(i,1);
            break;
        }
    }

}
