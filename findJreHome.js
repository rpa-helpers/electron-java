var jre = require('node-jre');
console.log(jre.driver());
const jreHome=path.dirname(path.dirname(jre.driver()));
process.stdout.write(jreHome);