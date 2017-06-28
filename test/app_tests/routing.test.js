var F = require('funcunit');
var QUnit = require('steal-qunit');

F.attach(QUnit);

QUnit.module('Extras: routing', {
	beforeEach() {
		F.open('../development.html');
	}
});

QUnit.test('App should route with hashtags', function(assert) {
	F('#goto-dashboard').click();

	F.add(function(){
		assert.equal(F.win.location.hash, '#!/dashboard', 'location.hash should contain a hashtag');
	});
});
