


  // error and success message function 

function showMessageModal(message, isError) {
  const modal = $('#messageModal');
  const modalContent = modal.find('.modal-content');
  const messageContent = $('#messageContent');

  // Set the message and style based on whether it's an error or success
  messageContent.text(message);
  if (isError) {
      modalContent.removeClass('bg-success').addClass('bg-danger');
  } else {
      modalContent.removeClass('bg-danger').addClass('bg-success');
  }

  modal.modal('show');
  setTimeout(function () {
      modal.modal('hide');
  }, 2000); // Hide the modal after 2 seconds
}
  // Function to show the loading spinner
  function showLoadingSpinner() {
    $("#loadingSpinner").removeClass("d-none");
  }

  // Function to hide the loading spinner
  function hideLoadingSpinner() {
    $("#loadingSpinner").addClass("d-none");
  }

  // Function to handle API request success
  function handleSuccess(response) {
    // Store the token in local storage
    localStorage.setItem("teachablesadminaccesstoken", response.token);

    // Redirect to index.html
    window.location.href = "all_teachers.html";
  }

  // Function to handle API request error
  function handleError(error) {
    hideLoadingSpinner(); // Hide the loading spinner

    if (error.responseJSON && error.responseJSON.error) {
      // Display the specific error message from the server using Toastr
      showMessageModal(error.responseJSON.error, true);
    } else {
      // Generic error message
      showMessageModal("Login failed. Please try again.", true);
    }
  }

  $(document).ready(function () {
    $("#login-button").click(function (e) {
      e.preventDefault();

      // Get input values
      const email = $("input[name='email']").val();
      const password = $("input[name='password']").val();

      // Create the data object to send to the API
      const data = {
        email,
        password,
      };

      // Show the loading spinner before making the AJAX request
      showLoadingSpinner();

      // Make an AJAX POST request to your login API endpoint
      $.ajax({
        type: "POST",
        url: `${baseurl}/api/admin/login`,
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function (response) {
          // Handle success and hide the loading spinner
          handleSuccess(response);
        },
        error: function (error) {
          // Handle error and hide the loading spinner
          handleError(error);
        },
      });
    });
  });
