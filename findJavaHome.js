require('locate-java-home').default({
  version: '>=1.8',
  mustBe64Bit: true,
}, function(err, home){
  if(err){
    console.error("[node-java] "+err);
    process.exit(1);
  }
  process.stdout.write(home[0].path);
});
