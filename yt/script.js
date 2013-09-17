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
              parse_data(data)+
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

function load_json(e) {
  if (e.value.length === 0) {
    $('#site_json_result textarea').text("");
    return false;
  }
  $.getJSON(e.value).done(function(data) {
    $('#site_json_result textarea').text(JSON.stringify(data, null, 4));
  }).fail(function(jqxhr, textStatus, error) {
    $('#site_json_result textarea').text(textStatus + ", " + error);
  });
};

function parse_data(data) {
  var result = [];
  $.each(data, function(k, v) {
    if (typeof v === "string") {
      result.push(render_string(k, v)); 
    } else if (Array.isArray(v)) {
      result.push(render_array(k, v)); 
    } else if (typeof v === "object"){
      result.push(render_object(k, v));
    } else {
      result.push(render_string(k, v)); 
    }
  });
  return result.join('');
}

function render_array(k, v) {
  var result = ['<div class="panel panel-default">',
  '<div class="panel-heading">',k,'</div>',
  '<div class="panel-body">', '<ul class="list-group">'];
  $.each(v, function(i, e) {
    result.push('<li class="list-group-item">');
    result.push(e);
    result.push('</li>');
  });
  result.push('</ul></div></div>');
  return result.join('');
}

function render_object(k, v) {
  var result = ['<div class="panel panel-default">',
  '<div class="panel-heading">',k,'</div>',
  '<div class="panel-body">', '<ul class="nav nav-tabs">'];
  var counter=0;
  $.each(v, function(i, e) {
    result.push('<li');
    if (counter === 0) {
      result.push(' active');
    }
    result.push('><a href="#'+i+'" data-toggle="tab">');
    result.push(i);
    result.push('</a></li>');
    counter++;
  });
  result.push('</ul><div class="tab-content">');
  counter=0;
  $.each(v, function(i, e) {
    result.push('<div class="tab-pane');
    if (counter === 0) {
      result.push(' active');
    }
    result.push('" id="'+i+'">');
    result.push(e);
    result.push('</div>');
    counter++;
  });
  result.push('</div></ul></div></div>');
  return result.join('');
}

function render_string(k, v) {
  return '<div class="well">'+k+': '+v+'</div>';
}