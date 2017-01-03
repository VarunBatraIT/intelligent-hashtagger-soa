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
  @onlyWord = (word) ->
    word.replace(/\W/g,'')
  @oAddHash = (sentence, total = -1) ->
    totalHashed = 0
    limit = true
    if total == -1
      limit = false
    sentence = Api.oRemoveHash(sentence)
    nwords = sentence.split(' ')
    words = tagger.tag(new pos.Lexer().lex(sentence))
    whereToPutHash = {}
    _.each(nwords, (nword)->
        whereToPutHash[Api.onlyWord(nword)] = false
        true
      )
    priorityHashes = ["NNP","NN","NNS","FW","JJ","VBG","VBZ","VB","VBP"]
    _.each(priorityHashes, (priorityHash)->
        _.each(words, (wordGroup)->
            word = wordGroup[0]
            type = wordGroup[1]
            if priorityHash == type && (word.toLowerCase() not in stopwords)
              if !limit
                whereToPutHash[Api.onlyWord(word)] = true
              else if limit && totalHashed < total
                totalHashed++
                whereToPutHash[Api.onlyWord(word)] = true
            true
          )
      )
    hashedSentence = []
    _.each(nwords, (word)->
        if whereToPutHash[Api.onlyWord(word)] == true
          word = "#"+word
        hashedSentence.push(word)
        true
      )
    hashedSentence = hashedSentence.join(' ')
    console.log sentence
    console.log hashedSentence
    hashedSentence

exports.install = ->
    F.route('/api/add/{total}/hash/json', Api.addHash)
    F.route('/api/add/{total}/hashes/json', Api.addHash)
    F.route('/api/add/hash/json', Api.addHash)
    F.route('/api/add/hash/json', Api.addHash)
    F.route('/api/remove/hash/json', Api.removeHash)
    F.route('/api/remove/hashes/json', Api.removeHash)
