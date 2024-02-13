$(document).ready(function () {
  const token = localStorage.getItem("admin_token");

  const certificateList = $("#certificateList");

  function fetchCertificates() {
    // Show loading spinner
    $("#loadingSpinner").removeClass("d-none");

    // Make an AJAX call to get certificates
    $.ajax({
      url: `${baseurl}/api/admin/get-all-certificates`,
      method: "GET",
      dataType: "json",
      success: function (response) {
        certificateList.empty(); // Clear existing list
        if (response.certificates) {
          response.certificates.forEach((certificate) => {
            const card = `
                            <div class="col-md-4">
                                <div class="card mb-4">
                                    <img src="${certificate.certificate_img_url}" class="card-img-top img-responsive" alt="Certificate Image" style="height:350px;">
                                    <div class="card-body d-flex justify-content-around">
                                        <button class="btn btn-primary editCertificateButton" data-certificate-id="${certificate.certificate_id}" data-toggle="modal" data-target="#editCertificateModal">Edit</button>
                                        <button class="btn btn-danger deleteCertificateButton" data-certificate-id="${certificate.certificate_id}" data-toggle="modal" data-target="#deleteCertificateModal">Delete</button>
                                    </div>
                                </div>
                            </div>
                        `;
            certificateList.append(card);
          });
        }
        // Hide loading spinner
        $("#loadingSpinner").addClass("d-none");
      },
      error: function (error) {
        console.error("Error fetching certificates", error);
        // Hide loading spinner
        $("#loadingSpinner").addClass("d-none");
      },
    });
  }

  // Fetch and populate certificates on page load
  fetchCertificates();

  // Add Certificate Button Click
  $("#addCertificateButton").click(function () {
    // Clear the form
    $("#addCertificateForm")[0].reset();
    $("#addCertificateModal").modal("show");
  });

  // Add Certificate Form Submission
  $("#addCertificateForm").submit(function (e) {
    e.preventDefault();
    const certificateImage = $("#certificateImage")[0].files[0];

    if (certificateImage) {
      const formData = new FormData();
      formData.append("certificateImage", certificateImage);

      // Show loading spinner
      $("#loadingSpinner").removeClass("d-none");

      // Make an AJAX call to add the certificate
      $.ajax({
        url: `${baseurl}/api/admin/add-certificate`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: formData,
        processData: false,
        contentType: false,
        dataType: "json",
        success: function (response) {
          $("#addCertificateModal").modal("hide");
          fetchCertificates(); // Refresh the certificate list
          showMessage("Certificate image added successfully.");
        },
        error: function (error) {
          showMessage(error.responseJSON.error, true);
        },
        complete: function () {
          // Hide loading spinner
          $("#loadingSpinner").addClass("d-none");
        },
      });
    }
  });

  // Edit Certificate Button Click
  certificateList.on("click", ".editCertificateButton", function () {
    const certificateId = $(this).data("certificate-id");

    // Show loading spinner
    $("#loadingSpinner").removeClass("d-none");

    // Fetch certificate data and populate the Edit Certificate modal
    $.ajax({
      url: `${baseurl}/api/admin/get-single-certificate/${certificateId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      dataType: "json",
      success: function (response) {
        // Populate the Edit Certificate form fields, including the certificate_image_url
        $("#editCertificateImagePreview").attr(
          "src",
          response.certificate.certificate_img_url
        );

        // Set the data-certificate-id attribute on the "Save Changes" button
        $("#editCertificateSubmitButton").data("certificate-id", certificateId);

        $("#editCertificateModal").modal("show");
      },
      error: function (error) {
        console.error("Error fetching certificate data", error);
      },
      complete: function () {
        // Hide loading spinner
        $("#loadingSpinner").addClass("d-none");
      },
    });
  });

  // Edit Certificate Form Submission (for image update)
  $("#editCertificateSubmitButton").click(function (e) {
    e.preventDefault();

    // Get certificate ID and new image data
    const certificateId = $(this).data("certificate-id");
    const certificateImage = $("#editCertificateImage")[0].files[0];

    if (certificateImage) {
      const formData = new FormData();
      formData.append("certificateImage", certificateImage);

      // Show loading spinner
      $("#loadingSpinner").removeClass("d-none");

      // Make an AJAX call to update the certificate image and other fields
      $.ajax({
        url: `${baseurl}/api/admin/edit-certificate/${certificateId}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: formData,
        processData: false,
        contentType: false,
        dataType: "json",
        success: function (response) {
          $("#editCertificateModal").modal("hide");
          fetchCertificates(); // Refresh the certificate list

          showMessage("Certificate image updated successfully.");
        },
        error: function (error) {
          console.error("Error updating certificate image", error);

          showMessage(error.responseJSON.error, true);
        },
        complete: function () {
          // Hide loading spinner
          $("#loadingSpinner").addClass("d-none");
        },
      });
    }
  });

  // Delete Certificate Button Click
  certificateList.on("click", ".deleteCertificateButton", function () {
    const certificateId = $(this).data("certificate-id");

    // Store the certificate ID to the Delete button
    $("#confirmDeleteCertificateButton").data("certificate-id", certificateId);

    $("#deleteCertificateModal").modal("show");
  });

  // Confirm Delete Certificate Button Click
  $("#confirmDeleteCertificateButton").click(function () {
    const certificateId = $(this).data("certificate-id");

    // Show loading spinner
    $("#loadingSpinner").removeClass("d-none");

    // Make an AJAX call to delete the certificate
    $.ajax({
      url: `${baseurl}/api/admin/delete-certificate/${certificateId}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      dataType: "json",
      success: function (response) {
        $("#deleteCertificateModal").modal("hide");
        fetchCertificates(); // Refresh the certificate list

        showMessage("Certificate image deleted successfully.");
      },
      error: function (error) {
        console.error("Error deleting certificate", error);

        showMessage(error.responseJSON.error, true);
      },
      complete: function () {
        // Hide loading spinner
        $("#loadingSpinner").addClass("d-none");
      },
    });
  });

  // Function to show success or error messages using the messageModal
  function showMessage(message, isError = false) {
    const messageModal = $("#messageModal");
    const messageContent = $("#messageContent");

    messageContent.text(message);

    if (isError) {
      messageContent.removeClass("text-success").addClass("text-danger");
    } else {
      messageContent.removeClass("text-danger").addClass("text-success");
    }

    messageModal.modal("show");
  }
});
