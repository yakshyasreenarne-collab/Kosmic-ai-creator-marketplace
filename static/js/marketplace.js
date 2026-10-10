

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
    budget: 7000,
    available: false,
    skills: ["Animation", "Video Editing", "Motion Graphics"],
    portfolio: "2D animations and motion graphics",
    color: "#fef3c7"
  },
  {
    id: 4,
    name: "Arjun Kumar",
    category: "Videography",
    rating: 4.6,
    budget: 6000,
    available: true,
    skills: ["Videography", "Video Editing", "Photography"],
    portfolio: "Product shoots and event films",
    color: "#dcfce7"
  },
  {
    id: 5,
    name: "Sneha Patel",
    category: "Video Editing",
    rating: 4.5,
    budget: 2500,
    available: true,
    skills: ["Video Editing", "Reels", "Social Media"],
    portfolio: "Short-form videos and reels",
    color: "#ede9fe"
  },
  {
    id: 6,
    name: "Karthik Rao",
    category: "Scriptwriting",
    rating: 4.9,
    budget: 4500,
    available: true,
    skills: ["Scriptwriting", "Storytelling", "Advertising"],
    portfolio: "Ad scripts and campaign concepts",
    color: "#ffe4e6"
  }
];

const searchInput = document.getElementById("search-input");
const clearSearch = document.getElementById("clear-search");
const categoryFilter = document.getElementById("category-filter");
const ratingFilter = document.getElementById("rating-filter");
const budgetFilter = document.getElementById("budget-filter");
const availableFilter = document.getElementById("available-filter");
const sortFilter = document.getElementById("sort-filter");
const campaignSkills = document.getElementById("campaign-skills");
const resetButton = document.getElementById("reset-filters");
const creatorGrid = document.getElementById("creator-grid");
const resultCount = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");
const shortlistGrid = document.getElementById("shortlist-grid");
const shortlistCount = document.getElementById("shortlist-count");
const headingCount = document.getElementById("shortlist-heading-count");


const favorites = new Set();



function calculateMatchScore(creator) {
    console.log("Campaign skills:", campaignSkills?.value, "Creator:", creator.name, "Skills:", creator.skills);
  if (!campaignSkills || !campaignSkills.value.trim()) {
    return null;
  }

  const requestedSkills = campaignSkills.value
    .split(",")
    .map(skill => skill.trim().toLowerCase())
    .filter(Boolean);

  const creatorSkills = creator.skills.map(skill =>
    skill.trim().toLowerCase()
  );

  const matchedCount = requestedSkills.filter(skill =>
    creatorSkills.includes(skill)
  ).length;

  return Math.round(
    (matchedCount / requestedSkills.length) * 100
  );
}




function getFilteredCreators() {
  let results = creators.filter(creator => {
    const search = searchInput?.value.toLowerCase().trim() || "";
    const category = categoryFilter?.value || "";
    const minRating = Number(ratingFilter?.value || 0);
    const maxBudget = Number(budgetFilter?.value || Infinity);
    const availableOnly = availableFilter?.checked || false;

    const matchesSearch =
      `${creator.name} ${creator.category} ${creator.skills.join(" ")}`
        .toLowerCase()
        .includes(search);

    const matchesCategory =
      !category || category === "all" || creator.category === category;

    const matchesRating = creator.rating >= minRating;
    const matchesBudget = creator.budget <= maxBudget;
    const matchesAvailability = !availableOnly || creator.available;

    return matchesSearch && matchesCategory &&
      matchesRating && matchesBudget && matchesAvailability;
  });

  if (sortFilter?.value === "rating") {
  results.sort((a, b) => b.rating - a.rating);
} else if (sortFilter?.value === "budget-low") {
  results.sort((a, b) => a.budget - b.budget);
} else if (sortFilter?.value === "budget-high") {
  results.sort((a, b) => b.budget - a.budget);
}

  return results;
}

function renderCreators() {
  if (!creatorGrid) {
    console.error("Creator grid was not found in marketplace.html");
    return;
  }

  const results = getFilteredCreators();
  creatorGrid.innerHTML = "";

  results.forEach(creator => {
    const score = calculateMatchScore(creator);
    const card = document.createElement("article");
    card.className = "creator-card";

    card.innerHTML = `
      <div class="creator-avatar" style="background:${creator.color}">
        ${creator.name.split(" ").map(part => part[0]).join("")}
      </div>
      <div class="creator-card-content">
        <h3>${creator.name}</h3>
        <p class="creator-category">${creator.category}</p>
        <p>⭐ ${creator.rating} / 5</p>
        <p>Starting budget: ₹${creator.budget.toLocaleString("en-IN")}</p>
        <p>${creator.available ? "🟢 Available" : "⚪ Currently unavailable"}</p>
        <p class="creator-portfolio">${creator.portfolio}</p>
        <p class="match-score">Skill match: ${score ?? 0}%</p>
        <div class="creator-actions">
          <button type="button" class="favorite-button">
            ${favorites.has(creator.id) ? "♥ Saved" : "♡ Shortlist"}
          </button>
          <button type="button" class="profile-button">View profile</button>
        </div>
      </div>
    `;

    card.querySelector(".favorite-button").addEventListener("click", () => {
      if (favorites.has(creator.id)) {
        favorites.delete(creator.id);
      } else {
        favorites.add(creator.id);
      }
      renderCreators();
      renderShortlist();
    });

    card.querySelector(".profile-button").addEventListener("click", () => {
      window.location.href = `/creator-profile?id=${creator.id}`;
    });

    creatorGrid.appendChild(card);
  });

  if (resultCount) {
    resultCount.textContent = `${results.length} creator${results.length === 1 ? "" : "s"} found`;
  }

  if (emptyState) {
    emptyState.hidden = results.length !== 0;
  }
}

function renderShortlist() {
  if (!shortlistGrid) return;

  shortlistGrid.innerHTML = "";

  creators.filter(creator => favorites.has(creator.id)).forEach(creator => {
    const item = document.createElement("div");
    item.className = "shortlist-item";
    item.textContent = `${creator.name} — ${creator.category}`;
    shortlistGrid.appendChild(item);
  });

  if (shortlistCount) shortlistCount.textContent = favorites.size;
  if (headingCount) headingCount.textContent = favorites.size;
}

[
  searchInput,
  categoryFilter,
  ratingFilter,
  budgetFilter,
  availableFilter,
  sortFilter,
  campaignSkills
].forEach(control => {
  if (control) {
    control.addEventListener("input", renderCreators);
    control.addEventListener("change", renderCreators);
  }
});

if (resetButton) {
  resetButton.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "";
    if (ratingFilter) ratingFilter.value = "0";
    if (budgetFilter) budgetFilter.value = "";
    if (availableFilter) availableFilter.checked = false;
    if (sortFilter) sortFilter.value = "";
    if (campaignSkills) campaignSkills.value = "";
    renderCreators();
  });
}
if (clearSearch) {
  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    renderCreators();
  });
}

renderCreators();
renderShortlist();

const creators = [
    {name:"Aarav Mehta", category:"Video", skills:["Video Editing","Motion Graphics"], tools:["Premiere Pro","After Effects"], price:3500, rating:4.9, availability:"Available", commercial:true, bio:"Creates engaging reels, YouTube videos and motion graphics.", icon:"🎬"},
    {name:"Diya Reddy", category:"Design", skills:["Graphic Design","Social Media"], tools:["Canva","Photoshop"], price:2200, rating:4.8, availability:"Available", commercial:true, bio:"Designs brand kits, posters and social media creatives.", icon:"🎨"},
    {name:"Ishaan Varma", category:"AI", skills:["AI Art","Prompt Engineering"], tools:["Midjourney","ChatGPT"], price:4800, rating:5.0, availability:"Available", commercial:true, bio:"Creates imaginative AI visuals and concept art.", icon:"✨"},
    {name:"Maya Srinivas", category:"Social", skills:["Social Media","Copywriting"], tools:["Canva","ChatGPT"], price:2800, rating:4.7, availability:"Busy", commercial:true, bio:"Plans content calendars and social media campaigns.", icon:"📱"},
    {name:"Rohan Kapoor", category:"Design", skills:["UI/UX Design","Graphic Design"], tools:["Figma","Photoshop"], price:6000, rating:4.9, availability:"Available", commercial:false, bio:"Designs modern websites and easy-to-use interfaces.", icon:"💻"},
    {name:"Sana Khan", category:"Writing", skills:["Copywriting","Prompt Engineering"], tools:["ChatGPT","Canva"], price:1800, rating:4.8, availability:"Available", commercial:true, bio:"Writes website copy, blog outlines and product descriptions.", icon:"✍️"}
];

let selectedCategory = "All";

function renderCreators() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    const skill = document.getElementById("skillFilter").value;
    const availability = document.getElementById("availabilityFilter").value;
    const budget = Number(document.getElementById("budgetFilter").value);
    const commercial = document.getElementById("commercialFilter").checked;

    const filtered = creators.filter(c => {
        const searchable = [c.name, c.category, c.bio, ...c.skills, ...c.tools].join(" ").toLowerCase();
        return searchable.includes(query)
            && (selectedCategory === "All" || c.category === selectedCategory)
            && (!skill || c.skills.includes(skill))
            && (!availability || c.availability === availability)
            && c.price <= budget
            && (!commercial || c.commercial);
    });

    document.getElementById("count").textContent = filtered.length;
    const grid = document.getElementById("creatorGrid");

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty">No creators found. Try changing your search or filters.</div>';
        return;
    }

    grid.innerHTML = filtered.map(c => `
        <article class="creator-card">
            <div class="cover">${c.icon}</div>
            <div class="creator-info">
                <h3>${c.name} <span style="color:#b69aff">✦</span></h3>
                <p class="muted">${c.category} creator · ${c.availability}</p>
                <p class="muted">${c.bio}</p>
                <div>${c.skills.map(s => `<span class="tag">${s}</span>`).join("")}</div>
                <p class="muted">★ ${c.rating} · Tools: ${c.tools.join(", ")}</p>
                <div class="price">₹${c.price.toLocaleString("en-IN")} / project</div>
                <button class="view" onclick="viewProfile('${c.name}')">View Profile ↗</button>
            </div>
        </article>
    `).join("");
}

function setCategory(category) {
    selectedCategory = category;
    renderCreators();
}

function clearFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("skillFilter").value = "";
    document.getElementById("availabilityFilter").value = "";
    document.getElementById("budgetFilter").value = "10000";
    document.getElementById("budgetValue").textContent = "10000";
    document.getElementById("commercialFilter").checked = false;
    selectedCategory = "All";
    renderCreators();
}


function viewProfile(name) {
    const creator = creators.find(c => c.name === name);

    if (creator) {
        sessionStorage.setItem("selectedCreator", JSON.stringify(creator));
        window.location.href = "/creator-profile";
    }
}


document.getElementById("searchInput").addEventListener("input", renderCreators);
renderCreators();
