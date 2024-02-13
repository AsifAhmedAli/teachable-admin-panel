

        
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem("teachablesadminaccesstoken");
    // Get the courseId from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');

    // Fetch course details with videos using AJAX
    $.ajax({
        url: `${baseurl}/api/admin/get-course-details?courseId=${courseId}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        dataType: 'json',
        success: function (response) {
            console.log(response);

            if (response.course) {
                // Display course details

                // Iterate through videos and create video cards
                response.course.videos.forEach(function (video) {
                    const videoCard = `
                        <div class="card video-card">
                            <img src="./assets/thumbnail.jpg" class="card-img-top" alt="Video Thumbnail">
                            <div class="card-body">
                                <h5 class="card-title text-uppercase">${video.video_title}</h5>
                                <button class="btn btn-primary" data-video-url="${video.video_url}">Start Video</button>
                            </div>
                        </div>
                    `;

                    // Append the video card to the videoList
                    $('#videoList').append(videoCard);
                });

                // Handle video playback when clicking the "Play Video" button
                $('#videoList').on('click', 'button[data-video-url]', function () {
                    const videoUrl = $(this).data('video-url');

                    // Set the video source dynamically
                    const videoPlayer = document.getElementById('videoPlayer');
                    videoPlayer.src = videoUrl;

                    // Play the video
                    videoPlayer.play();

                    // Show the video player container
                    $('#videoPlayerContainer').show();
                });
            } else {
                console.error('Error fetching course details');
                // Show error message
                showMessageModal('Error fetching course details. Please try again.', true);
            }
        },
        error: function (error) {
            console.error('Error fetching course details', error);
            // Show error message
            showMessageModal('Error fetching course details. Please try again.', true);
        }
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

function closeVideoPlayer() {
    console.log("clicked")
    // Pause the video
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.pause();

    // Hide the video player container
    $('#videoPlayerContainer').hide();
}



// Check authentication when the document is ready
$(document).ready(function () {
    if (!isAuthenticated()) {
      redirectToLogin();
    }
  });