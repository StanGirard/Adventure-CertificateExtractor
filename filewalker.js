var async = require('async'),
    fs = require('fs'),
    path = require('path'),
    parentDir = '/root/SSLCert/cert'
    //parentDir = "/Users/stan/Documents/Dev/GetCertificates/test"
    const { Certificate, PrivateKey } = require('@fidm/x509')
    const mysql = require('mysql');
    var filewalker = require('filewalker');

var read = 0
var errorNB = 0
// First you need to create a connection to the db host: 'database.cppynzdwfotc.eu-west-3.rds.amazonaws.com',
const con = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'Stanley78!',
});

con.connect((err) => {
    if (err) {
        console.log('Error connecting to Db');
        throw err;
        return;
    }
    console.log('Connection established');

    /*var sql = "CREATE TABLE IF NOT EXISTS `Certificates`.`certificate` (`id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, `domain` VARCHAR(255) NULL, `certificate` VARCHAR(16000) NULL);";
    con.query(sql, function(err, result) {
        if (err) throw err;
        console.log("Table created");
    });*/
});    





filewalker('cert/')
  .on('dir', function(p) {
    console.log('dir:  %s', p);
  })
  .on('file', async function(p, s) {
            var filePath = path.join(parentDir, p);
            var cert = Certificate.fromPEM(fs.readFileSync(filePath))
            var CN = con.escape(cert.subject.commonName)
            var ON= con.escape(cert.subject.organizationName)
            var PKAlgo = con.escape(cert.publicKey.algo)
            var PK= con.escape(cert.publicKeyRaw)
            var KU = con.escape(cert.keyUsage)
            var ION = con.escape(cert.issuer.organizationName)
            var VF = con.escape(cert.validFrom)
            var VT = con.escape(cert.validTo)
            var sql = "INSERT INTO Certificates.decoded (filename, subjectCN, subjectON, pubkeyalgo, pubkey, issuerON, validFrom, validTo)" 
            sql += " VALUES ('" + p + "'," + CN + "," + ON +"," + PKAlgo + "," + PK + "," + ION + "," + VF + "," + VT + ");"
            
            await con.query(sql, function(err, result) { 
                if (err){
                    errorNB += 1
                    if (errorNB % 100 == 0){
                        console.log("Error:", errorNB)
                    }
                } else {
                    read += 1
                    if (read % 100 == 0){
                        console.log(read)
                        
                    }
                    
                }
                
            })
  })
  .on('error', function(err) {
    console.error(err);
  })
  .on('done', function() {
    console.log('%d dirs, %d files, %d bytes', this.dirs, this.files, this.bytes);
  })
.walk();