import { Client, IntentsBitField, bold, underscore, hyperlink, hideLinkEmbed } from 'discord.js'
import dotenv from 'dotenv';
import { getTeamId, getMastery, getPuuid, getSummonerName, isClashLive } from './bot.mjs';
import fs from 'fs';
const championJson = './assets/champion.json'
const opggUrl = 'https://www.op.gg/summoners/na/'


dotenv.config();
const discord_token = process.env.discord_token;
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent
    ]
});
client.on('ready', (c) => {
    console.log(`Logged in as ${client.user.tag}!`);
});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'summoner') {
        try {
        const liveResponse = await isClashLive();
        console.log('look here:', liveResponse);
        if (liveResponse.length > 0) {
            try {
                interaction.reply('One moment while I gather the information...');
                const summoner = interaction.options.getString("summoner");
                console.log(summoner);
                const teamInfo = await getTeamId(summoner);
                const champIdArray = []
                const championIds = [];
                const playerChampKVP = {}
                console.log(`teamInfo: ${teamInfo}`);
                interaction.channel.send(`# ${teamInfo.name}`);
                const puuidArray = []
                const summonerNames = []
                    for (const player of teamInfo.players) {
                        const puuid = await getPuuid(player.summonerId);
                        const fetchSummonerName = await getSummonerName(player.summonerId); 
                        puuidArray.push(puuid);
                        summonerNames.push(fetchSummonerName);
                    }
                for (let i = 0; i < puuidArray.length; i++) {
                    const summonerName2 = summonerNames[i];
                    const puuid2 = puuidArray[i];
                    const masteries = await getMastery(puuid2);
                    if (!playerChampKVP[puuid2]) {
                        playerChampKVP[puuid2] = { summonerNames: [], championIds: [] };
                    }
                    playerChampKVP[puuid2].summonerNames.push(summonerName2);
                    masteries.forEach(mastery => {
                        playerChampKVP[puuid2].championIds.push(mastery.championId);
                        championIds.push(mastery.championId);
                    });
                    const championJsonData = await fs.promises.readFile(championJson, 'utf-8');
                    const championsArray = Object.values(JSON.parse(championJsonData).data);
                    for (const [puuid, playerData] of Object.entries(playerChampKVP)) {
                        const { championIds } = playerData;
                        const championNames = [];
                        championIds.forEach(championId => {
                            const champion = championsArray.find(champion => parseInt(champion.key) === championId);
                            if (champion) {
                                championNames.push(champion.name);
                            } else {
                                console.error(`Champion with ID ${championId} not found.`);
                            }
                        });
                        playerChampKVP[puuid].championNames = championNames;
                        
                    }
                    if (Array.isArray(masteries) && masteries.length > 0) {
                        masteries.forEach(mastery => {
                            champIdArray.push(mastery.championId);
                        });
                    } else {
                        console.error(`Masteries data is invalid or empty for ${summonerName2}`);
                    }
                }
                for (const [puuid, playerData] of Object.entries(playerChampKVP)) {
                    const { summonerNames, championNames } = playerData;
                    const formattedSummonerNames = summonerNames.map(name => name.replace(/\s+/g, ''));
                    const message = `
                        \n>>> ## ${hyperlink(formattedSummonerNames.join(', '), hideLinkEmbed(opggUrl + formattedSummonerNames.join(', ')))}
                        \n### ${underscore(`top 3 champions :`)}
                        \n ${bold(championNames.join(', '))}`;
                    interaction.channel.send(message);
                }
                console.log(playerChampKVP);
            } catch (e) {
                console.error(`error here: ${e}`);
            }
            interaction.channel.send({
                content: 'Summoner names are links to op.gg, for any bugs/issues contact @sqsux'
            })
        } else {
            interaction.reply({
                content: 'It appears there is currently no clash tournament, if you feel this is an error please contact @sqsux'
            })
        }
        
        } catch (e) {
            console.error(`error here: ${e}`);
    }
}

});

client.login(discord_token);