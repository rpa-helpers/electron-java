var jre = require('node-jre');
var path = require('path');

const jreHome=path.dirname(path.dirname(jre.driver()));
process.stdout.write(jreHome);