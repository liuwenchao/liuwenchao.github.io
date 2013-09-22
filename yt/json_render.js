var json_render = function(data) {
    this.properties;
    this.name;
    this.value;
    this.values =[];
    this.print = function() {
      return parse_data(data);
    }
}

//exports = module.exports = new json_render(data);

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
  return render(null, data, []);
}

function render(k, v, result) {
  if (typeof v === "string") {
    result.push(render_string(k, v)); 
  } else if (null === v) {
  } else if (Array.isArray(v)) {
    result.push(render_array(k, v)); 
  } else if (typeof v === "object"){
    result.push(render_object(k, v));
  } else {
    result.push(render_string(k, v)); 
  }
  return result.join('');

}
function render_array(k, v) {
  var result = ['<ul class="list-group">'];
  $.each(v, function(i, e) {
    result.push('<li class="list-group-item">');
    result.push(render(null, e, []));
    result.push('</li>');
  });
  result.push('</ul>');
  return result.join('');
}

function render_object(k, v) {
  if (k) {
    var result = ['<div class="panel panel-default">',
      '<div class="panel-heading">',sanitize(k),'</div>',
      '<div class="panel-body">', '<ul class="nav nav-tabs">'];
  } else {
    var result = ['<ul class="nav nav-tabs">'];
  }
  
  var counter=0;
  var token = Math.floor(Math.random() * 10000 + 100);
  $.each(v, function(i, e) {
    result.push('<li');
    if (counter === 0) {
      result.push(' class="active"');
    }
    result.push('><a href="#'+token + sanitize(i)+'" data-toggle="tab">');
    result.push(sanitize(i));
    result.push('</a></li>');
    counter++;
  });
  result.push('</ul><div class="tab-content">');
  counter=0;
  $.each(v, function(i, e) {
    result.push('<div class="tab-pane panel panel-default');
    if (counter === 0) {
      result.push(' active');
    }
    result.push('" id="'+token + sanitize(i)+'"><div class="panel-body">');
    result.push(render(null, e, []));
    result.push('</div></div>');
    counter++;
  });
  result.push('</div></div>');
  if (k) {
    result.push('</div></div>');
  }
  return result.join('');
}

function render_string(k, v) {
  if (k) {
    return '<li class="list-group-item">+'+ sanitize(k)+ ': '+ sanitize(v)+ '</li>';
  } else {
    return sanitize(v);
  }
}

function sanitize(str) {
  //FIXME not perfect.
  return $('<span/>').text(str).html();
  //return str;
}