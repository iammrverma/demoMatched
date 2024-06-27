function requestAccess(department, email) {
  fetch("http://127.0.0.1:3000/api/requestAccess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      department,
      email,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Request Sent",
          text: "Your access request has been sent successfully.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Request Failed",
          text: "Failed to send access request.",
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while sending the access request.",
      });
    });
}

document
.getElementById("loginForm")
.addEventListener("submit", function (event) {
  event.preventDefault();
  const department = document.querySelector(
    'input[name="department"]:checked'
  ).value;
  const email = document.getElementById("email").value;
  const name = document.getElementById("name").value;

  fetch("http://127.0.0.1:3000/api/verifyAccess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ department, email }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.accessGranted) {
        const departmentUrlMap = {
          finance: "finance.html",
          accounts: "accounts.html",
          cfo: "cfo.html",
        };
        // Redirect to the department page with email and name as query parameters
        window.location.href = `${
          departmentUrlMap[department]
        }?email=${encodeURIComponent(email)}&name=${encodeURIComponent(
          name
        )}`;
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unauthorized User",
          showCancelButton: true, // This shows the cancel button
          confirmButtonText: "Request Access", 
          cancelButtonText: "Cancel", 
          customClass: {
            popup: "custom-popup",
            title: "custom-title",
            confirmButton: "custom-confirm-button",
            cancelButton: "custom-cancel-button", // Add this if you want custom styling for the cancel button
          },
        }).then((result) => {
          if (result.isConfirmed) {
            console.log("made");
            requestAccess(department, email);
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            console.log("Access request was canceled.");
          }
        });
      }
    })
    .catch((error) => console.error("Error verifying access:", error));
});