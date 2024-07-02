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
  const token = localStorage.getItem("token");
  if(!token) window.location.href = "login.html";

  const decodedToken = jwt_decode(token);
  const email = decodedToken.email;

  document.getElementById("email").innerHTML = email;

  document.getElementById("entryForm").addEventListener("submit", function (event) {
      event.preventDefault();
      const accountNumber = document.getElementById("accountNumber").value;
      const entry_map = {
        "Advices Updated": document.getElementById("advice-updated").value,
        "Purchase Voucher Sum":
          document.getElementById("purchase-voucher").value,
        "Tax Invoices":
          document.getElementById("tax-invoice").value,
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
            make_request("accounts",email,key,entry_map[key],getDate(),accountNumber);
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
            document.getElementById("advice-updated").value = "";
            document.getElementById("purchase-voucher").value = "";
            document.getElementById("tax-invoice").value = "";
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

    function make_request(department, mailid, type, amount, entry_date, accountNumber) {
      fetch("http://127.0.0.1:3000/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ department, mailid, type, amount, entry_date, accountNumber }),
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
        })
        .catch((error) => {
          console.error("Error adding entry:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "An error occurred while making the entry",
          });
        });
    }
});
