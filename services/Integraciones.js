
import config from '../config';
import request from 'request-promise';

module.exports = {
    ExecuteEndpoint: function (endpoint) {
        var BackUrl = 'http://'+config.HOST+':'+config.PORT
        const options = {
            method: 'GET',
            url: BackUrl + endpoint,
            headers: {'Content-Type': 'application/json'},
            json: true
        };
        request(options, function (error, response) {});
    }
};























