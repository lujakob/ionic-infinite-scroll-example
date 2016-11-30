var _ = require('lodash');

var functions = {
    getClients: function(req, res) {
        var data = require('./data/clientsData.json');

        var defaultCount = 500,
            defaultStart = 0,
            total;

        var params = req.query;
        var count = params.count && params.count.length > 0 ? parseInt(params.count) : defaultCount;
        var start = params.start && params.start.length > 0 ? parseInt(params.start) : defaultStart;

        // take a few for testing
        // data = _.take(data, 280);

        total = data.length;

        if(count > 0) {
            data = data.slice(start, (data.length > (start + count) ? start + count : data.length));
        }

        // simulate network delay
        setTimeout(function() {
          res.json({data: data, total: total});
        }, 500);
    }

};
module.exports = functions;
