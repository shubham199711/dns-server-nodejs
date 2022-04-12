//import required libraries
let dns = require('native-dns');
let util = require('util');

let customEntries = {
	'example.com': [
		{
			name: 'test.dns',
			address: '127.1.2.1',
			ttl: 30,
		},
		{
			name: 'test.dns',
			address: '127.1.2.2',
			ttl: 30,
		},
	],
};

let server = dns.createServer();

server.on('request', function (request, response) {
	let domain = request?.question?.[0]?.name || '';
	if (customEntries[domain]) {
		//if custom entry exists, push it back...
		let entries = customEntries[domain];
		(entries || []).forEach((entry) => response.answer.push(dns.A(entry)));
		response.send();
	} else {
		let question = dns.Question({
			name: domain,
			type: 'A',
		});
		let req = dns.Request({
			question: question,
			server: { address: '8.8.8.8', port: 53, type: 'udp' },
			timeout: 1000,
		});
		req.on('message', function (err, answer) {
			let entries = [];
			answer.answer.forEach(function (a) {
				response.answer.push(dns.A(a));
			});
			response.send();
		});
		req.send();
	}
});

server.on('error', function (err, buff, req, res) {
	console.log(err.stack);
});

console.log('Listening on ' + 53);
server.serve(53);
