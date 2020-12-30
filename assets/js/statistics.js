// var c_revenue = document.getElementById("chart_revenue").getContext('2d');
// var chart_revenue = new Chart(c_revenue, {
//   type: 'bar',
//   data: {
//     labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
//     datasets: [{
//       label: '# of Votes',
//       data: [12, 45, 19, 3, 5, 2, 3],
//       backgroundColor: [
//         'rgba(255, 99, 132, 0.2)',
//         'rgba(54, 162, 235, 0.2)',
//         'rgba(255, 206, 86, 0.2)',
//         'rgba(75, 192, 192, 0.2)',
//         'rgba(153, 102, 255, 0.2)',
//         'rgba(255, 159, 64, 0.2)'
//       ],
//       borderColor: [
//         'rgba(255,99,132,1)',
//         'rgba(54, 162, 235, 1)',
//         'rgba(255, 206, 86, 1)',
//         'rgba(75, 192, 192, 1)',
//         'rgba(153, 102, 255, 1)',
//         'rgba(255, 159, 64, 1)'
//       ],
//       borderWidth: 1
//     }]
//   },
//   options: {
//     scales: {
//       yAxes: [{
//         ticks: {
//           beginAtZero: true
//         }
//       }]
//     }
//   }
// });

// pie chart Staff
var c_staff = document.getElementById("chart_number_staff").getContext('2d');
var chart_number_staff = new Chart(c_staff, {
  plugins: [ChartDataLabels],
  type: 'pie',
  data: {
    labels: ["Managers", "Chefs", "Waiters", "Directors"],
    datasets: [{
      data: [12, 130, 120],
      backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360"],
      hoverBackgroundColor: ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5", "#616774"]
    }]
  },
  options: {
    responsive: true,
    legend: {
      position: 'right',
      labels: {
        padding: 20,
        boxWidth: 10
      }
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          let sum = 0;
          let dataArr = ctx.chart.data.datasets[0].data;
          dataArr.map(data => {
            sum += data;
          });
          let percentage = (value * 100 / sum).toFixed(2) + "%";
          return percentage;
        },
        color: 'white',
        labels: {
          title: {
            font: {
              size: '16'
            }
          }
        }
      }
    }
  }
});


var c_orders = document.getElementById("chart_orders").getContext('2d');
var chart_orders = new Chart(c_orders, {
  type: 'bar',
  data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [{
      label: '# of Orders',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: 'green',
      borderColor: 'green',
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }
});

function load_statistics(url, next) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      //next(this.responseText)
      next(JSON.parse(this.responseText))
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}


function update_table_staff(data) {
  document.getElementById("data_staff_managers").innerHTML = data[0];
  document.getElementById("data_staff_chefs").innerHTML = data[1];
  document.getElementById("data_staff_waiters").innerHTML = data[2];
  document.getElementById("data_staff_directors").innerHTML = data[3];
  document.getElementById("data_staff_total").innerHTML = data[4];
}

function fetch_staffnumbers() {
  console.log('fetch')
  var branch_sel = document.getElementById('select_staff_branchno').value
  console.log(branch_sel)
  load_statistics("/statistics/staff/branch/" + branch_sel,
    (stat) => {
      console.log(stat)
      update_table_staff(stat)
      stat.pop()
      staffnumbers = stat
      chart_number_staff.data.datasets[0].data = staffnumbers;
      chart_number_staff.update();
    })
}

function fetch_orders() {
  var branch_sel = document.getElementById('select_orders_branchno').value
  var time_sel = document.getElementById('select_orders_time').value
  var period = time_sel.substr(3)
  var interval = time_sel.substr(0,2)
  console.log(period)
  console.log(interval)
  load_statistics("/statistics/orders/branch/" + branch_sel + "/period/" + period + "/" + interval,
(stat) => {
  console.log(stat)
  chart_orders.data.datasets[0].data = stat.data
  chart_orders.data.labels = stat.labels
  chart_orders.update()
})
}

// onload
fetch_orders()
fetch_staffnumbers()
