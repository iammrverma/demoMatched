function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
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

document.addEventListener("DOMContentLoaded", function () {
  const { email } = getQueryParams();
  const department = "finance";
  const entry_date = getDate();
  document.getElementById("email").innerHTML = email;
  document.getElementById("date").innerHTML = entry_date;

  document
    .getElementById("fundsForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const fundsReceived = document.getElementById("fundsReceived").value;
      const fundsSent = document.getElementById("fundsSent").value;
      const accountNumber = document.getElementById("accountNumber").value;
      console.log(fundsReceived, fundsSent, accountNumber);
      try {
        make_request(
          department,
          email,
          "Funds Received",
          fundsReceived,
          getDate(),
          accountNumber
        );
        make_request(
          department,
          email,
          "Funds Sent",
          fundsSent,
          getDate(),
          accountNumber
        );
        // Show success notification
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
        document.getElementById("fundsReceived").value = "";
        document.getElementById("fundsSent").value = "";
      } catch (e) {
        console.error("An error occurred while making the request: ", e);
        // Show error notification
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while making the entry",
        });
      }
    });
});
