// Exercise 1: Synchronous vs Asynchronous
// Synchronous - blocks until complete
console.log("1 - Start");
console.log("2 - Middle");
console.log("3 - End");
// Output: 1, 2, 3 (in order)

// Asynchronous - doesn't block
console.log("1 - Start");

setTimeout(() => {
    console.log("2 - This is delayed");
}, 2000);

console.log("3 - End");
// Output: 1, 3, then 2 (after 2 seconds)

// Predict the output
console.log("A");

setTimeout(() => console.log("B"), 0);

console.log("C");

setTimeout(() => console.log("D"), 100);

console.log("E");

// What order will these print?
// A, C, E, B, D

// Exercise 2: Callbacks
// Old-style callbacks
function fetchData(callback) {
    setTimeout(() => {
        const data = { name: "John", age: 30 };
        callback(data);
    }, 1000);
}

fetchData(function(data) {
    console.log("Data received:", data);
});

// Build: Create a function that simulates loading user data
function loadUser(userId, callback) {
    // Simulate a 1.5 second database lookup.
    setTimeout(() => {
        callback({ id: userId, name: `User ${userId}` });
    }, 1500);
}
loadUser(1, user => console.log("Loaded user:", user));
// Task 11.2: Callback hell & introduction to Promises

//Exercise 1: Experience callback hell

// This is BAD - "Callback Hell" or "Pyramid of Doom"
function getUserDataCallback(userId, callback) {
    setTimeout(() => {
        callback({ id: userId, name: "John" });
    }, 1000);
}

function getUserPostsCallback(userId, callback) {
    setTimeout(() => {
        callback([
            { id: 1, title: "Post 1" },
            { id: 2, title: "Post 2" }
        ]);
    }, 1000);
}

function getPostCommentsCallback(postId, callback) {
    setTimeout(() => {
        callback([
            { id: 1, text: "Great post!" },
            { id: 2, text: "Thanks for sharing" }
        ]);
    }, 1000);
}

// The nightmare:
getUserDataCallback(1, function(user) {
    console.log("User:", user);
    getUserPostsCallback(user.id, function(posts) {
        console.log("Posts:", posts);
        getPostCommentsCallback(posts[0].id, function(comments) {
            console.log("Comments:", comments);
            // Imagine 3 more levels deep...
        });
    });
});
// Exercise 2: Promises to the rescue
// Creating a Promise
const myPromise = new Promise((resolve, reject) => {
    const success = true;
    
    setTimeout(() => {
        if (success) {
            resolve("It worked!");
        } else {
            reject("Something went wrong");
        }
    }, 1000);
});

// Using a Promise
myPromise
    .then(result => {
        console.log("Success:", result);
    })
    .catch(error => {
        console.log("Error:", error);
    });
    // Refactor getUserData to return a Promise:
    function getUserData(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId > 0) {
                resolve({ id: userId, name: "John" });
            } else {
                reject("Invalid user ID");
            }
        }, 1000);
    });
}

// Now do the same for getUserPosts and getPostComments
function getUserPosts(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId > 0) {
                resolve([
                    { id: 1, title: "Post 1" },
                    { id: 2, title: "Post 2" }
                ]);
            } else {
                reject("Invalid user ID");
            }
        }, 1000);
    });
}

function getPostComments(postId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (postId > 0) {
                resolve([
                    { id: 1, text: "Great post!" },
                    { id: 2, text: "Thanks for sharing" }
                ]);
            } else {
                reject("Invalid post ID");
            }
        }, 1000);
    });
}
//Task 11.3: Promise chaining
// Exercise 1: Chaining Promises
getUserData(1)
    .then(user => {
        console.log("User:", user);
        return getUserPosts(user.id);
    })
    .then(posts => {
        console.log("Posts:", posts);
        return getPostComments(posts[0].id);
    })
    .then(comments => {
        console.log("Comments:", comments);
    })
    .catch(error => {
        console.error("Error:", error);
    });
// Exercise 2: Promise.all - fetch three users in parallel.
const userPromise1 = getUserData(1);
const userPromise2 = getUserData(2);
const userPromise3 = getUserData(3);

Promise.all([userPromise1, userPromise2, userPromise3])
    .then(users => console.log("All users:", users))
    .catch(error => console.error("One user request failed:", error));

// Exercise 3: Promise.race
const fast = new Promise(resolve =>
    setTimeout(() => resolve("Fast!"), 100)
);
const slow = new Promise(resolve =>
    setTimeout(() => resolve("Slow!"), 500)
);

Promise.race([fast, slow])
    .then(result => {
        console.log("Winner:", result); // "Fast!"
    });

// Build: Fetch data for 3 users simultaneously and display them all at once.
function fetchUser(userId) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ id: userId, name: `User ${userId}` });
        }, userId * 300);
    });
}

Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)])
    .then(users => {
        console.log("All users:", users);
    })
    .catch(error => {
        console.error("Could not fetch all users:", error);
    });

    // Task 11.4: Async/Await 

    // Exercise 1: Converting Promises to Async/Await
    // Promise chain version:
function getDataWithPromises() {
    return getUserData(1)
        .then(user => getUserPosts(user.id))
        .then(posts => getPostComments(posts[0].id))
        .then(comments => comments);
}

// Async/await version (much cleaner!):
async function getDataWithAsync() {
    const user = await getUserData(1);
    const posts = await getUserPosts(user.id);
    const comments = await getPostComments(posts[0].id);
    return comments;
}

// Using:
getDataWithAsync().then(comments => console.log(comments));

// Or inside another async function:
async function main() {
    const comments = await getDataWithAsync();
    console.log(comments);
}
main().catch(error => console.error("Could not load comments:", error));

// Exercise 2: Error handling with try/catch
async function fetchUserData(userId) {
    try {
        const user = await getUserData(userId);
        const posts = await getUserPosts(user.id);
        return { user, posts };
    } catch (error) {
        console.error("Failed to fetch:", error);
        throw error;  // Re-throw if needed
    }
}

fetchUserData(1)
    .then(data => console.log("Fetched user data:", data))
    .catch(() => {
        // The error was logged in fetchUserData.
    });

// Exercise 3: Parallel with Async/Await
async function getAllUsers() {
    // Sequential (slow): each request waits for the previous one (~3 seconds).
    // const user1 = await getUserData(1);
    // const user2 = await getUserData(2);
    // const user3 = await getUserData(3);
    
    // Parallel (fast):
    const [u1, u2, u3] = await Promise.all([
        getUserData(1),
        getUserData(2),
        getUserData(3)
    ]);
    // Total time: ~1 second
    
    return [u1, u2, u3];
}

getAllUsers()
    .then(users => console.log("Users fetched in parallel:", users))
    .catch(error => console.error("Could not fetch users:", error));

// Build: Rewrite the callback hell example using async/await.
async function getUserDetailsWithAsyncAwait(userId) {
    try {
        const user = await getUserData(userId);
        console.log("User:", user);

        const posts = await getUserPosts(user.id);
        console.log("Posts:", posts);

        const comments = await getPostComments(posts[0].id);
        console.log("Comments:", comments);
    } catch (error) {
        console.error("Could not load user details:", error);
    }
}

getUserDetailsWithAsyncAwait(1);
