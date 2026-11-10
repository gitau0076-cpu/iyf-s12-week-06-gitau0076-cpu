// Task 12.1: Fetch API basics
// Exercise 1: My first fetch
fetch("https://jsonplaceholder.typicode.com/users/1")
    .then(response => {
        console.log("Response object:", response);
        console.log("Status:", response.status);
        console.log("OK:", response.ok);
        return response.json();  // Parse JSON
    })
    .then(data => {
        console.log("User data:", data);
    })
    .catch(error => {
        console.error("Fetch error:", error);
    });
  // Exercise 2: Fetch with Async/Await
async function fetchUserData(userId) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched user data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;  // Re-throw if needed
    }
}
// Use it — inside an async function. A top-level `await` only works in the
// DevTools Console or a <script type="module">; in a normal script file it is a SyntaxError.
async function main() {
    const user = await fetchUserData(1);
    console.log(user);
}
main();


// Task 12.2: Display API data in the DOM
const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const container = document.getElementById("users-container");
const results = document.getElementById("results");
const searchInput = document.getElementById("search");
const nameSort = document.getElementById("name-sort");
const cityFilter = document.getElementById("city-filter");
const usersCount = document.getElementById("users-count");
let allUsers = [];

async function loadUsers() {
    try {
        showLoading();

        const [user, users, posts] = await Promise.all([
            fetchUserData(1),
            fetchCollection("https://jsonplaceholder.typicode.com/users"),
            fetchCollection("https://jsonplaceholder.typicode.com/users/1/posts")
        ]);

        allUsers = users;
        populateCityFilter(users);
        displaySingleUser(user);
        applyUserFilters();
        displayPosts(posts);
        results.hidden = false;
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function showLoading() {
    loading.classList.remove("hidden");
    errorDiv.classList.add("hidden");
    results.hidden = true;
    container.replaceChildren();
    document.getElementById("posts-list").replaceChildren();
}

function hideLoading() {
    loading.classList.add("hidden");
}

function showError(message) {
    errorDiv.textContent = `Error: ${message}`;
    errorDiv.classList.remove("hidden");
}

async function fetchCollection(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

function displaySingleUser(user) {
    const card = document.getElementById("single-user");
    const name = document.createElement("h3");
    name.textContent = user.name;
    const username = document.createElement("p");
    username.textContent = `@${user.username}`;
    const email = document.createElement("p");
    email.textContent = user.email;
    const company = document.createElement("p");
    company.className = "company";
    company.textContent = user.company.name;
    card.replaceChildren(name, username, email, company);
}

function displayUsers(users) {
    const cards = users.map(user => {
        const card = document.createElement("article");
        card.className = "user-card";

        const name = document.createElement("h2");
        name.textContent = user.name;
        const username = document.createElement("p");
        username.className = "username";
        username.textContent = `@${user.username}`;
        const email = document.createElement("p");
        email.textContent = user.email;
        const company = document.createElement("p");
        company.className = "company";
        company.textContent = user.company.name;

        card.append(name, username, email, company);
        return card;
    });
    container.replaceChildren(...cards);
}

function displayPosts(posts) {
    const list = document.getElementById("posts-list");
    const items = posts.map(post => {
        const item = document.createElement("li");
        const title = document.createElement("h3");
        title.textContent = post.title;
        const body = document.createElement("p");
        body.textContent = post.body;
        item.append(title, body);
        return item;
    });
    list.replaceChildren(...items);
}

// Task 12.3: Post Request

// Exercise: Creating Resources
async function createPost(title, body, userId) {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            body,
            userId
        })
    });
    if (!response.ok) {
        throw new Error(`Failed to create post (HTTP ${response.status})`);
    }

    return response.json();
}

const postForm = document.getElementById("create-post-form");
const postFeedback = document.getElementById("post-feedback");
const createdPost = document.getElementById("created-post");

postForm.addEventListener("submit", async event => {
    event.preventDefault();

    const submitButton = postForm.querySelector("button[type='submit']");
    const formData = new FormData(postForm);
    const title = formData.get("title").trim();
    const body = formData.get("body").trim();
    const userId = Number(formData.get("userId"));

    submitButton.disabled = true;
    postFeedback.textContent = "Submitting post...";
    postFeedback.classList.remove("error-text");
    createdPost.hidden = true;

    try {
        const post = await createPost(title, body, userId);
        postFeedback.textContent = `Post created successfully (ID: ${post.id}).`;

        const heading = document.createElement("h3");
        heading.textContent = post.title;
        const content = document.createElement("p");
        content.textContent = post.body;
        const author = document.createElement("p");
        author.textContent = `User ID: ${post.userId} | Post ID: ${post.id}`;
        createdPost.replaceChildren(heading, content, author);
        createdPost.hidden = false;
        postForm.reset();
    } catch (error) {
        postFeedback.textContent = error.message;
        postFeedback.classList.add("error-text");
    } finally {
        submitButton.disabled = false;
    }
});

// Task 12.4: Search and filter the users already fetched by loadUsers.
function populateCityFilter(users) {
    const cities = [...new Set(users.map(user => user.address.city))]
        .sort((a, b) => a.localeCompare(b));

    for (const city of cities) {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        cityFilter.append(option);
    }
}

function applyUserFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedCity = cityFilter.value;
    const direction = nameSort.value === "desc" ? -1 : 1;

    const filteredUsers = allUsers
        .filter(user => {
            const matchesSearch = `${user.name} ${user.email}`.toLowerCase().includes(query);
            const matchesCity = !selectedCity || user.address.city === selectedCity;
            return matchesSearch && matchesCity;
        })
        .sort((a, b) => direction * a.name.localeCompare(b.name));

    displayUsers(filteredUsers);
    usersCount.textContent = `Showing ${filteredUsers.length} of ${allUsers.length} users`;
}

searchInput.addEventListener("input", applyUserFilters);
nameSort.addEventListener("change", applyUserFilters);
cityFilter.addEventListener("change", applyUserFilters);

// Initialize the Lesson 12 API examples.
loadUsers();
