const form = document.getElementById("briefForm");
const savedBriefs = document.getElementById("savedBriefs");
let editingIndex = null;

let briefs = JSON.parse(localStorage.getItem("kosmicBriefs") || "[]");

function displayBriefs() {
    savedBriefs.innerHTML = "";
    // Read search and status filter values
const searchInput = document.getElementById("searchBriefs");
const statusFilter = document.getElementById("statusFilter");

const searchTerm = searchInput.value.trim().toLowerCase();
const selectedStatus = statusFilter.value;

// Filter briefs
const filteredBriefs = briefs.filter(brief => {
    const matchesSearch =
        brief.title.toLowerCase().includes(searchTerm) ||
        brief.brand.toLowerCase().includes(searchTerm);

    const matchesStatus =
        selectedStatus === "All" ||
        (brief.status || "Draft") === selectedStatus;

    return matchesSearch && matchesStatus;
});

// Show a message if nothing matches
document.getElementById("noBriefsMessage").hidden =
    filteredBriefs.length > 0;
        // Update dashboard statistics
    document.getElementById("totalBriefs").textContent = briefs.length;

    document.getElementById("draftBriefs").textContent =
        briefs.filter(brief => (brief.status || "Draft") === "Draft").length;

    document.getElementById("completedBriefs").textContent =
        briefs.filter(brief => brief.status === "Completed").length;
    filteredBriefs.forEach(brief => {
    const index = briefs.indexOf(brief);
        const card = document.createElement("div");

        const title = document.createElement("h4");
        title.textContent = brief.title;

        const details = document.createElement("p");
        details.textContent =
            `${brief.brand} | ${brief.type} | ${brief.style || "Style not specified"}`;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editBrief(index);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.style.background = "#d9435f";
        deleteButton.style.marginLeft = "10px";

        deleteButton.onclick = () => {
            const confirmDelete = confirm(
                `Are you sure you want to delete "${brief.title}"?`
    );

    if (confirmDelete) {
        briefs.splice(index, 1);
        saveToStorage();
        displayBriefs();
    }
};

        const status = document.createElement("select");

        ["Draft", "Published", "In progress", "Completed"]
            .forEach(value => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                status.appendChild(option);
            });

        status.value = brief.status || "Draft";

        status.onchange = () => {
            briefs[index].status = status.value;
            saveToStorage();
            displayBriefs();
        };

        card.append(title, details, status, editButton, deleteButton);
        savedBriefs.appendChild(card);
    });
}

function saveToStorage() {
    localStorage.setItem("kosmicBriefs", JSON.stringify(briefs));
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const brandName = document.getElementById("brandName").value.trim();
    const campaignTitle = document.getElementById("campaignTitle").value.trim();
    const description = document.getElementById("description").value.trim();
    const contentType = document.getElementById("contentType").value;
    const budget = document.getElementById("budget").value;

    // Validate required fields
    if (!brandName || !campaignTitle || !description || !contentType) {
        alert("Please fill in all required fields.");
        return;
    }

    // Validate budget
    if (budget !== "" && (!Number.isFinite(Number(budget)) || Number(budget) < 0)) {
        alert("Please enter a valid, non-negative budget.");
        return;
    }

    // Remember whether this is a new brief or an update
    const isEditing = editingIndex !== null;

    const brief = {
        brand: brandName,
        title: campaignTitle,
        description: description,
        type: contentType,
        style: document.getElementById("creativeStyle").value.trim(),
        aspect: document.getElementById("aspectRatio").value,
        budget: budget,
        commercialUse: document.getElementById("commercialUse").checked,
        status: isEditing
            ? (briefs[editingIndex].status || "Draft")
            : "Draft"
    };

    // Save or update the brief
    if (isEditing) {
        briefs[editingIndex] = brief;
        editingIndex = null;

        form.querySelector('button[type="submit"]').textContent = "Save Brief";
    } else {
        briefs.push(brief);
    }

    saveToStorage();
    displayBriefs();
    form.reset();

    // Show the correct confirmation
    alert(
        isEditing
            ? "Creative brief updated successfully!"
            : "Creative brief saved successfully!"
    );
});

function editBrief(index) {
    const brief = briefs[index];

    document.getElementById("brandName").value = brief.brand;
    document.getElementById("campaignTitle").value = brief.title;
    document.getElementById("description").value = brief.description;
    document.getElementById("contentType").value = brief.type;
    document.getElementById("creativeStyle").value = brief.style;
    document.getElementById("aspectRatio").value = brief.aspect;
    document.getElementById("budget").value = brief.budget;
    document.getElementById("commercialUse").checked = brief.commercialUse;

    editingIndex = index;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = "Update Brief";

    form.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}
document.getElementById("generateButton").addEventListener("click", function() {
    const idea = document.getElementById("roughIdea").value.trim();
    const message = document.getElementById("aiMessage");

    if (!idea) {
        message.textContent = "Please enter your creative idea first.";
        return;
    }

    document.getElementById("description").value = idea;

    if (/animation|animated/i.test(idea)) {
        document.getElementById("contentType").value = "Animation";
    } else if (/image|poster|graphic/i.test(idea)) {
        document.getElementById("contentType").value = "Image / Graphics";
    } else {
        document.getElementById("contentType").value = "Video";
        }

    if (/cinematic/i.test(idea)) {
        document.getElementById("creativeStyle").value = "Cinematic";
    }

    message.textContent =
        "Template suggestions added. Review and edit them before saving.";
});

// Search and status filter
document.getElementById("searchBriefs")
    .addEventListener("input", displayBriefs);

document.getElementById("statusFilter")
    .addEventListener("change", displayBriefs);

// Load briefs when the page opens
displayBriefs();