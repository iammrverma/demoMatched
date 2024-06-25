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

function make_request(department, mailid, type, amount, entry_date){
    fetch("http://127.0.0.1:3000/api/entries", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-department": department,
            "x-email": mailid,
        },
        body: JSON.stringify({
            department,
            mailid,
            type,
            amount,
            entry_date,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                console.log("Entry added successfully");
            } else {
                console.error("Error adding entry: ", data.error);
            }
        })
        .catch((error) => {
            console.error("Error adding entry", error);
        });
}

document.addEventListener("DOMContentLoaded", function () {
    const { name, email } = getQueryParams();
    const department = "finance";
    const entry_date = getDate();
    const mailid = email;
    document.getElementById("name").innerHTML = name;
    document.getElementById("email").innerHTML = email;
    document.getElementById("date").innerHTML = entry_date;

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
        .getElementById("received")
        .addEventListener("click", function (event) {
            event.preventDefault();
            const amountEle = document.getElementById("received-amount");
            const amount = amountEle.value;
            const type = "funds received";
            if (amount) {
                make_request(department, mailid, type, amount, entry_date);
                amountEle.value = "";
                
            } else {
                amountEle.focus();
            }
        });
    document
        .getElementById("sent")
        .addEventListener("click", function (event) {
            event.preventDefault();
            const amountEle = document.getElementById("sent-amount");
            const amount = amountEle.value;
            const type = "funds sent";
            if (amount) {
                make_request(department, mailid, type, amount, entry_date)
                amountEle.value = "";
            } else {
                amountEle.focus();
            }
        });
});
