// ============================================
// LESSON 11 — CLASSWORK EXERCISE
// Callbacks  ->  Promises + chaining  ->  Async/await
// Week 6 · Run with:  node lesson-11-exercise.js
// ============================================

const nameFor = (id) => ({ 1: "Edith", 2: "Jacob" }[id] || "Unknown");

function getUserCb(userId, cb) {
  setTimeout(() => {
    if (!userId) return cb(new Error("Missing userId"));
    cb(null, { id: userId, name: nameFor(userId) });
  }, 400);
}

function getOrdersCb(user, cb) {
  setTimeout(() => {
    cb(null, [
      { id: 101, amount: 20 },
      { id: 102, amount: 35 },
    ]);
  }, 400);
}

function getOrderTotalCb(orders, cb) {
  setTimeout(() => {
    const total = orders.reduce((sum, o) => sum + o.amount, 0);
    cb(null, total);
  }, 400);
}

// Caller — callback version
getUserCb(1, (err, user) => {
  if (err) return console.error("A error:", err.message);
  getOrdersCb(user, (err, orders) => {
    if (err) return console.error("A error:", err.message);
    getOrderTotalCb(orders, (err, total) => {
      if (err) return console.error("A error:", err.message);
      console.log(`A: ${user.name} spent ${total}`);
    });
  });
});


// ============================================
// PART B — PROMISES & CHAINING
// ============================================

// TODO B1: rewrite each function to RETURN a Promise
function getUser(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!userId) return reject(new Error("Missing userId"));
      resolve({ id: userId, name: nameFor(userId) });
    }, 400);
  });
}

function getOrders(user) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 101, amount: 20 },
        { id: 102, amount: 35 },
      ]);
    }, 400);
  });
}

function getOrderTotal(orders) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const total = orders.reduce((sum, o) => sum + o.amount, 0);
      resolve(total);
    }, 400);
  });
}

// TODO B2: chain the three with .then()
// Trick used below to avoid losing scope of 'user': Pass an object down the chain.
getUser(1)
  .then((user) => {
    return getOrders(user).then((orders) => ({ user, orders }));
  })
  .then(({ user, orders }) => {
    return getOrderTotal(orders).then((total) => ({ user, total }));
  })
  .then(({ user, total }) => {
    console.log(`B: ${user.name} spent ${total}`);
  })
  .catch((err) => console.error("B error:", err.message));


// ============================================
// PART C — ASYNC / AWAIT
// ============================================

// TODO C1: write async function checkout(userId)
async function checkout(userId) {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user);
    const total = await getOrderTotal(orders);
    console.log(`C: ${user.name} spent ${total}`);
  } catch (err) {
    console.error("C error:", err.message);
  }
                                                                                                                                                                                                                                                                   
}

// TODO C2: call checkout(1)
checkout(1);

// DOM Element Targets
const citySelector = document.getElementById('city-selector');
const fetchBtn = document.getElementById('fetch-btn');
const weatherCard = document.getElementById('weather-card');
const locationName = document.getElementById('location-name');
const temperatureEl = document.getElementById('temperature');
const windspeedEl = document.getElementById('windspeed');
const humidityEl = document.getElementById('humidity');
const errorMsg = document.getElementById('error-message');

// Async Function to talk to the Weather API
async function getWeatherData() {
    // Hide previous states
    weatherCard.classList.add('hidden');
    errorMsg.classList.add('hidden');

    // Get selected coordinates and clean up labels
    const coordinates = citySelector.value;
    const selectedCityName = citySelector.options[citySelector.selectedIndex].text;
    const [lat, lon] = coordinates.split(',');

    // Build the Open-Meteo URL string dynamically
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

    try {
        // Fetch data from API
        const response = await fetch(apiUrl);
        
        // Handle unexpected bad server issues
        if (!response.ok) {
            throw new Error("Could not retrieve API structural parameters.");
        }

        const data = await response.json();

        // Bind data fields directly to the DOM interface
        locationName.textContent = selectedCityName;
        temperatureEl.textContent = data.current.temperature_2m;
        windspeedEl.textContent = data.current.wind_speed_10m;
        humidityEl.textContent = data.current.relative_humidity_2m;

        // Reveal card container
        weatherCard.classList.remove('hidden');

    } catch (error) {
        // Show validation failures inside error box
        errorMsg.textContent = `API Error: ${error.message}`;
        errorMsg.classList.remove('hidden');
    }
}

// Attach Action click listener to button target
fetchBtn.addEventListener('click', getWeatherData);


// ============================================
// BONUS — Promise.all Parallel execution
// ============================================
Promise.all([getUser(1), getUser(2)])
  .then(([user1, user2]) => {
    console.log(`Bonus: Fetched parallel users — ${user1.name} and ${user2.name}`);
  })
  .catch((err) => console.error("Bonus error:", err.message));
