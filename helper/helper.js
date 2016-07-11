const crypto = require('crypto');
const secret = 'abcdefg';
var method = helper.prototype;

function helper() {
}

method.getHash = function (text) {
    //var hashValue = crypto.randomBytes(20).toString('hex');
    console.log("Hashing For:" + text);
    var hash = crypto.createHash('sha256').update(text, 'utf8').digest('hex');
    return hash;
};

method.Log = function (type, data, text) {
    var logString = getDate();
    var typeString = '';
    //console.log(logString);
    if (type == 'success' || type == 'error') {
        typeString = type.toUpperCase();
    }
    else {
        typeString = 'INFO';
    }
    if (text == null) {
        logString = logString + ' [' + typeString.substring(0, 4) + '] ' + JSON.stringify(data);
    }
    else {
        logString = logString + ' [' + typeString.substring(0, 4) + '] ' + text;
    }

    console.log(logString);
}

function getDate() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

function getUNIXTimestamp() {
    return Math.floor(Date.now() / 1000);
}

module.exports = helper;

/*

    C# Equivalent code for Hashing
    private static void Gethash(string text)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(text);
        SHA256 hashstring = SHA256.Create();
        
        byte[] hash = hashstring.ComputeHash(bytes);

        string hashString = string.Empty;

        foreach (byte x in hash)
        {
            hashString += String.Format("{0:x2}", x);
        }

        System.Console.WriteLine(hashString);
    }
    
    Current OutPut
    //db1186b3c0a9ac00b5c6dbf2ac8d345b04219e13d10cccd9d4572af17be33cbb
    //db1186b3c0a9ac00b5c6dbf2ac8d345b04219e13d10cccd9d4572af17be33cbb
    
    db.user.insert({name:"prashant",hash:"db1186b3c0a9ac00b5c6dbf2ac8d345b04219e13d10cccd9d4572af17be33cbb",signature:"hexValueTesting"})
*/



