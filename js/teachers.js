

$(document).ready(function () {
    const token = localStorage.getItem("teachablesadminaccesstoken");

    // Function to initialize DataTable
    function initializeDataTable() {
        const table = $('#teachersDataTable').DataTable({
            columns: [
                { data: 'teacher_id' },
                { data: 'name' },
                { data: 'email' },
                {
                    data: 'created_at',
                    render: function (data, type, row) {
                        // Format the date using Moment.js
                        return moment(data).format('DD-MM-YYYY HH:mm a');
                    }
                },
                // {
                //     data: null,
                //     render: function (data, type, row) {
                //         return `<button class="btn btn-danger action-btn" data-teacher-id="${data.teacher_id}" data-action="delete">Delete</button>`;
                //     }
                // }
            ],
            order: [[0, 'desc']], // Sort by the first column (teacher_id) in descending order
        });

        return table;
    }

    // Function to load all teachers
    function loadAllTeachers() {
        // Show loader
        $('#loadingSpinner').removeClass('d-none');

        // Check if DataTable is already initialized
        const isDataTableInitialized = $.fn.DataTable.isDataTable('#teachersDataTable');

        // Destroy DataTable if already initialized
        if (isDataTableInitialized) {
            $('#teachersDataTable').DataTable().destroy();
        }

        // Fetch all teachers using AJAX
        $.ajax({
            url: `${baseurl}/api/admin/get-all-teachers`, 
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            dataType: 'json',
            success: function (response) {
                // Hide loader
                $('#loadingSpinner').addClass('d-none');

                if (response.teachers) {
                    // Initialize DataTable
                    const table = initializeDataTable();

                    // Add the fetched teachers to the DataTable
                    table.clear().rows.add(response.teachers).draw();
                } else {
                    console.error('Error fetching teachers');
                    // Show error message
                    showMessageModal('Error fetching teachers. Please try again.', true);
                }
            },
            error: function (error) {
                // Hide loader
                $('#loadingSpinner').addClass('d-none');

                console.error('Error fetching teachers', error);
                // Show error message
                showMessageModal('Error fetching teachers. Please try again.', true);
            }
        });
    }

    // Load all teachers when the page is ready
    loadAllTeachers();

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

    // Handle form submission for registering a new teacher
    $('#registerTeacherForm').submit(function (event) {
        event.preventDefault();

        // Show loader
        $('#loadingSpinner').removeClass('d-none');

        const formData = {
            name: $('#teacherName').val(),
            email: $('#teacherEmail').val(),
            password: $('#teacherPassword').val(),
        };

        // Make an AJAX request to register a new teacher
        $.ajax({
            url: `${baseurl}/api/admin/register-new-teacher`,
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
                $('#registerTeacherForm')[0].reset();
                $('#registerTeacherModal').modal('hide');

                // Reload the DataTable to reflect the new teacher
                loadAllTeachers();
            },
            error: function (error) {
                // Hide loader
                $('#loadingSpinner').addClass('d-none');

                // Show error message
                showMessageModal(error.responseJSON.error, true);
            }

            
        });
    });
    
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