
function isAuthenticated() {
    return localStorage.getItem('teachablesadminaccesstoken') !== null;
  }
  
  function redirectToLogin() {
    window.location.href = 'login.html';
  }
  

  