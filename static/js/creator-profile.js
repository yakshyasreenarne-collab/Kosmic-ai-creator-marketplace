

const savedCreator = sessionStorage.getItem("selectedCreator");

if (savedCreator) {
    const creator = JSON.parse(savedCreator);

    document.getElementById("creatorName").textContent = creator.name;
    document.getElementById("creatorCategory").textContent =
        creator.category + " Creator";
    document.getElementById("creatorAvatar").textContent = creator.icon;
    document.getElementById("creatorLocation").textContent = "Creator Marketplace";
    document.getElementById("creatorRating").textContent = creator.rating;
    document.getElementById("creatorBio").textContent = creator.bio;
    document.getElementById("creatorPrice").textContent =
        "₹" + creator.price.toLocaleString("en-IN");
    document.getElementById("creatorAvailability").textContent =
        creator.availability;
    document.getElementById("creatorCommercial").textContent =
        creator.commercial ? "Yes" : "Please discuss";

    const skillsContainer = document.getElementById("creatorSkills");
    skillsContainer.replaceChildren();

    creator.skills.forEach(skill => {
        const tag = document.createElement("span");
        tag.textContent = skill;
        skillsContainer.appendChild(tag);
    });
}

