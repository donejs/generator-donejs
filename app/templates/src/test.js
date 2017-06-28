var F = require('funcunit');
var QUnit = require('steal-qunit');

require('<%= name %>/models/test');

F.attach(QUnit);

QUnit.module('<%= name %> functional smoke test', {
  beforeEach() {
    F.open('./development.html');
  }
});

QUnit.test('<%= name %> main page shows up', function() {
  F('title').text('<%= name %>', 'Title is set');
});
