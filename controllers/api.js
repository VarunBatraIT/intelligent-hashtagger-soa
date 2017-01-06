(function() {
  var Api, _, pos, stopwords, tagger,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  pos = require('pos');

  tagger = new pos.Tagger();

  _ = require('lodash');

  stopwords = require('stopwords').english;

  Api = (function() {
    function Api() {}

    Api.removeHash = function() {
      var sentence;
      sentence = this.req.query["sentence"] || "";
      sentence = Api.oRemoveHash(sentence);
      return this.json({
        sentence: sentence
      });
    };

    Api.addHash = function(total) {
      var sentence;
      if (total == null) {
        total = -1;
      }
      console.log(total);
      sentence = this.req.query["sentence"] || "";
      sentence = Api.oAddHash(sentence, total);
      return this.json({
        sentence: sentence
      });
    };

    Api.oRemoveHash = function(sentence) {
      var words;
      words = sentence.split(' ');
      words = _.map(words, function(word) {
        if (word.indexOf('#') === 0) {
          word = word.substring(1, _.size(word));
        }
        return word;
      });
      return words.join(' ');
    };

    Api.onlyWord = function(word) {
      return word.replace(/\W/g, '');
    };

    Api.oAddHash = function(sentence, total) {
      var hashedSentence, limit, nwords, priorityHashes, totalHashed, whereToPutHash, words;
      if (total == null) {
        total = -1;
      }
      totalHashed = 0;
      limit = true;
      if (total === -1) {
        limit = false;
      }
      sentence = Api.oRemoveHash(sentence);
      nwords = sentence.split(' ');
      words = tagger.tag(new pos.Lexer().lex(sentence));
      whereToPutHash = {};
      _.each(nwords, function(nword) {
        whereToPutHash[Api.onlyWord(nword)] = false;
        return true;
      });
      priorityHashes = ["NNP", "NN", "NNS", "FW", "JJ", "VBG", "VBZ", "VB", "VBP"];
      _.each(priorityHashes, function(priorityHash) {
        return _.each(words, function(wordGroup) {
          var ref, type, word;
          word = wordGroup[0];
          type = wordGroup[1];
          if (priorityHash === type && (ref = word.toLowerCase(), indexOf.call(stopwords, ref) < 0)) {
            if (!limit) {
              whereToPutHash[Api.onlyWord(word)] = true;
            } else if (limit && totalHashed < total) {
              totalHashed++;
              whereToPutHash[Api.onlyWord(word)] = true;
            }
          }
          return true;
        });
      });
      hashedSentence = [];
      _.each(nwords, function(word) {
        if (whereToPutHash[Api.onlyWord(word)] === true) {
          word = "#" + word;
        }
        hashedSentence.push(word);
        return true;
      });
      hashedSentence = hashedSentence.join(' ');
      console.log(sentence);
      console.log(hashedSentence);
      return hashedSentence;
    };

    return Api;

  })();

  exports.install = function() {
    F.route('/api/add/{total}/hash/json', Api.addHash);
    F.route('/api/add/{total}/hashes/json', Api.addHash);
    F.route('/api/add/hash/json', Api.addHash);
    F.route('/api/add/hashes/json', Api.addHash);
    F.route('/api/remove/hash/json', Api.removeHash);
    return F.route('/api/remove/hashes/json', Api.removeHash);
  };

}).call(this);
