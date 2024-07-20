document.addEventListener("DOMContentLoaded", function () {
  let fundsReceived = 0,
    fundsSent = 0,
    adviceUpdated = 0,
    purchaseVoucher = 0,
    taxInvoices = 0,
    previousDebtors = 0,
    todayDebtors = 0,
    previousCreditors = 0,
    todayCreditors = 0;

  document.getElementById("cfoAccountNumber").addEventListener("change", function (event) {
    const selectedValue = event.target.value;
    const debtorChange = document.getElementById("debtor-change");
    const creditorChange = document.getElementById("creditor-change");
    const netDifferencePayable = document.getElementById("net-difference-payables");
    const netDifferenceReceivable = document.getElementById("net-difference-receivables");
    const entries = document.getElementById("entries");
    const loadingContainer = document.createElement('div');
    const bar = document.createElement('div');
    const entriesObj = {};
    loadingContainer.classList.add("loadingContainer");
    bar.id = "bar";
    loadingContainer.appendChild(bar);
    entries.innerHtml = "";
    entries.innerText = "";
    entries.appendChild(loadingContainer);
    let count = 0;
    setTimeout(() => {
      entries.innerHTML = "";
      const localEntries = JSON.parse(localStorage.getItem(`${selectedValue}`)) || [];
      localEntries.forEach((entry) => {
        entriesObj[entry.type] = [entry.amount, entry.mailid];
        count++;
      });
      if (count) {
        Object.entries(entriesObj).forEach(([key, value]) => {
          const type = key;
          const amount = value[0];
          const mailid = value[1];
          switch (type) {
            case "Funds Received":
              fundsReceived = amount;
              break;
            case "Funds Sent":
              fundsSent = amount;
              break;
            case "Advices Updated":
              adviceUpdated = amount;
              break;
            case "Purchase Voucher Sum":
              purchaseVoucher = amount;
              break;
            case "Tax Invoices":
              taxInvoices = amount;
              break;
            case "Previous Day Debtors":
              previousDebtors = amount;
              break;
            case "Today's Debtors":
              todayDebtors = amount;
              break;
            case "Previous Day Creditors":
              previousCreditors = amount;
              break;
            case "Today's Creditors":
              todayCreditors = amount;
              break;
          }

          const entryDiv = document.createElement("div");
          entryDiv.className = "entry";
          entryDiv.innerHTML = `
                <div class="type">${key}(<i class="fa-solid fa-indian-rupee-sign"></i>)</div>
                <div class="amount">${amount} /-</div>
                <div class="user"> ${mailid} </div>
              `;
          entries.appendChild(entryDiv);
        });
        debtorChange.innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${todayDebtors - previousDebtors
          } /-`;
        creditorChange.innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${todayCreditors - previousCreditors
          } /-`;
        netDifferencePayable.innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${purchaseVoucher - fundsSent
          } /-`;
        netDifferenceReceivable.innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${taxInvoices - adviceUpdated
          } /-`;
      } else {
        entries.innerHTML = "empty";
        debtorChange.innerHTML = "---";
        creditorChange.innerHTML = "---";
        netDifferencePayable.innerHTML = "---";
        netDifferenceReceivable.innerHTML = "---";
      }
    }, 1000);

  });

  document.getElementById("gear").addEventListener("click", function () {
    const notificationBox = document.getElementById("notification");
    const header = document.getElementById("header");
    const financeUsers = document.getElementById("financeUsers");
    const accountsUsers = document.getElementById("accountsUsers");

    notificationBox.classList.add("open");
    header.style.display = "flex";

    financeUsers.innerHTML = "";
    accountsUsers.innerHTML = "";
    const data = [
      {id:1, email:"abc@example.com", department:"finance"},
      {id:2, email:"abc@example.com", department:"finance"},
      {id:3, email:"abc@example.com", department:"finance"},
      {id:4, email:"abc@example.com", department:"accounts"},
      {id:5, email:"abc@example.com", department:"accounts"},
      {id:6, email:"abc@example.com", department:"accounts"},
      {id:7, email:"abc@example.com", department:"accounts"},
    ]
    data.forEach((user) => {
      const userEle = document.createElement("div");
      userEle.className = "userEle";
      userEle.innerHTML = `
            <div class="userEmail">${user.email}</div>
            <span class="del" data-id="${user.id}"><i class="fa-solid fa-xmark"></i></span>
          `;

      if (user.department === "finance") {
        financeUsers.appendChild(userEle);
      } else if (user.department === "accounts") {
        accountsUsers.appendChild(userEle);
      }

      // Add event listener to the delete button
      userEle.querySelector(".del").addEventListener("click", function () {
        const userId = this.getAttribute("data-id");
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "User deleted successfully",
          customClass: {
            popup: "custom-popup",
            title: "custom-title",
            confirmButton: "custom-confirm-button",
          },
        });
        userEle.remove();
      });
    });

    // Add the plus icons with event listeners
    const financePlusIcon = document.createElement("div");
    financePlusIcon.innerHTML = `<i class="fa-solid fa-plus"></i>`;
    financePlusIcon.addEventListener("click", () => {
      Swal.fire({
        title: "Add Finance Access",
        html: `
              <input type="text" id="addUserEmail" class="swal2-input" placeholder="Email">
              <input type="password" id="addUserPassword" class="swal2-input" placeholder="Password">
            `,
        showCancelButton: true,
        confirmButtonText: "Add",
        cancelButtonText: "Cancel",
        preConfirm: () => {
          const addUserEmail =
            Swal.getPopup().querySelector("#addUserEmail").value;
          const addUserPassword =
            Swal.getPopup().querySelector("#addUserPassword").value;
          if (!addUserEmail || !addUserPassword) {
            Swal.showValidationMessage(
              `Please enter both email and password`
            );
          }
          return { email: addUserEmail, password: addUserPassword };
        },
        customClass: {
          popup: "custom-popup",
          title: "custom-title",
          confirmButton: "custom-confirm-button",
          cancelButton: "custom-cancel-button",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const { email, password } = result.value;
          const userDepartment = "finance";
          Swal.fire({
            icon: "success",
            title: "Added",
            text: "User added successfully",
            customClass: {
              popup: "custom-popup",
              title: "custom-title",
              confirmButton: "custom-confirm-button",
            },
          });
          const userEle = document.createElement("div");
          userEle.className = "userEle";
          userEle.innerHTML = `
                <div class="userEmail">${email}</div>
                <span class="del" data-id="${data.id}"><i class="fa-solid fa-xmark"></i></span>
              `;
          financeUsers.appendChild(userEle);
        }
      });
    });
    financeUsers.appendChild(financePlusIcon);

    const accountsPlusIcon = document.createElement("div");
    accountsPlusIcon.innerHTML = `<i class="fa-solid fa-plus"></i>`;
    accountsPlusIcon.addEventListener("click", () => {
      Swal.fire({
        title: "Add Accounts Access",
        html: `
              <input type="text" id="addUserEmail" class="swal2-input" placeholder="Email">
              <input type="password" id="addUserPassword" class="swal2-input" placeholder="Password">
            `,
        showCancelButton: true,
        confirmButtonText: "Add",
        cancelButtonText: "Cancel",
        preConfirm: () => {
          const addUserEmail =
            Swal.getPopup().querySelector("#addUserEmail").value;
          const addUserPassword =
            Swal.getPopup().querySelector("#addUserPassword").value;
          if (!addUserEmail || !addUserPassword) {
            Swal.showValidationMessage(
              `Please enter both email and password`
            );
          }
          return { email: addUserEmail, password: addUserPassword };
        },
        customClass: {
          popup: "custom-popup",
          title: "custom-title",
          confirmButton: "custom-confirm-button",
          cancelButton: "custom-cancel-button",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const { email, password } = result.value;
          const userDepartment = "accounts";
          Swal.fire({
            icon: "success",
            title: "Added",
            text: "User added successfully",
            customClass: {
              popup: "custom-popup",
              title: "custom-title",
              confirmButton: "custom-confirm-button",
            }
          });
          const userEle = document.createElement("div");
          userEle.className = "userEle";
          userEle.innerHTML = `
                    <div class="userEmail">${email}</div>
                    <span class="del" data-id="${data.id}"><i class="fa-solid fa-xmark"></i></span>
                  `;
          accountsUsers.appendChild(userEle);
        }
      });
    });
    accountsUsers.appendChild(accountsPlusIcon);

    document.querySelector("#gear").classList.add("hidden");
    document.querySelector("#allUsers").style.display = "grid";

    document.getElementById("close").addEventListener("click", () => {
      const notificationBox = document.getElementById("notification");
      const header = document.getElementById("header");
      notificationBox.classList.remove("open");
      header.style.display = "none";

      document.getElementById("gear").classList.remove("hidden");
      document.querySelector("#allUsers").style.display = "none";
    });
  });
});