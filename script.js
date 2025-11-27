function searchCity() {
    const city = document.getElementById("city").value.trim();
    if (!city) return;

    toggleUI(true);

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
        .then(res => res.json())
        .then(data => {
            if (!data.results) return errorMsg();

            const { latitude, longitude, name } = data.results[0];
            getWeather(latitude, longitude, name);
        })
        .catch(errorMsg);
}

/* ---------------------------------------------
   WEATHER FETCH
----------------------------------------------*/
function getWeather(lat, lon, cityName) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`)
        .then(res => res.json())
        .then(data => {
            toggleUI(false);

            const { temperature, windspeed, weathercode, time } = data.current_weather;

            // Récupère le fuseau horaire de la ville renvoyé par l'API
            // timezone: string comme "Europe/Paris"
            const timezone = data.timezone || "UTC";

            // Fonction pour calculer l'heure exacte de la ville en temps réel
            function getCityLocalTime() {
                const now = new Date(); // Heure actuelle du PC
                // Convertit en heure locale de la ville via Intl.DateTimeFormat
                return new Intl.DateTimeFormat('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                    timeZone: timezone
                }).format(now);
            }

            // Met à jour l'heure toutes les secondes
            const localTimeElem = document.getElementById("localTime");
            localTimeElem.textContent = `Heure locale : ${getCityLocalTime()}`;
            if (window.cityTimeInterval) clearInterval(window.cityTimeInterval); // supprime interval précédent
            window.cityTimeInterval = setInterval(() => {
                localTimeElem.textContent = `Heure locale : ${getCityLocalTime()}`;
            }, 1000);

            // Mise à jour de la météo
            document.getElementById("cityName").textContent = cityName;
            document.getElementById("temp").textContent = temperature + "°C";
            document.getElementById("wind").textContent = "Vent : " + windspeed + " km/h";
            document.getElementById("desc").textContent = getDescription(weathercode);

            // Pour le background, on peut utiliser l'heure arrondie à l'heure locale
            const hourForBg = parseInt(getCityLocalTime().split(":")[0], 10);
            updateBackground(temperature, weathercode, hourForBg);
        })
        .catch(errorMsg);
}



/* ---------------------------------------by ikram lk------
   UI HELPERS
----------------------------------------------*/
function errorMsg() {
    toggleUI(false);
    document.getElementById("error").classList.remove("hidden");
}

function toggleUI(loading) {
    document.getElementById("loader").classList.toggle("hidden", !loading);
    document.getElementById("card").classList.toggle("hidden", loading);
    document.getElementById("error").classList.add("hidden");
}

/* --------------------------------------by ikram lk-------
   DESCRIPTION METEO
----------------------------------------------*/
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

/* ----------------------------------by ikram lk-----------
   BACKGROUND ANIMATION
----------------------------------------------*/
function updateBackground(temp, code, hour) {

    const bg = document.getElementById("backgroundAnim");
    bg.innerHTML = "";
    document.body.className = ""; // reset

    /* 🌙 NUIT */
    if (hour >= 20 || hour < 6) {
        document.body.classList.add("night-bg");
        createStars(bg, 50);
        return;
    }

    /* 🌞 JOUR */
    document.body.classList.add("sunny");
    createSun(bg);
    createClouds(bg, 3);

    /* ❄️ FROID */
    if (temp <= 5) {
        document.body.classList.add("cold-bg");
        createSnow(bg, 40);
    }

    /* 🌧️ PLUIE / NEIGE selon WMO */
    if ([51,52,53,55,61,63,65,80,81,82].includes(code)) createRain(bg, 60);
    if ([71,73,75,85,86].includes(code)) createSnow(bg, 40);
    if (code >= 95 && code <= 99) createRain(bg, 80); // orages
}

/* ---------------------------------by ikram lk------------
   ELEMENTS GRAPHICS
----------------------------------------------*/
function createSun(bg) {
    const sun = document.createElement("div");
    sun.className = "sun";
    bg.appendChild(sun);
}

function createStars(bg, count) {
    for (let i = 0; i < count; i++) {
        const s = document.createElement("div");
        s.className = "stars";
        s.style.left = Math.random()*100 + "%";
        s.style.top = Math.random()*100 + "%";
        s.style.opacity = 0.4 + Math.random()*0.6;
        s.style.animationDuration = (1 + Math.random()*3) + "s";
        bg.appendChild(s);
    }
}

function createClouds(bg, count) {
    for (let i = 0; i < count; i++) {
        const c = document.createElement("div");
        c.className = "cloud";
        c.style.top = (5 + Math.random()*40) + "%";
        c.style.left = (-30 + Math.random()*130) + "%";
        c.style.opacity = 0.6 + Math.random()*0.4;
        c.style.animationDuration = (25 + Math.random()*20) + "s";
        bg.appendChild(c);
    }
}

function createRain(bg, count) {
    for (let i = 0; i < count; i++) {
        const d = document.createElement("div");
        d.className = "rain";
        d.style.left = Math.random()*100 + "%";
        d.style.animationDuration = (0.3 + Math.random()*0.6) + "s";
        bg.appendChild(d);
    }
}

function createSnow(bg, count) {
    for (let i = 0; i < count; i++) {
        const s = document.createElement("div");
        s.className = "snow";
        s.style.left = Math.random()*100 + "%";
        s.style.animationDuration = (2 + Math.random()*3) + "s";
        bg.appendChild(s);
    }
}
