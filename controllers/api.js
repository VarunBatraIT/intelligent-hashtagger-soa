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

    Api.oAddHash = function(sentence, total) {
      var hashedSentence, hashedWords, initialized, limit, normalWords, words;
      if (total == null) {
        total = -1;
      }
      sentence = Api.oRemoveHash(sentence);
      normalWords = sentence.split(' ');
      initialized = {};
      _.each(normalWords, function(word) {
        initialized[word.replace(/\W/g, '')] = false;
        return true;
      });
      words = new pos.Lexer().lex(sentence);
      words = tagger.tag(words);
      console.log(words);
      _.each(words, function(wordGroup) {
        var ref, word;
        word = wordGroup[0];
        if ((ref = wordGroup[1]) === "NNP" || ref === "NN" || ref === "NNS" || ref === "FW" || ref === "JJ" || ref === "VBG" || ref === "VBZ" || ref === "VB") {
          initialized[word.replace(/\W/g, '')] = true;
        }
        return true;
      });
      console.log(initialized);
      limit = true;
      if (total <= -1) {
        limit = false;
      }
      hashedWords = 0;
      hashedWords = _.map(normalWords, function(word) {
        var oWord;
        oWord = word.replace(/\W/g, '');
        if (initialized[oWord] === true && oWord !== "" && indexOf.call(stopwords, oWord) < 0) {
          if (!limit) {
            word = "#" + word;
          } else if (total > hashedWords) {
            word = "#" + word;
            hashedWords++;
          }
        }
        return word;
      });
      console.log(sentence);
      hashedSentence = hashedWords.join(' ');
      console.log(hashedSentence);
      return hashedSentence;
    };

    return Api;

  })();

  exports.install = function() {
    F.route('/api/add/{total}/hash/json', Api.addHash);
    F.route('/api/add/{total}/hashes/json', Api.addHash);
    F.route('/api/add/hash/json', Api.addHash);
    F.route('/api/add/hash/json', Api.addHash);
    F.route('/api/remove/hash/json', Api.removeHash);
    return F.route('/api/remove/hashes/json', Api.removeHash);
  };

}).call(this);
