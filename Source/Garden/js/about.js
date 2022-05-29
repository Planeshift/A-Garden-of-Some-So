// Just to obfuscate the email a bit

document.getElementById("email-button").addEventListener("click", function(e){
    let parent = e.target.parentNode;

    let mail = "agardenofsomesort";
    let domain = "gmail.com";

    let link = document.createElement("a");
    link.classList.add("link");
    link.href = "mailto:" + mail + "@" + domain;
    link.innerText = mail + "@" + domain;
    parent.appendChild(link);
    e.target.remove();
});