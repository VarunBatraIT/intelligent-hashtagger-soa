
pos = require('pos');
tagger = new pos.Tagger();
_ = require('lodash')
stopwords = require('stopwords').english
class Api
  @removeHash = ->
    sentence = @req.query["sentence"] || ""
    sentence = Api.oRemoveHash(sentence)
    @json {
      sentence: sentence
    }
  @addHash = (total = -1)->
    console.log total
    sentence = @req.query["sentence"] || ""
    sentence = Api.oAddHash(sentence,total)
    @json {
      sentence: sentence
    }

  @oRemoveHash = (sentence) ->
    words = sentence.split(' ')
    words = _.map(words, (word)->
      if word.indexOf('#') == 0
        word = word.substring(1,_.size(word))
      word
      )
    return words.join(' ')
  @oAddHash = (sentence,total = -1) ->
    sentence = Api.oRemoveHash(sentence)
    normalWords = sentence.split(' ')
    initialized = {}
    _.each(normalWords,(word)->
        initialized[word.replace(/\W/g,'')] = false
        return true
      )
    words = new pos.Lexer().lex(sentence);
    words = tagger.tag(words)
    console.log words
    _.each(words, (wordGroup) ->
        word = wordGroup[0]
        if wordGroup[1] in ["NNP","NN","NNS","FW","JJ","VBG","VBZ","VB"]
          initialized[word.replace(/\W/g,'')] = true
        return true
      )
    console.log initialized
    limit = true
    if total <= -1
      limit = false
    hashedWords = 0
    hashedWords = _.map(normalWords,(word)->
        oWord = word.replace(/\W/g,'')
        if initialized[oWord] == true && oWord != "" && oWord not in stopwords
          if !limit
            word = "#"+word
          else if total > hashedWords
            word = "#"+word
            hashedWords++
        word
      )
    console.log sentence
    hashedSentence = hashedWords.join(' ')
    console.log hashedSentence
    return hashedSentence
exports.install = ->
    F.route('/api/add/{total}/hash/json', Api.addHash)
    F.route('/api/add/{total}/hashes/json', Api.addHash)
    F.route('/api/add/hash/json', Api.addHash)
    F.route('/api/add/hash/json', Api.addHash)
    F.route('/api/remove/hash/json', Api.removeHash)
    F.route('/api/remove/hashes/json', Api.removeHash)
