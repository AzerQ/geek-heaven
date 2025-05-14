/**
 * Инициализация и управление диаграммами в профиле пользователя
 */

// Инициализация диаграммы типов контента
function initContentTypeChart(data) {
  const ctx = document.getElementById("contentTypeChart").getContext("2d");
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Фильмы", "Сериалы", "Игры", "Книги"],
      datasets: [
        {
          data: [
            data.moviesCount,
            data.seriesCount,
            data.gamesCount,
            data.booksCount,
          ],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            font: {
              size: 14,
            },
          },
        },
        title: {
          display: false,
        },
      },
      cutout: "70%",
    },
  });
}

// Инициализация диаграммы жанров
function initGenreChart(data) {
  const ctx = document.getElementById("genreChart").getContext("2d");
  const sortedGenres = data.sort((a, b) => b.count - a.count).slice(0, 10);

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: sortedGenres.map((genre) => genre.name),
      datasets: [
        {
          label: "Количество",
          data: sortedGenres.map((genre) => genre.count),
          backgroundColor: "#36A2EB",
          borderRadius: 5,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            display: false,
          },
        },
        y: {
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

const waitForElement = (selector, callback) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.matches && node.matches(selector)) {
          callback(node);
          observer.disconnect();
        }
        else if ('querySelector' in node && node.querySelector(selector)) {
          callback(node.querySelector(selector));
          observer.disconnect();
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

waitForElement("#contentStats", (contentStats) => {
  const contentStatsData = JSON.parse(contentStats.dataset.stats);
  initContentTypeChart(contentStatsData);
});
waitForElement("#genreStats", (genreStats) => {
  const genreStatsData = JSON.parse(genreStats.dataset.stats);
  initGenreChart(genreStatsData);
});
