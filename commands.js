const fs = require("fs");
const Discord = require("discord.js");
const serverProperties = require("./serverProperties.json");

function ServerPropertiesObj(){
    this.id = "";
    this.deafChannelId = "";
    this.movedMembers = 0;
}

const moveToDeafChannel = function(member){
    const channel = member.guild.channels.cache.get(
        getServerPropertiesByServerId(member.guild.id).deafChannelId
    );
    if (!channel){
        return;
    }
    if (member.voice.channel.id != channel.id){
        member.voice.setChannel(channel);
        increaseMovedMembers(member.guild.id, 1);
        // sendPrivateMessage(member, "https://giant.gfycat.com/OffensiveJampackedAgama.mp4");
    }
}

const getServerPropertiesByServerId = function(id){
    for (let properties of serverProperties.list){
        if (properties.id == id){
            return properties;
        }
    }
    return null;
}

const createServerProperties = function(guildId){
    if (!getServerPropertiesByServerId(guildId)){
        const configList = serverProperties;

        const newObj = new ServerPropertiesObj();
        newObj.id = guildId;

        configList.list.push(newObj);

        fs.writeFile("./serverProperties.json", JSON.stringify(configList, null, "\t"), (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });

        return newObj;
    }
}

const setDeafChannel = function(message, args){
    const channel = message.guild.channels.cache.get(args[0]);
    const properties = serverProperties;
    if (!channel){
        message.channel.send(`Este canal não existe.`);
        return;
    }
    if (channel.type != "voice"){
        message.channel.send(`Este não é um canal de voz.`);
        return;
    }

    for (let i = 0; i <= properties.list.length; i++){
        if (i == properties.list.length){
            const newObj = new ServerPropertiesObj();
            newObj.id = channel.guild.id;
            newObj.deafChannelId = channel.id;

            properties.list.push(newObj);
            break;
        }
        if (properties.list[i].id == message.guild.id){
            properties.list[i].deafChannelId = channel.id;
            break;
        }
    }
    fs.writeFile("./serverProperties.json", JSON.stringify(properties, null, "\t"), (err) => {
        if (err) {
            console.error(err);
            return;
        }
        message.channel.send(`Canal de voz atualizado.`);
    });
}

const increaseMovedMembers = function(guildId, value){
    const properties = serverProperties;

    for (let i = 0; i <= properties.list.length; i++){
        if (properties.list[i].id == guildId){
            properties.list[i].movedMembers = properties.list[i].movedMembers + value;
            break;
        }
    }

    fs.writeFile("./serverProperties.json", JSON.stringify(properties, null, "\t"), (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
}

const resetMovedMembers = function(guildId){
    const properties = serverProperties;

    for (let i = 0; i <= properties.list.length; i++){
        if (properties.list[i].id == guildId){
            properties.list[i].movedMembers = 0;
            break;
        }
    }

    fs.writeFile("./serverProperties.json", JSON.stringify(properties, null, "\t"), (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
}

const sendPrivateMessage = function(user, message){
    user.send(message);
}

const punishForbidenLink = function(message){
    const link = "https://giant.gfycat.com/OffensiveJampackedAgama.mp4";

    if (!message.content.includes(link)){
        return;
    }

    message.channel.createInvite({temporary: false, unique: true, maxUses: 1})
        .then(invite => {
            sendPrivateMessage(message.member, link);
            message.member.send(invite.url);
            message.member.kick();
        })
        .catch(console.error);

}

/** @param {Discord.Message} message */
const setBanner = function(message){
    console.log(message.guild.banner);
    message.guild.setBanner("./img/banner.jpg")
        .then(response => {
            console.log(response.banner);
        })
        .catch(console.error);
}

const commands = {
    "set": setDeafChannel,
    // "setbanner": setBanner,
    getServerPropertiesByServerId,
    createServerProperties,
    moveToDeafChannel,
    resetMovedMembers,
    punishForbidenLink,
}

module.exports = commands;
