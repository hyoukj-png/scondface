const https = require('https');

const data = JSON.stringify({
    imp_key: "0527267733516327",
    imp_secret: "Ylmt9tH3Q5GakCuqz6z7GfOMrYxf15MKd8hWBhOsQfteukAfqdVCkfgQo5JpxSD4qwOIH3pts6Qu8CLF"
});

const options = {
    hostname: 'api.iamport.kr',
    port: 443,
    path: '/users/getToken',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Testing Iamport Keys...");
console.log("Key:", "0527267733516327");
console.log("Secret:", "Ylmt9tH3Q5GakCuqz6z7GfOMrYxf15MKd8hWBhOsQfteuKAfqdVcKfgQo5JpxSD4qwOlH3pts6Qu8CLF");

const req = https.request(options, res => {
    let body = '';

    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', d => {
        body += d;
    });

    res.on('end', () => {
        console.log("Response Body:", body);
    });
});

req.on('error', error => {
    console.error("Error:", error);
});

req.write(data);
req.end();
