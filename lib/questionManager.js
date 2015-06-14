'use strict';

var Hashtable = require('./hashtable.js');
var Question = require('./question.js');

function QuestionManager(session) {

    var _isRunning = false;
    var _questions = new Hashtable();

    this.start = function () {
        if (!_isRunning) {
            _isRunning = true;
  
            _questions.each(function (key, question) {
                session.sendQuestionMessage(question.questionText, question.answerText);
            });
        }
    };
    
    this.stop = function () {
        if (_isRunning) {
            _isRunning = false;
   
        }
    };

    this.add = function (questionText, answerText) {

        var question = new Question(questionText, answerText);
        _questions.put(question.getId(),question);

        return question;
    };
}

module.exports = QuestionManager;