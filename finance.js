function getDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const day = currentDate.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html"; 
  }

  const decodedToken = jwt_decode(token);
  const email = decodedToken.email;
  
  document.getElementById("email").innerHTML = email;

  document.getElementById("fundsForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const fundsReceived = document.getElementById("fundsReceived").value;
    const fundsSent = document.getElementById("fundsSent").value;
    const accountNumber = document.getElementById("accountNumber").value;

    make_request(email, "funds received", fundsReceived, getDate(), accountNumber);
    make_request(email, "funds sent", fundsSent, getDate(), accountNumber);
  });

  function make_request(mailid, type, amount, entry_date, accountNumber) {
    fetch("http://127.0.0.1:3000/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({mailid, type, amount, entry_date, accountNumber }),
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
        document.getElementById("fundsReceived").value = "";
        document.getElementById("fundsSent").value = "";
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


