const fs = require("fs");
const serverConfig = require("./serverConfig.json");

var moveToDeafChannel = function(member){
    const channel = member.guild.channels.cache.get(
        getServerConfigByServerId(member.guild.id).deafChannelId
    );
    if (member.voice.channel.id != channel.id){
        member.voice.setChannel(channel);
    }
}

var getServerConfigByServerId = function(id){
    for (let config of serverConfig.list){
        if (config.id == id){
            return config;
        }
    }
    return null;
}

var setDeafChannel = function(message, args){
    const channel = message.guild.channels.cache.get(args[0]);
    const configList = serverConfig;
    if (!channel){
        message.channel.send(`Este canal não existe.`);
        return;
    }
    if (channel.type != "voice"){
        message.channel.send(`Este não é um canal de voz.`);
        return;
    }

    for (let i = 0; i <= configList.list.length; i++){
        if (i == configList.list.length){
            configList.list.push({
                id: channel.guild.id,
                deafChannelId: channel.id
            });
            break;
        }
        if (configList.list[i].id == message.guild.id){
            configList.list[i].deafChannelId = channel.id;
            break;
        }
    }
    fs.writeFile("./serverConfig.json", JSON.stringify(configList, null, "\t"), (err) => {
        if (err) {
            console.error(err);
            return;
        }
        message.channel.send(`Canal de voz atualizado.`);
    });
}

const commands = {
    "setdeafchannel": setDeafChannel,
    getServerConfigByServerId,
    moveToDeafChannel,

}

module.exports = commands;
