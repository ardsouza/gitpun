var utils = require('./reposUtils');
var request = require('request');
var Promise = require('bluebird');
var fs = require('fs');

var accessToken;
(function getAccessToken() {
  if (accessToken) return;
  fs.readFile('client/secret.json', function(err, data) {
    data = JSON.parse(data.toString());
    //console.log('data: ', data);
    accessToken = data.github_token;
  });
})();
module.exports = {
  getRepo: function(req, res) {
    var user = req.params.user;
    var repo = req.params.repo;

    var R = Promise.promisify(utils.retrieveRepo);
    R(user + '/' + repo).then(function(dbRepo) {
      if (dbRepo) {
        res.json(dbRepo.attributes);
      } else {
        //TODO oauth token
        var options = {
          url: 'https://api.github.com/repos/' + user + '/' + repo,
          //oauth: {token: accessToken},
          headers: {
            'User-Agent': 'http://developer.github.com/v3/#user-agent-required'
          },
          qs: {access_token: accessToken}
        };
        console.log('repo not in db, sending github request');
        console.log('options: ', options);

        request(options, function(error, response, body) { //TODO replace request, maybe use github api? or just plan http.get
          console.log('Github Response: ', response.body);
          var A = Promise.promisify(utils.storeRepo);
          A(JSON.parse(response.body)).then(function(data) {
            if (data) {
              res.json(data);
            } else {
              res.status(500).end();
            }
          })
          .catch(function(error) {
            console.log('error storing repo: ', error);
          });
        });
      }
    })
    .catch(function(error) {
      console.log('error retrieving repo: ', error);
    });
  }
  //,

  //getRepos: function(req, res) {
  //var user = req.params.user;

  //var R = Promise.promisify(utils.retrieveRepos);
  //R(user).then(function(repos) {
  //if (repos) {
  //res.json(repos);
  //} else { //try Github?
  //res.status(500).end();
  //}
  //})
  //.catch(function(error) {
  //console.log('controller error: ', error);
  //});
  //},
};
