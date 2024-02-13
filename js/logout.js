window.logout = async function() {
  // const baseUrl = config.baseUrl;
  const token = localStorage.getItem('teachablesadminaccesstoken');

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${baseurl}/api/teachers/teacher-logout`,
      type: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      success: function(data) {
        // Clear the JWT token from local storage
        localStorage.removeItem('teachablesadminaccesstoken');
        resolve(data);
      },
      error: function(error) {
        reject(error);
      }
    });
  });
};
