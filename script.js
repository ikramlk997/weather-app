function searchCity() {
    const city = document.getElementById("city").value;
    if (!city) return;

    document.getElementById("loader").classList.remove("hidden");
    document.getElementById("card").classList.add("hidden");
    document.getElementById("error").classList.add("hidden");

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
        .then(res => res.json())
        .then(data => {
            if (!data.results) {
                errorMsg();
                return;
            }

            const { latitude, longitude, name } = data.results[0];
            getWeather(latitude, longitude, name);
        });
}

function getWeather(lat, lon, cityName) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("loader").classList.add("hidden");
            document.getElementById("card").classList.remove("hidden");

            const temp = data.current_weather.temperature;
            const wind = data.current_weather.windspeed;
            const code = data.current_weather.weathercode;

            updateBackground(temp, code);

            document.getElementById("cityName").textContent = cityName;
            document.getElementById("temp").textContent = temp + "°C";
            document.getElementById("wind").textContent = "Vent : " + wind + " km/h";

            const desc = getDescription(code);
            document.getElementById("desc").textContent = desc;

            const icon = getIcon(code);
            document.getElementById("weatherIcon").src = icon;

            animateBackground(code);
        });
}

function errorMsg() {
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("error").classList.remove("hidden");
}

/* ===== WEATHER DESCRIPTION ===== */
function getDescription(code) {
    if (code === 0) return "Ciel dégagé ☀️";
    if ([1,2,3].includes(code)) return "Partiellement nuageux ⛅";
    if ([45,48].includes(code)) return "Brouillard 🌫️";
    if ([51,53,55].includes(code)) return "Bruine 🌧️";
    if ([61,63,65].includes(code)) return "Pluie 🌧️";
    if ([71,73,75].includes(code)) return "Neige ❄️";
    if ([95,96,99].includes(code)) return "Orage ⛈️";
    return "Temps inconnu";
}

/* ===== ICONES METEO ===== */
function getIcon(code) {
    if (code === 0) return "https://cdn-icons-png.flaticon.com/512/869/869869.png";  // soleil
    if ([1,2,3].includes(code)) return "https://cdn-icons-png.flaticon.com/512/1163/1163624.png"; // nuages
    if ([61,63,65].includes(code)) return "https://cdn-icons-png.flaticon.com/512/414/414974.png"; // pluie
    if ([71,73,75].includes(code)) return "https://cdn-icons-png.flaticon.com/512/642/642102.png"; // neige
    if ([95,96,99].includes(code)) return "https://cdn-icons-png.flaticon.com/512/1146/1146869.png"; // orage

    return "https://cdn-icons-png.flaticon.com/512/3208/3208755.png";
}

/* ===== ANIMATIONS BACKGROUND ===== */
function animateBackground(code) {
    const bg = document.getElementById("backgroundAnim");
    bg.innerHTML = "";

    // pluie
    if ([61,63,65].includes(code)) {
        for (let i = 0; i < 40; i++) {
            const drop = document.createElement("div");
            drop.className = "rain";
            drop.style.left = Math.random() * 100 + "%";
            drop.style.animationDuration = (0.6 + Math.random()) + "s";
            bg.appendChild(drop);
        }
    }

    // neige
    if ([71,73,75].includes(code)) {
        for (let i = 0; i < 40; i++) {
            const snow = document.createElement("div");
            snow.className = "snow";
            snow.style.left = Math.random() * 100 + "%";
            snow.style.animationDuration = (2 + Math.random() * 2) + "s";
            bg.appendChild(snow);
        }
    }
}
function updateBackground(temp, code) {
    const bg = document.getElementById("backgroundAnim");
    bg.innerHTML = "";
    document.body.classList.remove("cold-bg", "night-bg");

    const hour = new Date().getHours();

    /* 🌙 NUIT */
    if (hour >= 20 || hour <= 6) {
        document.body.classList.add("night-bg");

        for (let i = 0; i < 40; i++) {
            const star = document.createElement("div");
            star.className = "stars";
            star.style.left = Math.random() * 100 + "%";
            star.style.top = Math.random() * 100 + "%";
            star.style.animationDuration = (2 + Math.random() * 3) + "s";
            bg.appendChild(star);
        }
        return;
    }

    /* ❄️ FROID */
    if (temp <= 5) {
        document.body.classList.add("cold-bg");
    }

    /* ☀️ SOLEIL CHAUD */
    if (temp >= 28 || code === 0) {
        const sun = document.createElement("div");
        sun.className = "sun";
        bg.appendChild(sun);
    }

    /* 🌧️ pluie */
    if ([61,63,65].includes(code)) animateBackground(code);

    /* ❄️ neige */
    if ([71,73,75].includes(code)) animateBackground(code);
}

function getWeather(lat, lon, cityName) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("loader").classList.add("hidden");
            document.getElementById("card").classList.remove("hidden");

            const temp = data.current_weather.temperature;
            const wind = data.current_weather.windspeed;
            const code = data.current_weather.weathercode;

            document.getElementById("cityName").textContent = cityName;
            document.getElementById("temp").textContent = temp + "°C";
            document.getElementById("wind").textContent = "Vent : " + wind + " km/h";

            const desc = getDescription(code);
            document.getElementById("desc").textContent = desc;

            animateBackground(code);
            updateBackground(temp, code);

            // ---------- AJOUT : Heure locale ----------
            // Open-Meteo fournit directement current_weather.time au fuseau de la ville
            const localTimeStr = data.current_weather.time; // ex: "2025-11-26T21:16"
            const localTime = new Date(localTimeStr);
            const hours = localTime.getHours().toString().padStart(2, "0");
            const minutes = localTime.getMinutes().toString().padStart(2, "0");
            document.getElementById("localTime").textContent = `Heure locale : ${hours}:${minutes}`;
        });
}
