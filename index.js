var util = require('./util.js');
var request = require('request').defaults({
    baseUrl: 'https://api-ssl.bitly.com/'
});

var pickInputs = {
        'domain': 'domain',
        'unit': 'unit',
        'units': 'units',
        'timezone': 'timezone',
        'limit': 'limit',
        'unit_reference_ts': 'unit_reference_ts'
    },
    pickOutputs = {
        'tz_offset': 'data.tz_offset',
        'unit': 'data.unit',
        'units': 'data.units',
        'organization_clicks': 'data.organization_clicks'
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs),
            token = dexter.environment('bitly_access_token'),
            api = '/v3/organization/popular_links';

        if (!token)
            return this.fail('A [bitly_access_token] environment variable is required for this module');

        if (validateErrors)
            return this.fail(validateErrors);

        inputs.access_token = token;
        request.get({uri: api, qs: inputs, json: true}, function (error, response, body) {
            if (error)
                this.fail(error);
            else if (body && body.status_code !== 200)
                this.fail(body);
            else
                this.complete(util.pickOutputs(body, pickOutputs));
        }.bind(this));
    }
};
