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
        playOnce = true,
        loop = false,
    ){
        this.source = source;
        this.volumeType = volumeType;
        this.volumeModifiers = {};
        this.playOnce = playOnce;
        this.loop = loop;
        this.audio = undefined;
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
                this.audio.addEventListener("ended", function(e){
                    removeAudioFromAudios(e.target);
                })
            }

            this.audio.loop = this.loop;

            this.updateVolume();
        }

        audios.push(this);
    }

    play(){
        this.audio.play();
    }

    fade(remainingDuration, step, isFadeIn = true){

        let volumeChange = step / remainingDuration;

        if(isFadeIn){
            this.volumeModifiers["fadeIn"] = 0;
        }else{
            this.volumeModifiers["fadeOut"] = 1;
        }

        function internalFade(remainingDuration, step, volumeChange, isFadeIn){
            if(isFadeIn){
                this.volumeModifiers["fadeIn"] = Math.min(1, this.volumeModifiers["fadeIn"] + volumeChange);
            }else{
                this.volumeModifiers["fadeOut"] = Math.max(0, this.volumeModifiers["fadeOut"] - volumeChange);
            }

            this.updateVolume();

            if(remainingDuration > 0){
                setTimeout(internalFade.bind(this, remainingDuration - step, step, volumeChange, isFadeIn), step);
            }
        }

        internalFade.bind(this, remainingDuration, step, volumeChange, isFadeIn)();
        
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

    remove(){
        removeAudioFromAudios(this);
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

    remove(removeDOMElement = false){
        this.customAudio.remove();
        if(removeDOMElement){
            this.DOMElement.remove();
        }
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
            this.customAudio.volumeModifiers["distance"] = 0;
        }else{
            this.customAudio.volumeModifiers["distance"] = (1 - distance / maxD);
        }

        this.customAudio.updateVolume();

        if(this.DOMElement.parentNode && step){
            setTimeout(this.updateDistanceVolumeModifier.bind(this, step), step);
        }
    }
}

/**
 * Change the volume for each element in the audios array.
 */

function changeVolume(){
    if(this.type != "master"){
        // Only update relevant audios
        audios.forEach(audio => {
            if(audio.volumeType == this.type){
                audio.updateVolume();
            }
        });
    }else{
        // Need to update all audios
        audios.forEach(audio => {
            audio.updateVolume();
        })
    }
}

/**
 * Removes a CustomAudio from the audios array.
 * 
 * @param {CustomAudio} customAudio
 */

function removeAudioFromAudios(customAudio){
    let length = audios.length;

    for(let i = 0; i < length; i++){
        if(audios[i] == customAudio){
            customAudio.audio.remove(); // This does not really remove the Audio element. It still exists. Outside of the document, just there. WHY.
            customAudio.audio.pause();
            audios.splice(i,1);
            break;
        }
    }

}
