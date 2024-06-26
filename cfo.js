function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get("name"),
    email: params.get("email"),
  };
}
function getDate() {
  const currentDate = new Date();

  // Get the current date components
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const day = currentDate.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const { name, email } = getQueryParams();

  document.getElementById("date").innerHTML = getDate();

  console.log("Name: ", name);
  console.log("Email: ", email);
  let fundsReceived,
    fundsSent,
    adviceSum,
    purchaseVoucher,
    taxAdviceRaised,
    previousDebtors,
    todayDebtors,
    previousCreditors,
    todayCreditors;

  const department = "cfo";
  document.getElementById('accountNumber').addEventListener("change", function(event){
    const selectedValue = event.target.value;
    fetch("http://127.0.0.1:3000/api/entries", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-email": email,
        "x-department": department,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const entries = document.getElementsByClassName("entries")[0];
        data.forEach((entry) => {
          if(entry.acc_number == selectedValue && getDate() == new Date(entry.entry_date).toLocaleDateString('en-CA')){
            let type = entry.type;
            let badgeNumber;
            switch (type) {
              case "funds received":
                badgeNumber = 1;
                fundsReceived = entry.amount;
                break;
              case "funds sent":
                badgeNumber = 2;
                fundsSent = entry.amount;
                break;
              case "Advice Sum":
                badgeNumber = 3;
                adviceSum = entry.amount;
                break;
              case "Purchase Voucher Sum":
                badgeNumber = 4;
                purchaseVoucher = entry.amount;
                break;
              case "Tax Advice Raised Sum":
                badgeNumber = 5;
                taxAdviceRaised = entry.amount;
                break;
              case "Previous Day Debtors":
                badgeNumber = 6;
                previousDebtors = entry.amount;
                break;
              case "Today's Debtors":
                badgeNumber = 7;
                todayDebtors = entry.amount;
                break;
              case "Previous Day Creditors":
                badgeNumber = 8;
                previousCreditors = entry.amount;
                break;
              case "Today's Creditors":
                badgeNumber = 9;
                todayCreditors = entry.amount;
                break;
            }
            const entryDiv = document.createElement("div");
            entryDiv.className = "entry";
            entryDiv.innerHTML = `
                    <div class="info">
                        <span class="badge">${badgeNumber}</span>
                        <div class="type">${entry.type}</div>
                        <div class="amount"><i class="fa-solid fa-indian-rupee-sign"></i> ${entry.amount} /-</div>
                    </div>
                    <div class="user"> ${entry.mailid} </div>
                `;
            // entryDiv.textContent = JSON.stringify(entry);
            entries.appendChild(entryDiv);
          }
  
          
        });
        document.getElementById(
          "debtor-change"
        ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${todayDebtors - previousDebtors
          } /-<span class="badge">7 - 6</span>`;
  
        document.getElementById(
          "creditor-change"
        ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${todayCreditors - previousCreditors
          } /-<span class="badge">9 - 8</span>`;
  
        document.getElementById(
          "outstanding-payables"
        ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${purchaseVoucher - fundsSent
          } /-<span class="badge">4 - 2</span>`;
  
        document.getElementById(
          "net-tax-liability"
        ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${taxAdviceRaised - adviceSum
          } /-<span class="badge">5 - 3</span>`;
      })
      .catch((error) => console.error("Error fetching entries:", error));
  });
});
