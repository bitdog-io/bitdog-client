function TransactionTracker(name) {
    var _transactions = {};

    this.new = function (transactionId, stateChangeCallback, context,timeoutSeconds) {
        var transaction = new Transaction(transactionId, stateChangeCallback, context, timeoutSeconds);
        transaction.transactionTracker = this;

        _transactions[transactionId] = transaction;

        transaction.new();

    };

    this.done = function (transactionId, result) {
        var transaction = _transactions[transactionId];

        if (typeof transaction !== typeof undefined) {
            transaction.done(result);
        }

    };

    this.failed = function (transactionId, error) {
        var transaction = _transactions[transactionId];

        if (typeof transaction !== typeof undefined) {
              transaction.failed(error);
        }

    };

    this.remove = function (transaction) {
        delete _transactions[transaction.transactionId];

    }

    this.__defineGetter__('count', function () {
        var count = 0;
        for (var id in _transactions)
            count++;
        return count;
    });


}

function Transaction(transactionId, stateChangedCallback, context, seconds) {

    var _transactionId = transactionId;
    var _date = Date.now();
    var _timeoutSeconds = typeof seconds === typeof undefined ? 30 : seconds;
    var _stateChangedCallback = stateChangedCallback;
    var _context = context;
    var _timerId = null;
    var _transactionTracker = null;
     

    this.__defineGetter__('transactionId', function () { return _transactionId; });
    this.__defineGetter__('date', function () { return _date; });
    this.__defineGetter__('timeoutSeconds', function () { return _timeoutSeconds; });
    this.__defineGetter__('stateChangedCallback', function () { return _stateChangedCallback; });
    this.__defineSetter__('transactionTracker', function (value) { _transactionTracker = value; });

    this.new = function () {
        if (typeof _stateChangedCallback !== typeof undefined) {
            _stateChangedCallback(_transactionId, 'new', _context, null, 0);
            _timerId = setTimeout(this.expire.bind(this),_timeoutSeconds * 1000);
        }
    };

    this.done = function (result) {
        
        clearTimeout(_timerId);
        _transactionTracker.remove(this);

        if (typeof _stateChangedCallback !== typeof undefined) {
            _stateChangedCallback(_transactionId, 'done', _context, result, Date.now() - _date);
        }
    };

    this.expire = function () {

        _transactionTracker.remove(this);

        if (typeof _stateChangedCallback !== typeof undefined) {
            _stateChangedCallback(_transactionId, 'expired', _context, null, Date.now() - _date);
        }
    };

    this.failed = function (error) {

        clearTimeout(_timerId);
        _transactionTracker.remove(this);

        if (typeof _stateChangedCallback !== typeof undefined) {
            _stateChangedCallback(_transactionId, 'failed', _context, error, Date.now() - _date);
        }
    };


}

module.exports = TransactionTracker;