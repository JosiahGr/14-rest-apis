'use strict';

var app = app || {};

(function (module) {
  const adminView = {};

  adminView.initAdminPage = function (ctx, next) {
    $('.nav-menu').slideUp(350);
    $('.admin-view').show();

    $('#admin-form').on('submit', function(event) {
      event.preventDefault();
      let token = event.target.passphrase.value;

      // DONE: Is the token cleared out of local storage? Do you agree or disagree with this structure? The token should not be stored in local storage, you could easily change this to "true" in the console without credentials so... that's not exactly secure because anyone who knew even a little bit of javascript could change it in the browser console. 
      $.get(`${__API_URL__}/api/v1/admin`, {token})
        .then(res => {
          localStorage.token = true;
          page('/');
        })
        .catch(() => page('/'));
    })
  };

  adminView.verify = function(ctx, next) {
    if(!localStorage.token) $('.admin').addClass('admin-only');
    else $('.admin').show();
    next();
  }

  module.adminView = adminView;
})(app)