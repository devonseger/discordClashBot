import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();
const discord_token = process.env.discord_token;

const commands = [
    {
        name: 'summoner',
        description: 'Enter a summoner ID from the enemy team!',
        string: 'Enter a summoner ID',
        options: [
            {
                name: 'summoner',
                description: 'Enter a summoner ID from the enemy team!',
                type: 3,
                required: true,
            }],
    },
];

const rest = new REST({ version: '10' }).setToken(discord_token);

(async () => {
    try {
        console.log('Registering slash commands');

        await rest.put(
            Routes.applicationCommands(process.env.client_id),
            { body: commands },
        );
        console.log('Successfully registered application commands.');

    } catch (err) {
        console.error(`there was an error ${err}`);
     }


})();