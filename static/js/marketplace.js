
const creators = [
    {
        id: 1,
        name: "Ananya Sharma",
        category: "Video Editing",
        rating: 4.9,
        budget: 5000,
        available: true,
        skills: ["Video Editing", "Social Media", "Animation"],
        portfolio: "Instagram reels and promotional videos",
        color: "#fce7f3"
    },
    {
        id: 2,
        name: "Rahul Verma",
        category: "Scriptwriting",
        rating: 4.7,
        budget: 3000,
        available: true,
        skills: ["Scriptwriting", "Storytelling", "YouTube"],
        portfolio: "YouTube scripts and brand stories",
        color: "#dbeafe"
    },
    {
        id: 3,
        name: "Priya Reddy",
        category: "Animation",
        rating: 4.8,
        budget: 4500,
        available: false,
        skills: ["Animation", "Motion Graphics", "Video Editing"],
        portfolio: "2D animation and motion graphics",
        color: "#fef3c7"
    },
    {
        id: 4,
        name: "Arjun Kumar",
        category: "Videography",
        rating: 4.6,
        budget: 3500,
        available: true,
        skills: ["Videography", "Video Editing", "Photography"],
        portfolio: "Product videos and short films",
        color: "#dcfce7"
    },
    {
        id: 5,
        name: "Sneha Patel",
        category: "Social Media",
        rating: 4.9,
        budget: 2500,
        available: true,
        skills: ["Social Media", "Content Creation", "Instagram"],
        portfolio: "Social media campaigns and reels",
        color: "#ede9fe"
    },
    {
        id: 6,
        name: "Karthik Rao",
        category: "Video Editing",
        rating: 4.5,
        budget: 2000,
        available: false,
        skills: ["Video Editing", "YouTube", "Color Grading"],
        portfolio: "YouTube videos and cinematic edits",
        color: "#ffedd5"
    }
];

const shortlist = new Set();

const searchInput = document.getElementById("search-input");
const clearSearch = document.getElementById("clear-search");
const categoryFilter = document.getElementById("category-filter");
const ratingFilter = document.getElementById("rating-filter");
const budgetFilter = document.getElementById("budget-filter");
const availableFilter = document.getElementById("available-filter");
const campaignSkills = document.getElementById("campaign-skills");
const sortFilter = document.getElementById("sort-filter");
const resetFilters = document.getElementById("reset-filters");

const creatorGrid = document.getElementById("creator-grid");
const resultCount = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");
const shortlistGrid = document.getElementById("shortlist-grid");
const shortlistCount = document.getElementById("shortlist-count");
const shortlistHeadingCount =
    document.getElementById("shortlist-heading-count");

function getMatchScore(creator) {
    if (!campaignSkills || !campaignSkills.value.trim()) {
        return 0;
    }

    const requestedSkills = campaignSkills.value
        .toLowerCase()
        .split(",")
        .map(skill => skill.trim())
        .filter(Boolean);

    const creatorSkills = creator.skills.map(skill =>
        skill.toLowerCase()
    );

    const matches = requestedSkills.filter(skill =>
        creatorSkills.some(creatorSkill =>
            creatorSkill.includes(skill) || skill.includes(creatorSkill)
        )
    );

    return requestedSkills.length
        ? Math.round((matches.length / requestedSkills.length) * 100)
        : 0;
}

function createCreatorCard(creator) {
    const isSaved = shortlist.has(creator.id);
    const matchScore = getMatchScore(creator);

    return `
        <article class="creator-card">
            <div class="creator-avatar"
                 style="background-color: ${creator.color}">
                ${creator.name.charAt(0)}
            </div>

            <div class="creator-card-content">
                <h3>${creator.name}</h3>

                <p class="creator-category">
                    ${creator.category}
                </p>

                <p class="creator-rating">
                    ⭐ ${creator.rating.toFixed(1)}
                </p>

                <p class="creator-budget">
                    Budget: ₹${creator.budget.toLocaleString("en-IN")}
                </p>

                <p class="creator-availability">
                    ${creator.available
                        ? "Available for projects"
                        : "Currently busy"}
                </p>

                <p class="creator-skills">
                    ${creator.skills.join(" · ")}
                </p>

                <p class="creator-portfolio">
                    ${creator.portfolio}
                </p>

                ${campaignSkills && campaignSkills.value.trim()
                    ? `<p class="match-score">
                           Skill match: ${matchScore}%
                       </p>`
                    : ""}

                <div class="creator-actions">
                    <a href="/creator-profile?id=${creator.id}"
                       class="profile-button">
                        View Profile
                    </a>

                    <button
                        type="button"
                        class="shortlist-button"
                        data-id="${creator.id}">
                        ${isSaved ? "Remove Saved" : "Add to Shortlist"}
                    </button>
                </div>
            </div>
        </article>
    `;
}

function renderCreators() {
    if (!creatorGrid) return;

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const category = categoryFilter
        ? categoryFilter.value
        : "all";

    const minRating = ratingFilter
        ? Number(ratingFilter.value)
        : 0;

    const maxBudget = budgetFilter
        ? Number(budgetFilter.value)
        : 10000;

    const mustBeAvailable = availableFilter
        ? availableFilter.checked
        : false;

    let filteredCreators = creators.filter(creator => {
        const searchableText = [
            creator.name,
            creator.category,
            creator.portfolio,
            ...creator.skills
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(searchTerm);

        const matchesCategory =
            category === "all" ||
            creator.category === category ||
            creator.skills.includes(category);

        const matchesRating = creator.rating >= minRating;
        const matchesBudget = creator.budget <= maxBudget;

        const matchesAvailability =
            !mustBeAvailable || creator.available;

        return matchesSearch &&
            matchesCategory &&
            matchesRating &&
            matchesBudget &&
            matchesAvailability;
    });

    if (sortFilter) {
        switch (sortFilter.value) {
            case "budget-low":
                filteredCreators.sort((a, b) => a.budget - b.budget);
                break;

            case "budget-high":
                filteredCreators.sort((a, b) => b.budget - a.budget);
                break;

            case "rating":
            default:
                filteredCreators.sort((a, b) => b.rating - a.rating);
                break;
        }
    }

    creatorGrid.innerHTML = filteredCreators
        .map(createCreatorCard)
        .join("");

    if (resultCount) {
        resultCount.textContent =
            `${filteredCreators.length} creator(s) found`;
    }

    if (emptyState) {
        emptyState.hidden = filteredCreators.length !== 0;
    }

    renderShortlist();
}

function renderShortlist() {
    if (!shortlistGrid) return;

    const savedCreators = creators.filter(creator =>
        shortlist.has(creator.id)
    );

    shortlistGrid.innerHTML = savedCreators
        .map(createCreatorCard)
        .join("");

    if (shortlistCount) {
        shortlistCount.textContent = shortlist.size;
    }

    if (shortlistHeadingCount) {
        shortlistHeadingCount.textContent = `(${shortlist.size})`;
    }
}

function clearFilters() {
    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "all";
    if (ratingFilter) ratingFilter.value = "0";
    if (budgetFilter) budgetFilter.value = "10000";
    if (availableFilter) availableFilter.checked = false;
    if (campaignSkills) campaignSkills.value = "";
    if (sortFilter) sortFilter.value = "rating";

    renderCreators();
}

if (searchInput) {
    searchInput.addEventListener("input", renderCreators);
}

if (clearSearch) {
    clearSearch.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        renderCreators();
    });
}

if (categoryFilter) {
    categoryFilter.addEventListener("change", renderCreators);
}

if (ratingFilter) {
    ratingFilter.addEventListener("change", renderCreators);
}

if (budgetFilter) {
    budgetFilter.addEventListener("change", renderCreators);
}

if (availableFilter) {
    availableFilter.addEventListener("change", renderCreators);
}

if (campaignSkills) {
    campaignSkills.addEventListener("input", renderCreators);
}

if (sortFilter) {
    sortFilter.addEventListener("change", renderCreators);
}

if (resetFilters) {
    resetFilters.addEventListener("click", clearFilters);
}

document.addEventListener("click", event => {
    const button = event.target.closest(".shortlist-button");

    if (!button) return;

    const creatorId = Number(button.dataset.id);

    if (shortlist.has(creatorId)) {
        shortlist.delete(creatorId);
    } else {
        shortlist.add(creatorId);
    }

    renderCreators();
});

renderCreators();
