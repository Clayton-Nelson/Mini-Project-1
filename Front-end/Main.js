let data;
let dataSa;
let dataNsw;
let dataVic;
let dataQld;
let dataNt;
let dataTas;
let dataWa;
let dataAct;
let currentState;
let parkSize;
let ammountOfParks;
let states;
let parkSizeUnsorted = [];
let parkSizeSorted;
let statesSorted;
let currentPage = 1;
let cardsPerPage;

async function fetchData() {
  try {
    const response = await fetch(
      "https://mocki.io/v1/07f8ff17-a636-4119-a020-5af738040280"
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    data = await response.json();
    currentState = data;
    sortStateArrays(data);
  } catch (error) {
    console.error("Error:", error);
  }
  if (document.URL.includes("Locations")) {
    displayCards(1);
    createPaginationButtons();
    changeCardsPerPage(9, 1);
  } else if (document.URL.includes("Charts")) {
    chartData();
  } else return console.log("URL not recognised in functions.js>fetchData()");
}

function sortStateArrays(data) {
  dataAct = data.filter(
    (park) => park["state"] == "Australian Capital Territory"
  );
  dataNsw = data.filter((park) => park["state"] == "New South Whales");
  dataNt = data.filter((park) => park["state"] == "Northern Territory");
  dataQld = data.filter((park) => park["state"] == "Queensland");
  dataSa = data.filter((park) => park["state"] == "South Australia");
  dataTas = data.filter((park) => park["state"] == "Tasmania");
  dataVic = data.filter((park) => park["state"] == "Victoria");
  dataWa = data.filter((park) => park["state"] == "Western Australia");
}

function createPaginationButtons() {
  const pageCount = Math.ceil(currentState.length / cardsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const prevButton = document.createElement("button");
  prevButton.classList.add("pagination");
  prevButton.classList.add("prev-page");
  prevButton.innerHTML = "&lt;";
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayCards(currentPage);
      highlightButton(currentPage);
      createPaginationButtons();
    }
  });

  const nextButton = document.createElement("button");
  nextButton.classList.add("pagination");
  nextButton.classList.add("next-page");
  nextButton.innerHTML = "&gt;";
  nextButton.addEventListener("click", () => {
    if (currentPage < pageCount) {
      currentPage++;
      displayCards(currentPage);
      highlightButton(currentPage);
      createPaginationButtons();
    }
  });

  pagination.appendChild(prevButton);

  if (pageCount <= 5) {
    for (let page = 1; page <= pageCount; page++) {
      const button = document.createElement("button");
      button.classList.add("pagination");
      button.textContent = page;
      button.addEventListener("click", () => {
        currentPage = page;
        displayCards(currentPage);
        highlightButton(page);
      });
      pagination.appendChild(button);
    }
  } else {
    if (currentPage <= 3) {
      for (let page = 1; page <= 5; page++) {
        const button = document.createElement("button");
        button.classList.add("pagination");
        button.textContent = page;
        button.addEventListener("click", () => {
          currentPage = page;
          displayCards(currentPage);
          highlightButton(page);
          createPaginationButtons();
        });
        pagination.appendChild(button);
      }
    } else if (currentPage >= pageCount - 2) {
      for (let page = pageCount - 4; page <= pageCount; page++) {
        const button = document.createElement("button");
        button.classList.add("pagination");
        button.textContent = page;
        button.addEventListener("click", () => {
          currentPage = page;
          displayCards(currentPage);
          highlightButton(page);
          createPaginationButtons();
        });
        pagination.appendChild(button);
      }
    } else {
      for (let page = currentPage - 2; page <= currentPage + 2; page++) {
        const button = document.createElement("button");
        button.classList.add("pagination");
        button.textContent = page;
        button.addEventListener("click", () => {
          currentPage = page;
          displayCards(currentPage);
          highlightButton(page);
          createPaginationButtons();
        });
        pagination.appendChild(button);
      }
    }
  }

  pagination.appendChild(nextButton);
  highlightButton(currentPage);
}

function changeCardsPerPage(number, buttonNumber) {
  cardsPerPage = number;
  const buttons = document.querySelectorAll("#cards-per-page button");
  buttons.forEach((button) => button.classList.remove("active"));
  buttons[buttonNumber - 1].classList.add("active");
  displayCards(1);
  createPaginationButtons();
  highlightButton(1);
}

function highlightButton(page) {
  const buttons = document.querySelectorAll("#pagination button");
  buttons.forEach((button) => {
    if (button.textContent == page) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function displayCards(page) {
  const startIndex = (page - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;

  const cardsContainer = document.querySelector("#cards");
  cardsContainer.innerHTML = "";

  const cardsToDisplay = currentState.slice(startIndex, endIndex);

  cardsToDisplay.forEach((park) => {
    const template = document
      .getElementById("card-template")
      .content.cloneNode(true);

    const img = document.createElement("img");
    img.src = park.picture;
    img.alt = park.name;

    template.querySelector(".card-picture").appendChild(img);
    template.querySelector(".card-name").innerText = park.name;
    template.querySelector(".card-address").innerText = park.address;
    template.querySelector(".card-state").innerText = park.state;

    cardsContainer.appendChild(template);
  });
}

function chartData() {
  data.forEach((park) => {
    parkSizeUnsorted.push({ size: `${park.size}`, state: `${park.state}` });
  });

  parkSizeSorted = sortData(parkSizeUnsorted);
  parkSizeSorted = removeDuplicateStates(parkSizeSorted);
  parkSizeSorted = abbreviatedStates(parkSizeSorted);
  statesSorted = countStates(data);
  statesSorted = sortData(statesSorted);
  statesSorted = abbreviatedStates(statesSorted);

  charts();
}

function charts() {
  const states = statesSorted.map((park) => park.state);
  const states2 = parkSizeSorted.map((park) => park.state);
  const parkCount = statesSorted.map((park) => parseFloat(park.count));
  const sizes = parkSizeSorted.map((park) => parseFloat(park.size));

  const parkChart = document.getElementById("parkChart").getContext("2d");
  const sizeChart = document.getElementById("sizeChart").getContext("2d");

  new Chart(parkChart, {
    type: "bar",
    data: {
      labels: states,
      datasets: [
        {
          label: "Ammount of Parks",
          data: parkCount,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      aspectRatio: 3 / 2,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });

  new Chart(sizeChart, {
    type: "bar",
    data: {
      labels: states2,
      datasets: [
        {
          label: "Largest Park Size",
          data: sizes,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      aspectRatio: 3 / 2,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}

function countStates(data) {
  const stateCount = {};

  data.forEach((item) => {
    const state = item.state;

    if (stateCount[state]) {
      stateCount[state]++;
    } else {
      stateCount[state] = 1;
    }
  });

  const result = Object.keys(stateCount).map((state) => ({
    count: stateCount[state],
    state: state,
  }));

  return result;
}

function removeDuplicateStates(array) {
  const uniqueSet = new Set();
  const uniqueArray = [];

  array.forEach((park) => {
    if (!uniqueSet.has(park.state)) {
      uniqueSet.add(park.state);
      uniqueArray.push(park);
    }
  });

  return uniqueArray;
}

function sortData(data) {
  data.sort(
    (a, b) =>
      parseFloat(b[Object.keys(b)[0]]) - parseFloat(a[Object.keys(a)[0]])
  );
  return data;
}

function abbreviatedStates(data) {
  const stateMappings = {
    "South Australia": "SA",
    Victoria: "VIC",
    "New South Whales": "NSW",
    Queensland: "QLD",
    "Western Australia": "WA",
    Tasmania: "TAS",
    "Australian Capital Territory": "ACT",
    "Northern Territory": "NT",
  };

  const updatedData = data.map((state) => {
    const stateName = state.state;
    if (stateMappings[stateName]) {
      state.state = stateMappings[stateName];
    }
    return state;
  });

  return updatedData;
}

function filterAndPrintByState() {
  const stateInput = document.getElementById("refine-search-input").value;

  if (stateInput === "empty") {
    currentState = data;
  } else if (stateInput === "South Australia") {
    currentState = dataSa;
  } else if (stateInput === "New South Whales") {
    currentState = dataNsw;
  } else if (stateInput === "Victoria") {
    currentState = dataVic;
  } else if (stateInput === "Queensland") {
    currentState = dataQld;
  } else if (stateInput === "Western Australia") {
    currentState = dataWa;
  } else if (stateInput === "Northern Territory") {
    currentState = dataNt;
  } else if (stateInput === "Tasmania") {
    currentState = dataTas;
  } else if (stateInput === "Australian Capital Territory") {
    currentState = dataAct;
  }

  displayCards(1);
  createPaginationButtons();
}

fetchData();
