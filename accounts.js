function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get("name"),
    email: params.get("email"),
  };
}
function make_request(
  department,
  mailid,
  type,
  amount,
  entry_date,
  accountNumber
) {
  fetch("http://127.0.0.1:3000/api/entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({department ,mailid, type, amount, entry_date, accountNumber}),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || "Unknown error occurred");
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Entry added successfully:", data);
      // Handle the successful response, e.g., show a success message or redirect
    })
    .catch((error) => {
      console.error("Error adding entry:", error);
      // Handle errors, e.g., show an error message
    });
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
  const department = "accounts";
  document.getElementById("name").innerHTML = email;
  document.getElementById("email").innerHTML = name;
  document.getElementById("date").innerHTML = getDate();
  console.log(name, email, department);
  if (department === "cfo") {
    fetch("http://127.0.0.1:3000/api/entries", {
      method: "GET",
      headers: {
        "x-department": department,
        "x-email": email,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unauthorized");
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const entriesDiv = document.getElementById("entries");
          entriesDiv.innerHTML = "";
          data.forEach((entry) => {
            const entryElement = document.createElement("div");
            entryElement.textContent = `Type: ${entry.type}, Amount: ${entry.amount}, Date: ${entry.entry_date}`;
            entriesDiv.appendChild(entryElement);
          });
        } else {
          console.error("Data is not an array:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching entries:", error);
      });
  }

  document
    .getElementById("entryForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const accountNumber = document.getElementById("accountNumber").value;
      console.log(accountNumber);
      const entry_map = {
        "Advice Sum": document.getElementById("advice").value,
        "Purchase Voucher Sum":
          document.getElementById("purchase-voucher").value,
        "Tax Advice Raised Sum":
          document.getElementById("tax-advice-raised").value,
        "Previous Day Debtors":
          document.getElementById("debtors-previous").value,
        "Today's Debtors": document.getElementById("debtors-today").value,
        "Previous Day Creditors":
          document.getElementById("creditors-previous").value,
        "Today's Creditors": document.getElementById("creditors-today").value,
      };
      for (const key in entry_map) {
        if (entry_map.hasOwnProperty(key)) {
          try {
            make_request(
              department,
              email,
              key,
              entry_map[key],
              getDate(),
              accountNumber
            );
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Entry Made Successfully",
              customClass: {
                popup: "custom-popup",
                title: "custom-title",
                confirmButton: "custom-confirm-button",
              },
            });
            document.getElementById("advice").value = "";
            document.getElementById("purchase-voucher").value = "";
            document.getElementById("tax-advice-raised").value = "";
            document.getElementById("debtors-previous").value = "";
            document.getElementById("debtors-today").value = "";
            document.getElementById("creditors-previous").value = "";
            document.getElementById("creditors-today").value = "";
          } catch (e) {
            console.error("An error occurred while making the request: ", e);
            // Show error notification
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "An error occurred while making the entry",
            });
          }
        }
      }
    });
});
