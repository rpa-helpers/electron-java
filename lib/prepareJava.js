
var glob = require('glob');
var fs = require('fs');
var os = require('os');
var path = require('path');
var LocateJavaHome = require('locate-java-home');

function getCorrectSoForPlatform(soFiles){
  var so = _getCorrectSoForPlatform(soFiles);
  if (so) {
    so = removeDuplicateJre(so);
  }
  return so;
}

function removeDuplicateJre(filePath){
  while(filePath.indexOf('jre/jre')>=0){
    filePath = filePath.replace('jre/jre','jre');
  }
  return filePath;
}

function _getCorrectSoForPlatform(soFiles){
  
  var architectureFolderNames = {
    'ia32': 'i386',
    'x64': 'amd64'
  };

  if(os.platform() != 'sunos')
    return soFiles[0];

  var requiredFolderName = architectureFolderNames[os.arch()];

  for (var i = 0; i < soFiles.length; i++) {
    var so = soFiles[i];

    if(so.indexOf('server')>0)
      if(so.indexOf(requiredFolderName)>0)
        return so;
  }

  return soFiles[0];
}
function prepareJava() {
     var prepareJavaPromise = new Promise(function(resolve, reject) {
        LocateJavaHome.default({
            version: '>=1.8',
            mustBe64Bit: true,
          }, function(err, javaHomes){
            var dll;
            var dylib;
            var so,soFiles;
            var binary;
            let home;
            if (javaHomes.length == 0 && process.platform === 'win32') {
              resolve();
              return;
            }
            for (let i = 0; i < javaHomes.length; i += 1) {
                const homeInfo = javaHomes[i];
                if (homeInfo.isJDK) {
                    console.info(`Found Java JDK ${homeInfo.version} at ${homeInfo.path}`);
                    home = `${homeInfo.path}/jre`;
                    break;
                } else {
                  console.info(`Found Java JRE ${homeInfo.version} at ${homeInfo.path}`);
                    home = homeInfo.path;
                    break;
                }
            }
            if(home){
              dll = glob.sync('**/jvm.dll', {cwd: home})[0];
              dylib = glob.sync('**/libjvm.dylib', {cwd: home})[0];
              soFiles = glob.sync('**/libjvm.so', {cwd: home});
              
              if(soFiles.length>0)
                so = getCorrectSoForPlatform(soFiles);
          
              binary = dll || dylib || so;
              try {
                if (os.platform() === 'darwin') {
                  fs.symlinkSync(home, '/usr/local/bin/jre', 'dir');
                } else {
                  process.env.PATH += path.delimiter + path.dirname(path.resolve(home, binary));
                }
                resolve();
              } catch(e) {
                if (e.code == 'EEXIST') {
                  console.error(e);
                  resolve();
                } else {
                    reject(new Error('JDK/JRE 8 not found.'));
                }
              }
              return;
            }
            reject(new Error('JDK/JRE 8 not found.'));
          });
     });
    return prepareJavaPromise;
 }

 module.exports = prepareJava;