function Question(questionText, answerText) {
    
    this.getId = function () {
        return questionText;
    };

    this.__defineGetter__('questionText', function () {
        return questionText;
    });

    this.__defineGetter__('answerText', function () {
        return answerText;
    });
}

module.exports = Question;