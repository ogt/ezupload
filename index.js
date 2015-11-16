#!/usr/bin/env node

var _ = require('./utils.js')
var commandLineArgs = require('command-line-args')
var readline = require('readline');

var cli = commandLineArgs([
    { name: 'quiet', alias: 'q', type: Boolean },
    { name: 'force', alias: 'f', type: Boolean },
    { name: 'user', alias: 'u', type: String },
    { name: 'bucket', alias: 'b', type: String },
    { name: 'name', alias: 'n', type: String }
]);
var options = cli.parse();

_.run(function () {
	var filename = process.argv[2]
    var key = options.name || 'empty';//use this name instead of generating md5 name (there is no description in issue2 what to do if name is empty)
    var bucket_name = options.bucket || 'sketchup-blueprints';

    //just outputs the URL nothing else
    if (options.quiet){
        console.log('https://s3-us-west-2.amazonaws.com/' + bucket_name + '/' + key);
        process.exit(0);
    }

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    if (filename === '-'){
        rl.question('Please enter correct file name (for example, test.txt)\n', function(text) {
            filename = text;
            rl.close();
            upload();
        });
    }
    else {
        upload();
    }

    //function for uploading
    function upload(){
        var data = require('fs').readFileSync(filename)

        console.log('ezupload version 0.01')
        if (!filename) {
            console.log('example usage:\n> ezupload test.txt')
            return
        }
        console.log('uploading ' + filename)

        var AWS = require('aws-sdk')
        var credentials = new AWS.SharedIniFileCredentials({profile: options.user || 'default', filename: 'credentials_test'});//profile to use to pick credentials from the .aws - if none should be picking default
        AWS.config.credentials = credentials;

        var bucket = new AWS.S3({
            params : {
                Bucket : bucket_name
            }
        })
        bucket.headBucket({}, function(err, data) {
            if (err) {
                //if there is no such bucket and --force parameter is presented, we need to create bucket
                if (options.force){
                    bucket.createBucket({}, function(err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else     console.log(data);           // successful response
                    });
                }
                else{
                    //without --force parameter application should fail with some error
                    console.log('there is no such bucket. Check another bucket or use --force parameter');
                    process.exit(1);
                }
            }
            else{
                //bucket exists
            }
        });
        bucket.headObject({
            Key : key,
            Body : data
        }, function (err){
                if (err){
                    //object doesn't exist.Let's put it!
                    bucket.putObject({
                        Key : key,
                        Body : data
                    }, function (err) {
                        if (err)
                            console.log('failed to upload :(')
                        else
                            console.log('done: https://s3-us-west-2.amazonaws.com/' + bucket_name + '/' + key)
                    });
                    return;
                }
                console.log('file with name ' + key + ' already exists on server');
            }
        );

    }
})
