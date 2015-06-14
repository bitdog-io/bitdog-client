function DataInterface(dataPoller)
{
    this.update = function () {
        dataPoller.update();
    };
}

module.exports = DataInterface;