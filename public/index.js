// Create root/entry point for the react code


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('Service worker registered.', reg);
      });
  });
}

let transactions = [];
let myChart;

fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  // this function creates and populates a table row
  transactions.forEach(transaction => {
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

// Copies the array and reverses the objects
function populateChart() {
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // Creates date labels for charts and create the incremental values for the chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // incremental values function, if statement removes old chart if existing
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

    if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
      data: {
        labels,
        datasets: [{
            label: "Total Over Time",
            fill: true,
            backgroundColor: "#6666ff",
            data
        }]
    }
  });
}

function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");


  // if elset statement to validate and then create record
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  }
  else {
    errorEl.textContent = "";
  }

  // creates record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

  // if statement subtracting funds, change amount to a negative number.
  // transactions.unshift add to the beginning of the current array of data
  if (!isAdding) {
    transaction.value *= -1;
  }
// adding to beginning of array
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record

  // First re-run logic to populate the UI with the new record and also send it to the server

  populateChart();
  populateTable();
  populateTotal();
  
  // sending to server
  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
  .then(response => {    
    return response.json();
  })
  .then(data => {
    
    if (data.errors) {
      errorEl.textContent = "Missing Information";
    }

    // Make sure to clear the form!
    else {
      nameEl.value = "";
      amountEl.value = "";
    }
  })

  // in catch, if the fetch failed save in indexed db
  // CLEAR FORM!
  .catch(err => {
    saveRecord(transaction);

    nameEl.value = "";
    amountEl.value = "";
  });
}

document.querySelector("#add-btn").onclick = function() {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
  sendTransaction(false);
};
