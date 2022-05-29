/* Volume functions */

let audios = [];

let volumeRange = document.getElementById("volume-range");

if(volumeRange){
    volumeRange.addEventListener("change", changeVolume);
}

/**
 * Gets the current volume from volume-range (expecting a value between 0 and 100)
 * @returns {Number} A value between 0 and 1.
 */

 function getCurrentVolume(){
    return parseInt(document.getElementById("volume-range").value) / 100;
}

/**
 * Change the volume for each element in the audios array.
 */

function changeVolume(){
    let currentVolume = getCurrentVolume();
    audios.forEach(audio => audio.volume = currentVolume);
}

/**
 * Creates an HTMLAudioElement and adds it to the audios array.
 * 
 * @param {String|HTMLAudioElement} src Either the src of the audio file, or another HTMLAudioElement that this element will be a copy of.
 * @param {Boolean=true} playOnce Optional. If set to true, the audio will be automatically removed from the audios array. Default to true.
 * @param {Boolean=true} applyCurrentVolume Optional. If set to true, will get the current volume level and apply it to the audio. Default to true.
 * @returns Either the HTMLAudioElement with the given src or a copy of the src, or undefined.
 */

function createAudio(src, playOnce = true, applyCurrentVolume = true){
    let audio;
    if(typeof(src) == "string"){
        audio = new Audio(src);
    }else if(src instanceof HTMLAudioElement){
        audio = src.cloneNode();
    }else{
        return undefined;
    }
    audios.push(audio);

    if(playOnce){
        audio.addEventListener("ended", removeAudioFromAudios)
    }

    if(applyCurrentVolume){
        audio.volume = getCurrentVolume();
    }

    return audio;
}

/**
 * Removes an HTMLAudioElement from the audios array.
 * 
 * @param {Event} event 
 */

function removeAudioFromAudios(event){
    console.log(audios);
    audios = audios.filter(audio => audio != event.target);
    console.log(audios);
}