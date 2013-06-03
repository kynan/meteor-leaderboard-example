// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  Session.set("sort_order", "score");
  Session.set("sort", {score: -1});
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: Session.get("sort")});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click input.remove': function () {
      Players.remove(Session.get("selected_player"));
    },
    'click input.sort': function () {
      if (Session.equals("sort_order", "name")) {
        Session.set("sort", {score: -1});
        Session.set("sort_order", "score");
      } else {
        Session.set("sort", {name: 1});
        Session.set("sort_order", "name");
      }
    },
    'click input.reset': function () {
      Players.find().forEach(function(player) {
        Players.update(player._id, {$set: {score: Math.floor(Random.fraction()*10)*5}});
      });
    },
    'submit form#addplayer': function(evt, template) {
      Players.insert({name: template.find("input#new-player").value, score: Math.floor(Random.fraction()*10)*5});
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}
