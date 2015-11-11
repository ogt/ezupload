#!/usr/bin/env node

var _ = require('./utils.js')
_.run(function () {

	var filename = process.argv[2]

	console.log('ezupload version 0.01')
	if (!filename) {
		console.log('example usage:\n> ezupload test.txt')
		return
	}
	console.log('uploading ' + filename)

	var data = require('fs').readFileSync(filename)
	var key = _.md5(data)
	var bucket_name = 'sketchup-blueprints'

    var AWS = require('aws-sdk')
    AWS.config.update({
    	accessKeyId: '',
    	secretAccessKey: ''
    })
    var bucket = new AWS.S3({
        params : {
            Bucket : bucket_name
        }
    })
    bucket.putObject({
        Key : key,
        Body : data,
    }, function (err) {
        if (err)
    		console.log('failed to upload :(')
        else
        	console.log('done: https://s3-us-west-2.amazonaws.com/' + bucket_name + '/' + key)
    })
})
