var sql = require('mssql');
var nodemailer = require('nodemailer');
var winCommand = require('node-windows');
 
 
var transporter = nodemailer.createTransport('smtps://<username>%40gmail.com:<pwd>@smtp.gmail.com');
 //note: need to set public access true in your gmail
var config = {
	user: '<user_name>',
	password: '<sql_server_pwd>',
	server: '<sql_server_name>',
	database: '<Database_name>',
	options: {
		encrypt : true
	}
};

function checkCount() {
		sql.connect(config).then(function () {
		var request = new sql.Request();
		request.query('SELECT count(1) as RecordCount FROM [iSenseCapture].[dbo].[NOCData_Q1]')
		.then(function (recordset) {
			if(recordset[0].RecordCount <= 200)
			{
				console.log("Its time to send an alert. the count is "+ recordset[0].RecordCount)
				
				//fetch some data to send
				request.query('SELECT top 10 * from [iSenseCapture].[dbo].[NOCData_Copy]')
				.then(function (records) {
					console.log(records[0])
					var mailOptions = {
    					from: '<from address>', // sender address 
    					to: '<to address>', // list of receivers separated by comma
    					subject: 'Test mail ', 
    					text: 'Item Id is '+ records[0].ItemID +' Client Id is ' + records[0].ClientID+'\n' ,
    					html: '<b>Item Id is '+ records[0].ItemID +' Client Id is ' + records[0].ClientID + '</b><br>' // html body 
					};
					records.forEach(function (record) {
						mailOptions.html = mailOptions.html.concat('<b>Item Id is '+ record.ItemID +' Client Id is ' + record.ClientID + '</b><br>');
					})
					transporter.sendMail(mailOptions, function(error, info){
    				if(error){
        				return console.log(error);
    				}
    					console.log('Message sent: ' + info.response);
					});
				})
				.catch(function (error) {
					console.log(error);
				});				
			}
			else{
				setTimeout(checkCount, 1000);
			}
		});
	});
};

//initial call
checkCount();
