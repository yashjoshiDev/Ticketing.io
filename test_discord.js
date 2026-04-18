const TOKEN = 'MTQ4NDk5OTA2ODExNDYyMDQ3Ng.Gb7mRm.J-covqbq1dgQMRpRVQGRBPtbjUTXu3mjmpzDF4';
const GUILD_ID = '1484999949459525654';

async function testDiscord() {
    console.log("Fetching channels for guild:", GUILD_ID);
    
    try {
        const response = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
            headers: {
                'Authorization': `Bot ${TOKEN}`
            }
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Failed to fetch channels:", err);
            return;
        }

        const channels = await response.json();
        const generalChannel = channels.find(c => c.name === 'general' && c.type === 0);

        if (!generalChannel) {
            console.error("Could not find a text channel named #general");
            return;
        }

        console.log("Found #general channel ID:", generalChannel.id);
        console.log("Sending message...");

        const sendResponse = await fetch(`https://discord.com/api/v10/channels/${generalChannel.id}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: "Connected! (Testing from Antigravity)"
            })
        });

        if (sendResponse.ok) {
            console.log("✅ Message sent successfully!");
        } else {
            const err = await sendResponse.text();
            console.error("Failed to send message:", err);
        }
    } catch (error) {
        console.error("Error during Discord test:", error);
    }
}

testDiscord();
