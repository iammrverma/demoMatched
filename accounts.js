function getDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); //zero-based months
  const day = currentDate.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", function () {
  
  function make_request(type, amount, entry_date, accountNumber) {
    const mailid = document.getElementById('amail').innerText;
    let localEntries = JSON.parse(localStorage.getItem(`${accountNumber}`)) || [];
    localEntries.push({ mailid, type, amount, entry_date, accountNumber });
    localStorage.setItem(`${accountNumber}`, JSON.stringify(localEntries));
  }
  document.getElementById("entryForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const accountNumber = document.getElementById("aAccountNumber").value;
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
      if (entry_map[key].length > 9) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Supported values upto 9 digits",
        });
        return;
      }
    }
    for (const key in entry_map) {
      if (entry_map.hasOwnProperty(key)) {
        try {
          make_request(key, entry_map[key], getDate(), accountNumber);
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
});