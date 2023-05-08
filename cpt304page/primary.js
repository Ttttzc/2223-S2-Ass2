const territorySelect = document.getElementById("select-territory");
const nationSelect = document.getElementById("select-nation");
const municipalitySelect = document.getElementById("select-municipality");

const festivityList = document.getElementById("festivity-list");
const festivitySelect = document.getElementById("select-festivity");

const holidaysSection = document.getElementById("holidaysSection");
const climateSection = document.getElementById("climateSection");
const lodgingSection = document.getElementById("lodgingSection");

const festivityBtn = document.getElementById("festivity-btn");
const climateBtn = document.getElementById("climate-btn");
const lodgingBtn = document.getElementById("lodging-btn");

/* APIs for geographical areas */

/* Get a list of all countries globally */
function fetchCountries() {
    const url = 'https://countriesnow.space/api/v0.1/countries';
    console.log('request', url);
    return fetch(url)
        .then(response => response.json())
        .then(data => data.data);
}

/* Obtain all states/provinces within a country */
function fetchStates(countryCode) {
    url = 'https://countriesnow.space/api/v0.1/countries/states';
    console.log('request:', url);
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            country: countryCode
        })
    })
        .then(response => response.json())
        .then(data => data.data.states);
}

/* Get all cities within a specific state/province */
function fetchCities(countryCode, stateCode) {
    url = 'https://countriesnow.space/api/v0.1/countries/state/cities';
    console.log(url);
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "country": countryCode,
            "state": stateCode
        })
    })
        .then(response => response.json())
        .then(data =>
            data.data
        );
}

/* API for holidays */
function fetchHolidays(countryCode) {
    const apiKey = "1e1f53ec-7df7-48b7-bd79-5525c3b38791";
    const year = 2022;
    const url = `https://holidayapi.com/v1/holidays?key=${apiKey}&country=${countryCode}&year=${year}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => data.holidays)
}

/* API for weather data */
function fetchWeather(lat, lon, date) {
    const apiKey = "2216bdbd77882f45d8841b0895cb5731";
    const dt = Date.parse(date) / 1000;
    const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&appid=${apiKey}`;
    return fetch(url)
        .then((response) => response.json())
}

/* Adapter to transform YYYY-MM-DD format to Unix time */
async function geocodingAdapter(city) {
    const apiKey = '13e180b671ca7d59eba84cf7d5e1075a';
    const limit = 1;
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${apiKey}`;
    return await fetch(url)
        .then(response => response.json())
}

function formatTime(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();
    const formattedTime = hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
    return formattedTime;
}

/* Populate the list of countries when the page loads */
fetchCountries()
    .then(countries => {
        nationSelect.insertAdjacentHTML('beforeend', '<option value="" selected disabled>Select a country</option>');
        countries.forEach(country => {
            const option = document.createElement("option");
            option.value = country.iso2;
            option.text = country.country;
            nationSelect.appendChild(option);
        });
    });

/* Retrieve a list of public holidays and provinces/states when a country is selected */
nationSelect.addEventListener("change", event => {
    const countryCode = event.target.value;
    const index = nationSelect.selectedIndex;
    const country = nationSelect.options[index].text;

    fetchHolidays(countryCode)
        .then(holidays => {
            console.log(holidays)

            festivityList.innerHTML = "";
            festivitySelect.innerHTML = "";

            festivitySelect.insertAdjacentHTML('beforeend', '<option value="" selected disabled>Select a holiday</option>');

            holidays.forEach(holiday => {
                const li = document.createElement("li");
                li.textContent = holiday.name + ' ' + holiday.date;
                festivityList.appendChild(li);

                const option = document.createElement("option");
                option.value = holiday.name;
                option.text = holiday.name;
                option.id = holiday.date;
                festivitySelect.appendChild(option);
            });
        });

    fetchStates(country)
        .then(states => {
            territorySelect.innerHTML = "";
            territorySelect.insertAdjacentHTML('beforeend', '<option value="" selected disabled>Select a province/state</option>');

            const option = document.createElement("option");
            option.value = 'None';
            option.text = '.';
            option.disabled = 'disabled';
            territorySelect.appendChild(option);

            console.log(states);
            states.forEach(state => {
                const option = document.createElement("option");
                option.value = state.name;
                option.text = state.name;
                territorySelect.appendChild(option);
            });
        });
});

/* Obtain a list of cities when a province/state is selected */
territorySelect.addEventListener("change", event => {
    const stateCode = event.target.value;
    const index = nationSelect.selectedIndex;
    const country = nationSelect.options[index].text;
    fetchCities(country, stateCode)
        .then(cities => {
            municipalitySelect.innerHTML = "";
            municipalitySelect.insertAdjacentHTML('beforeend', '<option value="" selected disabled>Select a city</option>');
            console.log(cities);
            cities.forEach(city => {
                const option = document.createElement("option");
                option.value = city;
                option.text = city;
                municipalitySelect.appendChild(option);
            });
        });
});

/* Show the holidays when the holiday button is clicked */
festivityBtn.addEventListener("click", function () {
    holidaysSection.style.display = "block";
    climateSection.style.display = "none";
    lodgingSection.style.display = 'none';
});

/* Show the weather information when the holiday button is clicked */
climateBtn.addEventListener("click", function () {
    holidaysSection.style.display = "none";
    climateSection.style.display = "block";
    lodgingSection.style.display = 'none';
    //
    climateSection.innerHTML = "";
    const indexCountry = nationSelect.selectedIndex;
    const country = nationSelect.options[indexCountry].text;

    const indexRegion = territorySelect.selectedIndex;
    const region = territorySelect.options[indexRegion].text;

    const indexCity = municipalitySelect.selectedIndex;
    let city = municipalitySelect.options[indexCity].text;

    const indexholiday = festivitySelect.selectedIndex;
    const holiday = festivitySelect.options[indexholiday].value;
    const date = festivitySelect.options[indexholiday].id;

    let lat
    let lon;

    let area;
    if (indexCity === 0) {
        area = region;
        city = 'none';
    } else {
        area = city;
    }
    geocodingAdapter(area).then(data => {
        lat = data[0].lat;
        lon = data[0].lon;
        console.log(data);
        fetchWeather(lat, lon, date).then(weatherData => {
            console.log(weatherData);
            const sunrise = formatTime(weatherData.data[0].sunrise);
            const sunset = formatTime(weatherData.data[0].sunset);
            // Display the weather data
            climateSection.innerHTML = `
        <h3>Weather on ${country}/${region}/${city} (${date}) (${holiday}):</h3>
        <p>Temperature: ${weatherData.data[0].temp} °C</p>
        <p>Humidity: ${weatherData.data[0].humidity}%</p>
        <p>Description: ${weatherData.data[0].weather[0].description}</p>
        <p>Clouds: ${weatherData.data[0].clouds}</p>
        <p>Pressure: ${weatherData.data[0].pressure}</p>
        <p>Sunrise: ${sunrise}</p>
        <p>Sunset: ${sunset}</p>
      `;
        }).catch(error => {
            alert('An error occurred: ' + error.message + '\n' + ' Please make sure to select the holiday and city');
        });
    }).catch(error => {
        alert('An error occurred: ' + error.message + '\n' + ' Please make sure to select the city');
    });
});

async function fetchAccommodation() {
    const url = `https://mashvisor-api.p.rapidapi.com/airbnb-property/active-listings?state=CA&city=San%20Francisco&page=1&items=4`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'da1c007904msh13e13509e4d5ba6p115ca1jsnf321abd72c59',
            'X-RapidAPI-Host': 'mashvisor-api.p.rapidapi.com'
        }
    };
    const response = await fetch(url, options);
    const result = await response.text();
    console.log(result);
}

/* Show the accommodation information when the rental button is clicked */
lodgingBtn.addEventListener("click", function () {
    holidaysSection.style.display = "none";
    climateSection.style.display = "none";
    lodgingSection.style.display = 'block';

    fetchAccommodation();
});











// const nationSelect = document.getElementById("select-nation");
// const territorySelect = document.getElementById("select-territory");
// const municipalitySelect = document.getElementById("select-municipality");

// const festivityList = document.getElementById("festivity-list");
// const festivitySelect = document.getElementById("select-festivity");

// const holidaysSection = document.getElementById("holidaysSection");
// const climateSection = document.getElementById("climateSection");
// const lodgingSection = document.getElementById("lodgingSection");

// const festivityBtn = document.getElementById("festivity-btn");
// const climateBtn = document.getElementById("climate-btn");
// const lodgingBtn = document.getElementById("lodging-btn");

// /* Area APIs */

// /* Request all the countries in the world */
// function fetchCountries() {
//     const url = 'https://countriesnow.space/api/v0.1/countries';
//     console.log('request', url);
//     return fetch(url)
//         .then(response => response.json())
//         .then(data => data.data);
// }

// /* Request all the states/provinces in a country */
// function fetchStates(countryCode) {
//     url = 'https://countriesnow.space/api/v0.1/countries/states';
//     console.log('request:', url);
//     return fetch(url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             country: countryCode
//         })
//     })
//         .then(response => response.json())
//         .then(data => data.data.states);
// }

// /* Request all the cities in a state/province */
// function fetchCities(countryCode, stateCode) {
//     url = 'https://countriesnow.space/api/v0.1/countries/state/cities';
//     console.log(url);
//     return fetch(url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             "country": countryCode,
//             "state": stateCode
//         })
//     })
//         .then(response => response.json())
//         .then(data =>
//             data.data
//         );
// }

// /* Holiday API */
// function fetchHolidays(countryCode) {
//     const apiKey = "1e1f53ec-7df7-48b7-bd79-5525c3b38791";
//     const year = 2022;
//     const url = `https://holidayapi.com/v1/holidays?key=${apiKey}&country=${countryCode}&year=${year}`;

//     return fetch(url)
//         .then(response => response.json())
//         .then(data => data.holidays)
// }

// /* Weather API */
// function fetchWeather(lat, lon, date) {
//     const apiKey = "2216bdbd77882f45d8841b0895cb5731";
//     const dt = Date.parse(date) / 1000;
//     const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&appid=${apiKey}`;
//     return fetch(url)
//         .then((response) => response.json())
// }

// /* Data Adapter to convert YYYY-MM-DD to Unix time */
// async function geocodingAdapter(city) {
//     const apiKey = '13e180b671ca7d59eba84cf7d5e1075a';
//     const limit = 1;
//     const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${apiKey}`;
//     return await fetch(url)
//         .then(response => response.json())
// }

// function formatTime(unixTimestamp) {
//     const date = new Date(unixTimestamp * 1000);
//     const hours = date.getHours();
//     const minutes = "0" + date.getMinutes();
//     const seconds = "0" + date.getSeconds();
//     const formattedTime = hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
//     return formattedTime;
// }

// /* Get a list of countries when open the page */
// fetchCountries()
//     .then(countries => {
//         nationSelect.insertAdjacentHTML('beforeend', '<option value="" selected disabled>Select a country</option>');
//         countries.forEach(country => {
//             const option = document.createElement("option");
//             option.value = country.iso2;
//             option.text = country.country;
//             nationSelect.appendChild(option);
//         });
//     });

// /* Get a list of public holidays and provinces/states when selecting a country */
// nationSelect.addEventListener("change", event => {
//     const countryCode = event.target.value;
//     const index = nationSelect.selectedIndex;
//     const country = nationSelect.options[index].text;

//     fetchHolidays(countryCode)
//         .then(holidays => {
//             console.log(holidays)

//             festivityList.innerHTML = "";
//             festivitySelect.innerHTML = "";

//             festivitySelect.insertAdjacentHTML('beforeend', '<option value="" selected disabled>Select a holiday</option>');

//             holidays.forEach(holiday => {
//                 const li = document.createElement("li");
//                 li.textContent = holiday.name + ' ' + holiday.date;
//                 festivityList.appendChild(li);

//                 const option = document.createElement("option");
//                 option.value = holiday.name;
//                 option.text = holiday.name;
//                 option.id = holiday.date;
//                 festivitySelect.appendChild(option);
//             });
//         });

//     fetchStates(country)
//         .then(states => {
//             territorySelect.innerHTML = "";
//             territorySelect.insertAdjacentHTML('beforeend', '<option value="" selected disabled>Select a province/state</option>');

//             const option = document.createElement("option");
//             option.value = 'None';
//             option.text = '.';
//             option.disabled = 'disabled';
//             territorySelect.appendChild(option);

//             console.log(states);
//             states.forEach(state => {
//                 const option = document.createElement("option");
//                 option.value = state.name;
//                 option.text = state.name;
//                 territorySelect.appendChild(option);
//             });
//         });
// });

// /* Gets a list of cities when province/state is selected */
// territorySelect.addEventListener("change", event => {
//     const stateCode = event.target.value;
//     const index = nationSelect.selectedIndex;
//     const country = nationSelect.options[index].text;
//     fetchCities(country, stateCode)
//         .then(cities => {
//             municipalitySelect.innerHTML = "";
//             municipalitySelect.insertAdjacentHTML('beforeend', '<option value="" selected disabled>Select a city</option>');
//             console.log(cities);
//             cities.forEach(city => {
//                 const option = document.createElement("option");
//                 option.value = city;
//                 option.text = city;
//                 municipalitySelect.appendChild(option);
//             });
//         });
// });

// /* Display the holidays when click the holiday button */
// festivityBtn.addEventListener("click", function () {
//     holidaysSection.style.display = "block";
//     climateSection.style.display = "none";
//     lodgingSection.style.display = 'none';
// });

// /* Display the weather information when click the holiday button */
// climateBtn.addEventListener("click", function () {
//     holidaysSection.style.display = "none";
//     climateSection.style.display = "block";
//     lodgingSection.style.display = 'none';
//     //
//     climateSection.innerHTML = "";
//     const indexCountry = nationSelect.selectedIndex;
//     const country = nationSelect.options[indexCountry].text;

//     const indexRegion = territorySelect.selectedIndex;
//     const region = territorySelect.options[indexRegion].text;

//     const indexCity = municipalitySelect.selectedIndex;
//     let city = municipalitySelect.options[indexCity].text;

//     const indexholiday = festivitySelect.selectedIndex;
//     const holiday = festivitySelect.options[indexholiday].value;
//     const date = festivitySelect.options[indexholiday].id;

//     let lat;
//     let lon;

//     let area
//     // ();
//     if (indexCity === 0) {
//         area = region;
//         city = 'none';
//     } else {
//         area = city;
//     }
//     geocodingAdapter(area).then(data => {
//         lat = data[0].lat;
//         lon = data[0].lon;
//         console.log(data);
//         fetchWeather(lat, lon, date).then(weatherData => {
//             console.log(weatherData);
//             const sunrise = formatTime(weatherData.data[0].sunrise);
//             const sunset = formatTime(weatherData.data[0].sunset);
//             // Display the weather data
//             climateSection.innerHTML = `
//         <h3>Weather on ${country}/${region}/${city} (${date}) (${holiday}):</h3>
//         <p>Temperature: ${weatherData.data[0].temp} °C</p>
//         <p>Humidity: ${weatherData.data[0].humidity}%</p>
//         <p>Description: ${weatherData.data[0].weather[0].description}</p>
//         <p>Clouds: ${weatherData.data[0].clouds}</p>
//         <p>Pressure: ${weatherData.data[0].pressure}</p>
//         <p>Sunrise: ${sunrise}</p>
//         <p>Sunset: ${sunset}</p>
//       `;
//         }).catch(error => {
//             alert('An error occurred: ' + error.message + '\n' + ' Please make sure select the holiday and city');
//         });
//     }).catch(error => {
//         alert('An error occurred: ' + error.message + '\n' + ' Please make sure select the city');
//     });
// });

// async function fetchAccommodation() {
//     const url = `https://mashvisor-api.p.rapidapi.com/airbnb-property/active-listings?state=CA&city=San%20Francisco&page=1&items=4`;
//     const options = {
//         method: 'GET',
//         headers: {
//             'X-RapidAPI-Key': 'da1c007904msh13e13509e4d5ba6p115ca1jsnf321abd72c59',
//             'X-RapidAPI-Host': 'mashvisor-api.p.rapidapi.com'
//         }
//     };
//     const response = await fetch(url, options);
//     const result = await response.text();
//     console.log(result);
// }

// /* Display the accommodation information when click the rental button */
// rentalBtn.addEventListener("click", function () {
//     holidaysSection.style.display = "none";
//     climateSection.style.display = "none";
//     lodgingSection.style.display = 'block';

//     fetchAccommodation();
// });






// // Variables
// const nationSelect = document.getElementById("select-nation");
// const territorySelect = document.getElementById("select-territory");
// const municipalitySelect = document.getElementById("select-municipality");

// const festivityList = document.getElementById("festivity-list");
// const festivitySelect = document.getElementById("select-festivity");

// const holidaysSection = document.getElementById("holidaysSection");
// const climateSection = document.getElementById("climateSection");
// const lodgingSection = document.getElementById("lodgingSection");

// const festivityBtn = document.getElementById("festivity-btn");
// const climateBtn = document.getElementById("climate-btn");
// const lodgingBtn = document.getElementById("lodging-btn");

// // Helper functions
// function formatTime(unixTimestamp) {
//     const date = new Date(unixTimestamp * 1000);
//     const hours = date.getHours();
//     const minutes = "0" + date.getMinutes();
//     const seconds = "0" + date.getSeconds();
//     const formattedTime = hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
//     return formattedTime;
// }

// // APIs
// async function fetchCountries() {
//     const url = 'https://countriesnow.space/api/v0.1/countries';
//     console.log('request', url);
//     return fetch(url)
//         .then(response => response.json())
//         .then(data => data.data);
// }

// async function fetchStates(countryCode) {
//     url = 'https://countriesnow.space/api/v0.1/countries/states';
//     console.log('request:', url);
//     return fetch(url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             country: countryCode
//         })
//     })
//         .then(response => response.json())
//         .then(data => data.data.states);
// }

// async function fetchCities(countryCode, stateCode) {
//     url = 'https://countriesnow.space/api/v0.1/countries/state/cities';
//     console.log(url);
//     return fetch(url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             "country": countryCode,
//             "state": stateCode
//         })
//     })
//         .then(response => response.json())
//         .then(data =>
//             data.data
//         );
// }

// async function fetchHolidays(countryCode) {
//     const apiKey = "1e1f53ec-7df7-48b7-bd79-5525c3b38791";
//     const year = 2022;
//     const url = `https://holidayapi.com/v1/holidays?key=${apiKey}&country=${countryCode}&year=${year}`;

//     return fetch(url)
//         .then(response => response.json())
//         .then(data => data.holidays)
// }

// async function fetchWeather(lat, lon, date) {
//     const apiKey = "2216bdbd77882f45d8841b0895cb5731";
//     const dt = Date.parse(date) / 1000;
//     const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&appid=${apiKey}`;
//     return fetch(url)
//         .then((response) => response.json())
// }

// async function geocodingAdapter(city) {
//     const apiKey = '13e180b671ca7d59eba84cf7d5e1075a';
//     const limit = 1;
//     const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${apiKey}`;
//     return await fetch(url)
//         .then(response => response.json())
// }

// // Event listeners
// fetchCountries()
//     .then(countries => {
//         nationSelect.insertAdjacentHTML('beforeend', '<option value="" selected disabled>Select a country</option>');
//         countries.forEach(country => {
//             const option = document.createElement("option");
//             option.value = country.iso2;
//             option.text = country.country;
//             nationSelect.appendChild(option);
//         });
//     });

// nationSelect.addEventListener("change", event => {
//     const countryCode = event.target.value;
//     const index = nationSelect.selectedIndex;
//     const country = nationSelect.options[index].text;

//     fetchHolidays(countryCode)
//         .then(holidays => {
//             console.log(holidays)

//             festivityList.innerHTML = "";
//             festivitySelect.innerHTML = "";

//             festivitySelect.insertAdjacentHTML('beforeend', '<option value="" selected disabled>Select a holiday</option>');

//             holidays.forEach(holiday => {
//                 const li = document.createElement("li");
//                 li.textContent = holiday.name + ' ' + holiday.date;
//                 festivityList.appendChild(li);

//                 const option = document.createElement("option");
//                 option.value = holiday.name;
//                 option.text = holiday.name;
//                 option.id = holiday.date;
//                 festivitySelect.appendChild(option);
//             });
//         });

//     fetchStates(country)
//         .then(states => {
//             territorySelect.innerHTML = "";
//             territorySelect.insertAdjacentHTML('beforeend', '<option value="" selected disabled>Select a province/state</option>');

//             const option = document.createElement("option");
//             option.value = 'None';
//             option.text = '.';
//             option.disabled = 'disabled';
//             territorySelect.appendChild(option);

//             console.log(states);
//             states.forEach(state => {
//                 const option = document.createElement("option");
//                 option.value = state.name;
//                 option.text = state.name;
//                 territorySelect.appendChild(option);
//             });
//         });
// });

// territorySelect.addEventListener("change", event => {
//     const stateCode = event.target.value;
//     const index = nationSelect.selectedIndex;
//     const country = nationSelect.options[index].text;
//     fetchCities(country, stateCode)
//         .then(cities => {
//             municipalitySelect.innerHTML = "";
//             municipalitySelect.insertAdjacentHTML('beforeend', '<option value="" selected disabled>Select a city</option>');
//             console.log(cities);
//             cities.forEach(city => {
//                 const option = document.createElement("option");
//                 option.value = city;
//                 option.text = city;
//                 municipalitySelect.appendChild(option);
//             });
//         });
// });

// festivityBtn.addEventListener("click", function () {
//     holidaysSection.style.display = "block";
//     climateSection.style.display = "none";
//     lodgingSection.style.display = 'none';
// });

// climateBtn.addEventListener("click", function () {
//     holidaysSection.style.display = "none";
//     climateSection.style.display = "block";
//     lodgingSection.style.display = 'none';

//     climateSection.innerHTML = "";
//     const indexCountry = nationSelect.selectedIndex;
//     const country = nationSelect.options[indexCountry].text;

//     const indexRegion = territorySelect.selectedIndex;
//     const region = territorySelect.options[indexRegion].text;

//     const indexCity = municipalitySelect.selectedIndex;
//     let city = municipalitySelect.options[indexCity].text;

//     const indexholiday = festivitySelect.selectedIndex;
//     const holiday = festivitySelect.options[indexholiday].value;
//     const date = festivitySelect.options[indexholiday].id;

//     let lat;
//     let lon;

//     let area
//     if (indexCity === 0) {
//         area = region;
//         city = 'none';
//     } else {
//         area = city;
//     }
//     geocodingAdapter(area).then(data => {
//         lat = data[0].lat;
//         lon = data[0].lon;
//         console.log(data);
//         fetchWeather(lat, lon,
//             date).then(weatherData => {
//                 console.log(weatherData);
//                 const { current } = weatherData;
//                 const temperature = current.temp - 273.15; // Convert to Celsius
//                 const weatherDescription = current.weather[0].description;
    
//                 const weatherInfo = `
//                     <h2>Weather Information for ${holiday} in ${city === 'none' ? region : city}, ${country}:</h2>
//                     <p><strong>Date:</strong> ${date}</p>
//                     <p><strong>Temperature:</strong> ${temperature.toFixed(1)} °C</p>
//                     <p><strong>Description:</strong> ${weatherDescription}</p>
//                 `;
//                 climateSection.innerHTML = weatherInfo;
//             });
//         });
//     });

// climateBtn.addEventListener("click", function () {
//     holidaysSection.style.display = "none";
//     climateSection.style.display = "block";
//     lodgingSection.style.display = 'none';

//     const indexCountry = nationSelect.selectedIndex;
//     const country = nationSelect.options[indexCountry].text;

//     const indexRegion = territorySelect.selectedIndex;
//     const region = territorySelect.options[indexRegion].text;

//     const indexCity = municipalitySelect.selectedIndex;
//     let city = municipalitySelect.options[indexCity].text;

//     const indexholiday = festivitySelect.selectedIndex;
//     const holiday = festivitySelect.options[indexholiday].value;
//     const date = festivitySelect.options[indexholiday].id;

//     let lat;
//     let lon;

//     let area;
//     if (indexCity === 0) {
//         area = region;
//         city = 'none';
//     } else {
//         area = city;
//     }
//     geocodingAdapter(area).then(data => {
//         lat = data[0].lat;
//         lon = data[0].lon;
//         console.log(data);
//         fetchWeather(lat, lon, date).then(weatherData => {
//             console.log(weatherData);
//             const temperature = weatherData.current.temp - 273.15; // Convert to Celsius
//             const weatherDescription = weatherData.current.weather[0].description;

//             climateSection.innerHTML = `
//                 <h3>Weather on ${holiday} in ${city === 'none' ? region : city}, ${country} (${date}):</h3>
//                 <p>Temperature: ${temperature.toFixed(1)} °C</p>
//                 <p>Description: ${weatherDescription}</p>
//             `;
//         }).catch(error => {
//             alert('An error occurred: ' + error.message + '\n' + ' Please make sure to select the holiday and city');
//         });
//     }).catch(error => {
//         alert('An error occurred: ' + error.message + '\n' + ' Please make sure to select the city');
//     });
// });

    
//     lodgingBtn.addEventListener("click", function () {
//         holidaysSection.style.display = "none";
//         climateSection.style.display = "none";
//         lodgingSection.style.display = 'block';
    
//         // Add lodging information and display logic here
        
//     });
    
