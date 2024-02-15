$(document).ready(function () {
    const token = localStorage.getItem("teachablesadminaccesstoken");

    // Function to initialize DataTable
    function initializeDataTable() {
        const table = $('#coursesDataTable').DataTable({
            columns: [
                { data: 'course_id' },
                { data: 'title' },
                {
                    data: 'created_at',
                    render: function (data, type, row) {
                        // Format the date using Moment.js
                        return moment(data).format('DD-MM-YYYY HH:mm a');
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `<button class="btn btn-primary action-btn" data-course-id="${data.course_id}" data-action="details">Details</button>`;
                    }
                }
            ],
            order: [[0, 'desc']], // Sort by the first column (course_id) in descending order
        });

        return table;
    }

    // Function to load all courses
    function loadAllCourses() {
        // Show loader
        $('#loadingSpinner').removeClass('d-none');

        // Check if DataTable is already initialized
        const isDataTableInitialized = $.fn.DataTable.isDataTable('#coursesDataTable');

        // Destroy DataTable if already initialized
        if (isDataTableInitialized) {
            $('#coursesDataTable').DataTable().destroy();
        }

        // Fetch all courses using AJAX
        $.ajax({
            url: `${baseurl}/api/admin/get-all-courses`, 
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            dataType: 'json',
            success: function (response) {
                console.log(response)
                // Hide loader
                $('#loadingSpinner').addClass('d-none');

                if (response.courses) {
                    // Initialize DataTable
                    const table = initializeDataTable();

                    // Add the fetched courses to the DataTable
                    table.clear().rows.add(response.courses).draw();
                } else {
                    console.error('Error fetching courses');
                    // Show error message
                    showMessageModal('Error fetching courses. Please try again.', true);
                }
            },
            error: function (error) {
                // Hide loader
                $('#loadingSpinner').addClass('d-none');

                console.error('Error fetching courses', error);
                // Show error message
                showMessageModal('Error fetching courses. Please try again.', true);
            }
        });
    }

    // Load all courses when the page is ready
    loadAllCourses();

    // Function to show success and error messages in a modal
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

    // Handle form submission for adding a new course
    $('#newCourseForm').submit(function (event) {
        event.preventDefault();

        // Show loader
        $('#loadingSpinner').removeClass('d-none');

        const formData = {
            title: $('#courseTitle').val(),
            description: $('#courseDescription').val(),
        };

        // Make an AJAX request to add a new course
        $.ajax({
            url: `${baseurl}/api/admin/create-course`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                // Hide loader
                $('#loadingSpinner').addClass('d-none');

                // Show success message
                showMessageModal(response.message, false);

                // Clear the form and close the modal
                $('#newCourseForm')[0].reset();
                $('#newCourseModal').modal('hide');

                // Reload the DataTable to reflect the new course
                loadAllCourses();
            },
            error: function (error) {
                // Hide loader
                $('#loadingSpinner').addClass('d-none');

                // Show error message
                showMessageModal(error.responseJSON.error, true);
            }
        });
    });

    // Handle details action for courses
    $('#coursesDataTable').on('click', '.action-btn[data-action="details"]', function () {
        const courseId = $(this).data('course-id');

        // Redirect to the course details page
        window.location.href = `course_details.html?courseId=${courseId}`;
    });

    // Function to show a confirmation modal
    function showConfirmationModal(message, confirmCallback) {
        const modal = $('#confirmationModal');
        const confirmationMessage = modal.find('.modal-body');
        const confirmButton = $('#confirmActionBtn');

        confirmationMessage.text(message);

        // Attach a one-time click event to the confirm button
        confirmButton.one('click', function () {
            // Hide the modal
            modal.modal('hide');
            // Execute the confirm callback
            confirmCallback();
        });

        modal.modal('show');
    }

    // ### Logout call
    $('#logout-button').click(async function() {
      
        // console.log("clicked")
        try {
          
          // Show loader
          $('#loader-container').removeClass('hidden');
          const response = await logout();
          // Hide loader
          $('#loader-container').addClass('hidden');
          // Handle logout success
          console.log('Logout successful:', response.message);
          // Redirect to login page
          window.location.href = 'login.html';
        } catch (error) {
          console.error('Error during logout:', error);
          // Hide loader in case of error
          $('#loader-container').addClass('hidden');
        }
      });
});


// Check authentication when the document is ready
$(document).ready(function () {
    if (!isAuthenticated()) {
      redirectToLogin();
    }
  });