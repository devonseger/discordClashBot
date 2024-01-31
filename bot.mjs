import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

const summonerUrl = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'
const teamIdUrl = 'https://na1.api.riotgames.com/lol/clash/v1/players/by-summoner/'
const teamInfoUrl = 'https://na1.api.riotgames.com/lol/clash/v1/teams/'
const lookUpPuuid = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/'
const lookUpMastery = 'https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/'
const apiKey = process.env.APIKEY;

export async function getTeamId(summoner) {
    // console.log(summonerUrl + summoner + apiKey);
    const summonerResponse = await axios.get(summonerUrl + summoner + apiKey, {responseType: 'json'});
    const summonerId = summonerResponse.data.id;
    // console.log(summonerId);
    const teamResponse = await axios.get(teamIdUrl + summonerId + apiKey, {responseType: 'json'});
    const teamId = teamResponse.data[0].teamId;
    console.log(teamId);
    // const teamId = '5153131' // tournament ended during production, code above works when tournament is active
    const teamInfoResponse = await axios.get(teamInfoUrl + teamId + apiKey, {responseType: 'json'});
    const teamInfo = teamInfoResponse.data;
    // console.log(teamInfo.players.length);
    return teamInfo;
}

export async function getMastery(puuid) {
    // console.log(lookUpMastery + puuid + '/top' + apiKey);
    const masteryResponse = await axios.get(lookUpMastery + puuid + '/top' + apiKey);
    const mastery = masteryResponse.data;
    // console.log(`this is mastery: ${mastery[0].championId}`);
    return mastery;
}


export async function getPuuid(summonerId) {
    const puuidRespone = await axios.get(lookUpPuuid + summonerId + apiKey);
    const puuid = puuidRespone.data.puuid;
    // console.log(`this is puuid: ${puuid}`);
    return puuid;
}

export async function getSummonerName(puuid) {
    const puuidRespone = await axios.get(lookUpPuuid + puuid + apiKey, {responseType: 'json'});
    const summonerName = puuidRespone.data
    // console.log(`summonerName: ${summonerName.name}`);
    return summonerName.name;
}

export async function isClashLive() {
    const liveResponse = await axios.get('https://na1.api.riotgames.com/lol/clash/v1/tournaments' + apiKey);
    
    return liveResponse.data;
    
}