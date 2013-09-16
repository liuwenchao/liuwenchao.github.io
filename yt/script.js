;$(function() {
  var static = true; // if this is served via static sites.
  // inspiref from: https://github.com/pereorga/jQuery-Mobile-Phone-guide/
  var inc = 0;
  var count = 0;
  var pageSize = 10;
  var didScroll = false;
  var isEnd = false;
  var $input = $('#inputsearch');
  var $list = $('#list');

  function search_json(limit) {
    var async_check = limit || ++count;
    var url = 'products.json?from='+limit;
    var search = encodeURIComponent($input.val());
    if (search) {
      $('#myCarousel').hide();
      url += '&title=' + search;
    } else {
      $('#myCarousel').show();
    }

    $.getJSON(url, function(data) {
      var display = limit === 0 ? '>' : ' style="display:none">';
      var temp = '';
      var i = 0;
      if (data.length == 0) isEnd = true;
      $.each(data, function(key, val) {
        if (!search || !static || val.title.indexOf(search) === 0) {
          temp += template_row(val, display);
        }
        ++i;
      });
      if (limit === 0) {             // keyup
        if (async_check !== count) { // not the last keyup, quit
          return;
        }
        if (i === pageSize) {
            inc += pageSize;
            search_json(inc);
        }
        $list.html('');
      }
      $list.append(temp);
    });
    $('.span4:hidden').show(); // http://jsperf.com/hidden-selector-vs-other
  }

  $input.on('keyup change', function () {
    inc = 0;
    search_json(0);
  });

  $(window).scroll(function() {
    didScroll = true;
  });

  setInterval(function() {
    if (didScroll) {
      didScroll = false;
      if (!isEnd && $(window).scrollTop() && $(window).scrollTop() + 200 > $(document).height() - $(window).height()) {
        inc += pageSize;
        search_json(inc);
      }
    }
  }, 500);

  search_json(0);
  $input.focus();

  //
  //$('#site_json_example').popover();

});

function show_modal(url) {
  $.get(url, function(data) {
    $('<div class="modal" tabindex="-1" role="dialog" aria-labelledby="Product Detail" aria-hidden="true">'+
        '<div class="modal-dialog">'+
          '<div class="modal-content">'+
            '<div class="modal-header">'+
              '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
              '<h4 class="modal-title">'+data.title+'</h4>'+
            '</div>'+
            '<div class="modal-body">'+
              data.about+
            '</div>'+
            '<div class="modal-footer">'+
              '<img style="width:14px;margin-right:5px;" src="http://'+data.uri+'/favicon.ico" alt="Favicon" /><a href="http://'+data.uri+'" target="external">'+data.uri+'</a>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'
      ).modal();
  });
  return false;
};
