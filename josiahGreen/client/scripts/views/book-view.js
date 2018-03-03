'use strict';
var app = app || {};

(function(module) {
  $('.icon-menu').on('click', function(event) {
    $('.nav-menu').slideToggle(350);
  })

  function resetView() {
    $('.container').hide();
    $('.nav-menu').slideUp(350);
  }

  const bookView = {};

  bookView.initIndexPage = function(ctx, next) {
    resetView();
    $('.book-view').show();
    $('#book-list').empty();
    module.Book.all.map(book => $('#book-list').append(book.toHtml()));
    next()
  }

  bookView.initDetailPage = function(ctx, next) {
    resetView();
    $('.detail-view').show();
    $('.book-detail').empty();
    let template = Handlebars.compile($('#book-detail-template').text());
    $('.book-detail').append(template(ctx.book));

    $('#update-btn').on('click', function() {
      page(`/books/${$(this).data('id')}/update`);
    });

    $('#delete-btn').on('click', function() {
      module.Book.destroy($(this).data('id'));
    });
    next()
  }

  bookView.initCreateFormPage = function() {
    resetView();
    $('.create-view').show();
    $('#create-form').on('submit', function(event) {
      event.preventDefault();

      let book = {
        title: event.target.title.value,
        author: event.target.author.value,
        isbn: event.target.isbn.value,
        image_url: event.target.image_url.value,
        description: event.target.description.value,
      };

      module.Book.create(book);
    })
  }

  bookView.initUpdateFormPage = function(ctx) {
    resetView();
    $('.update-view').show()
    $('#update-form input[name="title"]').val(ctx.book.title);
    $('#update-form input[name="author"]').val(ctx.book.author);
    $('#update-form input[name="isbn"]').val(ctx.book.isbn);
    $('#update-form input[name="image_url"]').val(ctx.book.image_url);
    $('#update-form textarea[name="description"]').val(ctx.book.description);

    $('#update-form').on('submit', function(event) {
      event.preventDefault();

      let book = {
        book_id: ctx.book.book_id,
        title: event.target.title.value,
        author: event.target.author.value,
        isbn: event.target.isbn.value,
        image_url: event.target.image_url.value,
        description: event.target.description.value,
      };

      module.Book.update(book, book.book_id);
    })
  };

// DONE: What is the purpose of this method? This adds the search-form to be shown when bookView.initSearchFormPage is called. 
  bookView.initSearchFormPage = function() {
    resetView();
    $('.search-view').show();
    $('#search-form').on('submit', function(event) {
      // DONE: What default behavior is being prevented here? A page refresh. 
      event.preventDefault();

      // DONE: What is the event.target, below? What will happen if the user does not provide the information needed for the title, author, or isbn properties? It turns the input into a string instead of returning null if no answers are given. The event.target is the form that is rendered on the page, which will be filled in by the user. 
      let book = {
        title: event.target.title.value || '',
        author: event.target.author.value || '',
        isbn: event.target.isbn.value || '',
      };

      module.Book.find(book, bookView.initSearchResultsPage);

      // DONE: Why are these values set to an empty string? This clears the form after the form is submitted. 
      event.target.title.value = '';
      event.target.author.value = '';
      event.target.isbn.value = '';
    })
  }

  // DONE: What is the purpose of this method? This prevents the search list form duplicating it's results everytime it is invoked.
  bookView.initSearchResultsPage = function() {
    resetView();
    $('.search-results').show();
    $('#search-list').empty();

    // DONE: Explain how the .map() method is being used below. This returns and appends the books that have been requested from the API. 
    module.Book.all.map(book => $('#search-list').append(book.toHtml()));
    $('.detail-button a').text('Add to list').attr('href', '/');
    $('.detail-button').on('click', function(e) {
      // DONE: Explain the following line of code. I think this is traversing the DOM based on a specific book request based on its parent elements? That's my guess anyway.
      module.Book.findOne($(this).parent().parent().parent().data('bookid'))
    });
  }

  // DONE: Explain the following line of code. 
  // This gives "app" the ability to access bookview outside of this page. 
  module.bookView = bookView;
  
  // DONE: Explain the following line of code. This is the end of the IFFE where we pass in app as an argument. Again, this is so we can have access to bookView outside of this page.  
})(app)

