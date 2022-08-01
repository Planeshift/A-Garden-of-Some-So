class Achievement {
    constructor(
        title,
        desc,
        icon,
        iconType = "emoji",
        showSecretIcon = true,
        secret = true,
    ) {
        this.title = title;
        this.desc = desc;
        this.icon = icon;
        this.iconType = iconType;
        this.showSecretIcon = showSecretIcon;
        this.secret = secret;
        this.checked = false;
        this.achievementDOMElement;
    }

    check(){
        this.checked = true;

        if(this.achievementDOMElement){
            let newAchievementContainer = createAchievementContainer(this);
            let achievementsContainer = document.getElementById("achievements-container");
            achievementsContainer.insertBefore(newAchievementContainer, this.achievementDOMElement);
            this.achievementDOMElement.remove();
            this.achievementDOMElement = newAchievementContainer;
        }

        
    }

    isChecked(){
        return this.checked;
    }

    popUp(targetNode){
        // Create the popup
        let achievementPopUp = document.createElement("div");
        achievementPopUp.classList.add("achievement-pop-up");

        let achievementContainer = createAchievementContainer(this);

        achievementPopUp.appendChild(achievementContainer);

        targetNode.appendChild(achievementPopUp);

        let previousTransform = window.getComputedStyle(achievementPopUp, null).getPropertyValue("transform");

        // Animate the popup over 5 seconds.
        let popUpAnimation = achievementPopUp.animate(
            [{
                offset: 0,
                transform: `${previousTransform} translateY(0)`,
            },
            {
                offset: 0.2,
                transform: `${previousTransform} translateY( calc(-100% - 1rem))`,
            },
            {
                offset: 0.8,
                opacity: 1,
                transform: `${previousTransform} translateY( calc(-100% - 1rem))`,
            },
            {
                offset: 1,
                opacity: 0,
                transform: `${previousTransform} translateY( calc(-100% - 1rem))`,
            }
            ],
            {
                duration: 5000,
                fill: "forwards",
                easing: "linear",
                iterations: 1,
            }
        );

        // Remove the popup once the animation is done.
        popUpAnimation.addEventListener("finish", function(){
            achievementPopUp.remove();
        });

        // Remove the achievement popup if clicked, for now. Maybe add a close button later on.
        // TODO: Something.
        /* achievementPopUp.addEventListener("click", function(){
            achievementPopUp.remove();
        }) */
    }
}

function populateAchievements(achievements) {
    let achievementsContainer = document.getElementById("achievements-container");

    if (achievementsContainer) {
        for (let key in achievements) {
            let achievement = achievements[key];

            // Create the achievement div and all its content
            let achievementContainer = createAchievementContainer(achievement);

            // Add it to the list on the DOM
            achievementsContainer.appendChild(achievementContainer);

            // Store the reference to the container inside the achievement object for further updates
            achievement.achievementDOMElement = achievementContainer;
        }
    }else{
        console.log("Could not find the achievements container!");
    }
}

function createAchievementContainer(achievement){

    // Create the container
    let achievementContainer = document.createElement("div");
    achievementContainer.classList.add("achievement-container");

    // If checked, add a class to change the theming
    if(achievement.checked){
        achievementContainer.classList.add("achievement-checked");
    }

    // Create the icon div
    let achievementIcon = document.createElement("div");
    achievementIcon.classList.add("achievement-icon");

    // Create the title div
    let achievementTitle = document.createElement("div");
    achievementTitle.classList.add("achievement-title");

    // Create the achievements div
    let achievementDesc = document.createElement("div");
    achievementDesc.classList.add("achievement-desc");

    // Append them to the container
    achievementContainer.appendChild(achievementIcon);
    achievementContainer.appendChild(achievementTitle);
    achievementContainer.appendChild(achievementDesc);

    // Text

    // Add the text by default
    achievementTitle.textContent = achievement.title;
    achievementDesc.textContent = achievement.desc;

    // If the achievement is not checked and is a secret, hide the information instead
    if (!achievement.checked && achievement.secret) {
        achievementTitle.textContent = "???";
        achievementDesc.textContent = "This achievement will only be revealed once done!";
    }

    // Icon

    // If the icon should remain a secret even when unchecked, put a ? as the icon
    if(!achievement.showSecretIcon && !achievement.checked){

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add("achievement-unknown-icon");
        svg.setAttribute("viewBox", "0 0 100 100");

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M 21.00,33.00 C 21.00,33.00 30.00,35.00 30.00,35.00 31.62,28.11 34.51,21.96 41.00,18.41 52.20,12.29 65.30,19.89 66.63,30.00 68.32,42.85 51.60,47.95 46.64,53.45 42.10,58.49 42.31,67.56 42.36,73.93 44.35,73.93 50.26,73.96 51.42,73.96 51.49,73.83 51.09,66.02 55.23,59.21 57.69,55.69 63.52,53.98 67.00,51.39 74.60,45.74 78.38,39.54 77.96,30.00 77.05,9.13 51.24,2.24 35.00,10.38 26.04,14.86 21.81,23.35 21.00,33.00 Z M 41.00,83.00 C 41.00,83.00 41.00,95.00 41.00,95.00 41.00,95.00 54.00,95.00 54.00,95.00 54.00,95.00 54.00,83.00 54.00,83.00 54.00,83.00 41.00,83.00 41.00,83.00 Z");

        achievementIcon.appendChild(svg);
        svg.appendChild(path);
    }else{
        // Otherwise, consider the different icon types and show the icon
        switch (achievement.iconType) {
            case "emoji":

                let emoji = document.createElement("div");
                emoji.textContent = achievement.icon;
                emoji.classList.add("emoji-icon");
                achievementIcon.appendChild(emoji);

                // If unchecked, mask it
                if (!achievement.checked) {
                    emoji.classList.add("black-emoji");
                }
                break;

                /*
                Only worked on Firefoy, sadly. (Text-shadow + fill transparent on a text svg element did not work on Chrome)

                let emojiSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                emojiSvg.classList.add("emoji");
                emojiSvg.setAttribute("viewBox", "0 0 25 25"); // Magic baby

                let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.textContent = achievement.icon;
                text.setAttribute("x", "0");
                text.setAttribute("y", "80%"); // Magic number

                emojiSvg.appendChild(text);

                // If unchecked, mask it
                if (!achievement.checked) {
                    emojiSvg.classList.add("black-emoji");
                }

                achievementIcon.appendChild(emojiSvg);
                break;

                */

            case "image":
                let img = document.createElement("img");
                img.src = achievement.icon;
                achievementIcon.appendChild(img);
                break;

            default:
                let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.classList.add("achievement-unknown-icon");
                svg.setAttribute("viewBox", "0 0 100 100");

                let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", "M 21.00,33.00 C 21.00,33.00 30.00,35.00 30.00,35.00 31.62,28.11 34.51,21.96 41.00,18.41 52.20,12.29 65.30,19.89 66.63,30.00 68.32,42.85 51.60,47.95 46.64,53.45 42.10,58.49 42.31,67.56 42.36,73.93 44.35,73.93 50.26,73.96 51.42,73.96 51.49,73.83 51.09,66.02 55.23,59.21 57.69,55.69 63.52,53.98 67.00,51.39 74.60,45.74 78.38,39.54 77.96,30.00 77.05,9.13 51.24,2.24 35.00,10.38 26.04,14.86 21.81,23.35 21.00,33.00 Z M 41.00,83.00 C 41.00,83.00 41.00,95.00 41.00,95.00 41.00,95.00 54.00,95.00 54.00,95.00 54.00,95.00 54.00,83.00 54.00,83.00 54.00,83.00 41.00,83.00 41.00,83.00 Z");

                achievementIcon.appendChild(svg);
                svg.appendChild(path);
                break;
        }
    }


    return achievementContainer;
}