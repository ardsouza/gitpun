var Promise = require('bluebird');
var db = require('../db/config');
var Repos = require('../db/collections/repos');
var Repo = require('../db/models/repo');
//var User = require('../db/models/user');
//var utils = require('../users/usersUtils');

var retrieveRepo = function(name, callback) {
  new Repo({
    full_name : name
  }).fetch().then(function(found) {
    if (found) {
      callback(null, found);
    } else {
      console.log('could not find repo in db: ', name);
      callback(null, null);
    }
  })
  .catch(function(error) {
    console.log('error:', error);
  });
};

var storeRepo = function(repo, callback) {
  var name = repo.name;
  var full_name = repo.full_name;
  var owner = repo.owner.login;

  new Repo({
    full_name: full_name
  }).fetch().then(function(found) {
    if (found) {
      callback(null, found);
      console.log('repo already found:', name);
    } else {
      var newRepo = new Repo({
        full_name: full_name,
        name: name,
        owner: owner
      });
      newRepo.id = null;
      console.log('new repo before saving: ', newRepo);
      newRepo.save().then(function(newRepo) {
        console.log('set 1')
        newRepo.id = full_name;
        callback(null, newRepo.attributes);
        Repos.add(newRepo);
        console.log('set 2')
      })
      .catch(function(error) {
        console.log('error:', error);
        callback(null, null);
      });
    }
  })
  .catch(function(error) {
    console.log('error:', error);
  });
};

module.exports = {
  //get a repo from DB by reponame with possible filters
  //retrieveRepos: function(name, callback) {
  //Repo
  //.where({owner: name})
  //.fetchAll().then(function(repos) {
  //if (found) {
  //callback(null, repos);
  //} else {
  //console.log('found no repos for: ', name);
  //callback(null, null);
  //}
  //})
  //.catch(function(error) {
  //console.log('error:', error);
  //});
  //},
  retrieveRepo: Promise.promisify(retrieveRepo),
  storeRepo: Promise.promisify(storeRepo)
  //store a new repo in DB https://developer.github.com/v3/repos/#get
};
