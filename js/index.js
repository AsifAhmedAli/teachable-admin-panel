$(document).ready(function () {
    // Check if a token is available in local storage
    const token = localStorage.getItem("admin_token");

    if (!token) {
        // If there is no token, redirect to the login page
        window.location.href = "login.html";
    } else {
        // Parse the JWT token to get its expiration date
        const tokenParts = token.split(".");
        if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const expirationTimestamp = payload.exp * 1000; // Convert expiration time to milliseconds

            // Check if the token has expired
            if (Date.now() > expirationTimestamp) {
                // If the token has expired, redirect to the login page
                window.location.href = "login.html";
            }
        } else {
            // If the token is invalid, redirect to the login page
            window.location.href = "login.html";
        }
    }
});

// error and success message function
function showMessageModal(message, isError) {
    const modal = $("#messageModal");
    const modalContent = modal.find(".modal-content");
    const messageContent = $("#messageContent");

    // Set the message and style based on whether it's an error or success
    messageContent.text(message);
    if (isError) {
        modalContent.removeClass("bg-success").addClass("bg-danger");
    } else {
        modalContent.removeClass("bg-danger").addClass("bg-success");
    }

    modal.modal("show");
    setTimeout(function () {
        modal.modal("hide");
    }, 2000); // Hide the modal after 2 seconds
}

$(document).ready(function () {
    const token = localStorage.getItem("admin_token");
    const table = $("#depositRequestsTable").DataTable({
        columns: [
            { data: "id" },
            { data: "user_id" },
            { data: "username" },
            { data: "balance" },
            { data: "amount" },
            { data: "status" },
            {
                data: null,
                render: function (data, type, row) {
                    const depositId = data.id;
                    const status = data.status;
                    const isDisabled = status === "completed" || status === "rejected" ? "disabled" : "";
                    const buttonText = status === "completed" ? "Approved" : "Approve";
                    const RejectbuttonText = status === "completed" ? "Rejected" : "Reject";
                    const userId = data.user_id; // Get the userId from the clicked user

                    return `<div class="d-flex justify-content-between">
                                <button class="btn btn-success approve-btn" data-id="${depositId}" ${isDisabled}>${buttonText}</button>
                                <button class="btn btn-success ml-2 reject-btn" data-id="${depositId}" ${isDisabled}>${RejectbuttonText}</button>
                                <button class="btn btn-primary ml-2 deposit-history-btn data-toggle="tooltip" data-placement="left" title="Deposit History"" data-user-id="${userId}">History</button>
                              </div>`;
                },
            },
        ],
        order: [[0, "desc"]],
    });

    // Show the loader when the page loads
    $("#loadingSpinner").removeClass("d-none");

    // Add click event listener for approval button
    $("#depositRequestsTable").on("click", ".approve-btn", function () {
        const depositId = $(this).data("id");
        const approveButton = $(this);

        // Show the amount modal
        $("#amountModal").modal("show");

        // Clear the input field for deposited amount
        $("#depositAmount").val("");

        // Handle confirm button click
        $("#confirmAmount")
            .off("click")
            .on("click", function () {
                const depositedAmount = parseFloat($("#depositAmount").val());

                $.ajax({
                    url: `${baseurl}/api/admin/update-user-balance/${depositId}`,
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    data: JSON.stringify({ depositedAmount }),
                    contentType: "application/json",
                    dataType: "json",
                    success: function (response) {
                        // Check if the response contains valid data
                        if (response && response.updatedBalance !== undefined) {
                            // Check if the request has already been approved
                            if (response.status === "completed") {
                                // Show error message for already approved request
                                showMessageModal(
                                    "This request has already been approved.",
                                    true
                                );
                            } else {
                                // Parse the updated balance as a decimal
                                const updatedBalance = parseFloat(response.updatedBalance);

                                if (!isNaN(updatedBalance)) {
                                    // Update balance and status in the DataTable
                                    const row = table.row(approveButton.closest("tr"));
                                    if (row && row.data()) {
                                        // Calculate the new balance by adding depositedAmount to the existing balance
                                        const currentBalance = parseFloat(row.data().balance);
                                        const newBalance = currentBalance + depositedAmount;

                                        row.data().balance = newBalance.toFixed(2); // Format as a decimal with 2 decimal places
                                        row.data().status = "completed";
                                        row.invalidate().draw(false);
                                        approveButton.attr("disabled", "disabled").text("Approved");

                                        // Show success message
                                        showMessageModal(
                                            `${response.message}, user new balance is ${response.updatedBalance}`,
                                            false
                                        );

                                        // Close the amount modal
                                        $("#amountModal").modal("hide");
                                    }
                                } else {
                                    // Show error message
                                    showMessageModal(
                                        "Error updating balance. Please try again.",
                                        true
                                    );
                                }
                            }
                        } else {
                            // Show error message
                            showMessageModal(
                                "Error updating balance. Please try again.",
                                true
                            );
                        }

                        // Hide the loader when processing is complete
                        $("#loadingSpinner").addClass("d-none");
                    },
                    error: function (error) {
                        // Hide the loader when an error occurs
                        $("#loadingSpinner").addClass("d-none");

                        // Show error message
                        showMessageModal(error.responseJSON.error, true);
                    },
                });
            });
    });

  // Add click event listener for rejection button
  $("#depositRequestsTable").on("click", ".reject-btn", function () {
    const depositId = $(this).data("id");
    const rejectButton = $(this);

    // Show the reject confirmation modal
    $("#rejectModal").modal("show");

    // Handle confirm rejection button click
    $("#confirmReject").off("click").on("click", function () {
        // Show loader while processing
        $("#loadingSpinner").removeClass("d-none");

        $.ajax({
            url: `${baseurl}/api/admin/reject-deposit-request/${depositId}`,
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            dataType: "json",
            success: function (response) {
                // console.log(response);

                if (response && response.message === "Deposit request rejected successfully") {
                    // Update the DataTable row
                    const row = table.row(rejectButton.closest("tr"));

                    if (row && row.data()) {
                        // Update the status and disable the button
                        row.data().status = "rejected";
                        row.invalidate().draw(false);
                        rejectButton.attr("disabled", "disabled").text("Rejected");

                        // Show success message
                        showMessageModal("Deposit request has been rejected.", false);

                        // Close the reject modal
                        $("#rejectModal").modal("hide");
                    }
                } else {
                    showMessageModal(response && response.message ? response.message : "Error rejecting deposit request. Please try again.", true);
                }
            },
            error: function (error) {
                // Show error message
                showMessageModal(error.responseJSON && error.responseJSON.error ? error.responseJSON.error : "An error occurred. Please try again.", true);
            },
            complete: function () {
                // Hide the loader when processing is complete
                $("#loadingSpinner").addClass("d-none");
            },
        });
    });
});




    

    

    // Add click event listener for "Deposit History" button
    $("#depositRequestsTable").on("click", ".deposit-history-btn", function () {
        const userId = $(this).data("user-id");

        // Show the loader while redirecting
        $("#loadingSpinner").removeClass("d-none");

        // Redirect to deposit_history.html with the userId
        window.location.href = `deposit_history.html?userId=${userId}`;
    });

    // Fetch deposit requests using AJAX
    function fetchDepositRequests() {
        $.ajax({
            url: `${baseurl}/api/admin/get-deposit-requests`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            dataType: "json",
            success: function (response) {
                if (response.total_requests && response.depositRequests) {
                    table.clear().rows.add(response.depositRequests).draw();

                    // Add filtering options
                    $("#filterSelect").on("change", function () {
                        const filterValue = $(this).val();
                        if (filterValue === "All") {
                            table.search("").draw();
                        } else {
                            table.column(5).search(filterValue).draw();
                        }
                    });

                    // Hide the loader when fetching is complete
                    $("#loadingSpinner").addClass("d-none");
                } else {
                    console.error("Error fetching deposit requests");
                }
            },
            error: function (error) {
                console.error("Error fetching deposit requests", error);

                // Hide the loader when an error occurs
                $("#loadingSpinner").addClass("d-none");
            },
        });
    }

    // Initial fetch of deposit requests
    fetchDepositRequests();
});

$(document).ready(function () {
    const token = localStorage.getItem("admin_token");

    // Function to get query parameters from the URL
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    // Extract the userId from the URL
    const userId = getParameterByName("userId");

    // Set the title dynamically
    $("#user").text(`Deposit history of User ${userId}`);

    // Make an AJAX request to fetch deposit history for the specific user
    $.ajax({
        url: `${baseurl}/api/admin/get-deposit-history/${userId}`,
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        dataType: "json",
        beforeSend: function () {
            // Show the loader before the API request is sent
            $("#loadingSpinner").removeClass("d-none");
        },
        success: function (response) {
            // Hide the loader when the API request is complete
            $("#loadingSpinner").removeClass("d-block").addClass("d-none");

            if (response.total_transactions && response.depositHistory) {
                // Initialize DataTable
                const depositHistoryTable = $("#depositHistoryTable").DataTable({
                    data: response.depositHistory,
                    columns: [
                        { data: "id" },
                        { data: "user_id" },
                        {
                            data: "timestamp",
                            render: function (data, type, row) {
                                return moment(data).format("YYYY-MM-DD HH:mm:ss"); // Adjust the format as needed
                            },
                        },
                        { data: "amount" },
                    ],
                });
            }
        },
        error: function (error) {
            // Hide the loader in case of an error
            $("#loadingSpinner").addClass("d-none");
            console.error("Error fetching deposit history", error);
        },
    });


});


