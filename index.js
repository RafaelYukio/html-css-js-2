let dailyData;

axios
  .get("summary.json")
  .then((response) => {
    const data = response.data;
    const globalData = data.Global;

    createKpis(
      globalData.TotalConfirmed,
      globalData.TotalDeaths,
      globalData.TotalRecovered,
      data.Date
    );

    createPieChart(
      globalData.NewConfirmed,
      globalData.NewDeaths,
      globalData.NewRecovered
    );
    createBarCharts(orderByDeaths(data.Countries, "TotalDeaths").slice(0, 10));
  })
  .catch((error) => console.error(error));

axios
  .get("countries.json")
  .then((response) => {
    createOptionsSelect(
      response.data.sort(function (a, b) {
        if (a.Country > b.Country) return 1;
        if (a.Country < b.Country) return -1;
        return 0;
      }),
      null,
      "paisOptions"
    );
  })
  .catch((error) => console.error(error));

axios
  .get("switzerland-daily-confirmed.json")
  .then((response) => {
    dailyData = response.data.map((day) => ({
      ...day,
      Date: new Date(day.Date),
    }));

    console.log(dailyData);

    document.getElementById("totalConfirmadosPais").innerHTML = dailyData
      .map((day) => day.Cases)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    document.getElementById("dataInicio").min =
      dailyData[0].Date.toISOString().split("T")[0];
    document.getElementById("dataInicio").max = dailyData
      .slice(-1)[0]
      .Date.toISOString()
      .split("T")[0];
    document.getElementById("dataFim").min =
      dailyData[0].Date.toISOString().split("T")[0];
    document.getElementById("dataFim").max = dailyData
      .slice(-1)[0]
      .Date.toISOString()
      .split("T")[0];

    createLineChart(dailyData, dailyData[0].Date, dailyData[20].Date);
  })
  .catch((error) => console.error(error));

createOptionsSelect(
  null,
  ["Casos Confirmados", "Número de Mortes", "Casos Recuperados"],
  "dadosOptions"
);

function showPage(pageToShow) {
  const pages = [
    document.getElementById("homePage"),
    document.getElementById("paisPage"),
    document.getElementById("top5Page"),
  ];
  pages.forEach((page) => (page.style.display = "none"));

  pages[pageToShow].style.display = "flex";
}

function createKpis(totalConfirmed, totalDeaths, totalRecovered, date) {
  document.getElementById("totalConfirmados").innerHTML = totalConfirmed;
  document.getElementById("totalMortes").innerHTML = totalDeaths;
  document.getElementById("totalRecuperados").innerHTML = totalRecovered;
  document.getElementById(
    "dataAtualizacao"
  ).innerHTML = `Data de atualização: ${date}`;
}

function createPieChart(newConfirmed, newDeaths, newRecovered) {
  const data = {
    labels: ["Confirmados", "Recuperados", "Mortes"],
    datasets: [
      {
        label: "Dataset 1",
        data: [newConfirmed, newDeaths, newRecovered],
        backgroundColor: ["Pink", "Blue", "Orange"],
      },
    ],
  };

  new Chart(document.getElementById("chart-pie-covid"), {
    type: "pie",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  });
}

function createBarCharts(topTotalDeaths) {
  const data = {
    labels: topTotalDeaths.map((data) => data.Country),
    datasets: [
      {
        label: "Total Deaths",
        data: topTotalDeaths.map((data) => data.TotalDeaths),
        backgroundColor: "Blue",
      },
    ],
  };

  new Chart(document.getElementById("chart-bar-covid"), {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  });
}

function createLineChart(dailyData, startDate, endDate) {
  document.getElementById("chart-line-covid").remove();

  let canvas = document.createElement("canvas");
  canvas.id = "chart-line-covid";

  document.getElementById("chart-line-covid-wrapper").appendChild(canvas);

  const sum = dailyData.map((day) => day.Cases).reduce((a, b) => a + b, 0);
  const averageData = sum / dailyData.length;

  console.log(startDate, endDate);

  let startDateIndex = dailyData.findIndex(
    (day) =>
      day.Date.getDate() == startDate.getDate() &&
      day.Date.getMonth() == startDate.getMonth() &&
      day.Date.getFullYear() == startDate.getFullYear()
  );
  let endDateIndex = dailyData.findIndex(
    (day) =>
      day.Date.getDate() == endDate.getDate() &&
      day.Date.getMonth() == endDate.getMonth() &&
      day.Date.getFullYear() == endDate.getFullYear()
  );

  const data = {
    labels: dailyData
      .map(
        (day) =>
          `${day.Date.getDate()}/${
            day.Date.getMonth() + 1
          }/${day.Date.getFullYear()}`
      )
      .slice(startDateIndex, endDateIndex),
    datasets: [
      {
        label: "Número de Mortes",
        data: dailyData
          .map((day) => day.Cases)
          .slice(startDateIndex, endDateIndex),
        fill: false,
        borderColor: "red",
        tension: 0.1,
      },
      {
        label: "Média de Mortes",
        data: new Array(endDateIndex - startDateIndex).fill(averageData),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  new Chart(document.getElementById("chart-line-covid"), {
    type: "line",
    data: data,
  });
}

function getDates() {
  let startDateValue = document.getElementById("dataInicio").value;
  let endDateValue = document.getElementById("dataFim").value;
  document.getElementById("dataFim").min = startDateValue;

  console.log(startDateValue, endDateValue);

  if (startDateValue != "" && endDateValue != "")
    createLineChart(
      dailyData,
      new Date(startDateValue),
      new Date(endDateValue)
    );
}

function orderByDeaths(dataArray, sortBy) {
  return dataArray.sort((a, b) => b[sortBy] - a[sortBy]);
}

function createOptionsSelect(optionsCountry, options, selectId) {
  if (optionsCountry) {
    optionsCountry.forEach((optionSelect) => {
      let option = document.createElement("option");
      option.value = optionSelect.Slug;
      option.innerHTML = optionSelect.Country;
      option.innerHTML = option.innerHTML.replace("_", " ");

      document.getElementById(selectId).appendChild(option);
    });
  } else {
    options.forEach((optionSelect) => {
      let option = document.createElement("option");
      option.value = optionSelect;
      option.innerHTML = optionSelect;
      option.innerHTML = option.innerHTML.replace("_", " ");

      document.getElementById(selectId).appendChild(option);
    });
  }
}
