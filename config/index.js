var path = require ('path');
var nconf = require ('nconf');
var fileName = 'config-'+process.env.NODE_ENV+'.json';
fileName = path.join (__dirname, fileName);
//console.log (fileName);
nconf.file(fileName);
//console.log (nconf.get('server:port'));
module.exports = nconf;
//test