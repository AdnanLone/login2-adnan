var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt-nodejs');


var fs = require('fs');
var index = fs.readFileSync(__dirname +'/public/register.html');

var http=require('http');

var app = express();
var PORT = process.env.PORT || 3000;
var path = require('path');

app.use(bodyParser.json());
//app.use(express.static(__dirname + '/public'));

/**
http.createServer(function (req, res) {
  //res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(index);
}).listen(9615);
*/

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/register.html'));
});
	
//register


app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});


// POST /users/login
app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	if (typeof body.email !== 'string' || typeof body.password !== 'string') {
		return res.status(400).send();
	}

	db.user.findOne({
		where: {
			email: body.email
		}
	}).then(function (user) {
		if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
			return res.status(401).send();
		}

		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(500).send();
	});
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});