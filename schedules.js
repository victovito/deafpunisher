const commands = require("./commands.js");
const { moveTimeout, notifications } = require("./config.json");

const moveSchedules = [];

const addMoveSchedule = function(member){
    const index = getMoveScheduleIndex(member.id);
    const timeout = setTimeout(() => {
        commands.moveToDeafChannel(member);
        moveSchedules.splice(getMoveScheduleIndex(member.id), 1);
    }, moveTimeout);

    if (index == -1){
        moveSchedules.push({
            memberId: member.id,
            timeout: timeout
        });
    } else {
        clearTimeout(moveSchedules[index].timeout);
        moveSchedules[index].timeout = timeout;
    }
}

const removeMoveSchedule = function(member){
    const index = getMoveScheduleIndex(member.id);

    if (index != -1){
        clearTimeout(moveSchedules[index].timeout);
        moveSchedules.splice(index, 1);
    }
}

const getMoveScheduleIndex = function(id){
    for (let i = 0; i < moveSchedules.length; i++){
        if (moveSchedules[i].memberId == id){
            return i;
        }
    }
    return -1;
}

const setNotificationSchedule = function(guild){
    const timeForNext = getNextNotificationOffset();
    setTimeout(() => {
        let properties = commands.getServerPropertiesByServerId(guild[0]);
        if (!properties){
            properties = commands.createServerProperties(guild[0]);
        }

        let channel;
        for (let entry of guild[1].channels.cache){
            if (entry[1].type == "text"){
                channel = entry[1];
                break;
            }
        }

        const timeInHours = Math.round(timeForNext / 1000 / 60 / 60);
        channel.send(`${
            timeInHours == 1 ? "Na última hora" : `Nas últimas ${timeInHours} horas`
        }, ${properties.movedMembers} usuários foram movidos por estarem mutados.`);
        
        commands.resetMovedMembers(guild[0]);

        setNotificationSchedule(guild);
        
    }, timeForNext);
}

const getNextNotificationOffset = function(){
    const now = new Date();
    let nextHour = null;
    
    for (let hour of notifications.hours){
        if (now.getHours() < hour){
            nextHour = hour;
            break;
        }
    }
    
    let next = new Date();
    next.setDate(now.getDate());
    next.setMinutes(0);
    next.setSeconds(0, 0);
    next.setHours(nextHour ? nextHour : notifications.hours[0]);

    if (nextHour == null){
        next = dateAdd(next, "day", 1);
    }

    return next.getTime() - now.getTime();

}

module.exports = {
    addMoveSchedule,
    removeMoveSchedule,
    setNotificationSchedule
}

/**
* Adds time to a date. Modelled after MySQL DATE_ADD function.
* Example: dateAdd(new Date(), 'minute', 30)  //returns 30 minutes from now.
* https://stackoverflow.com/a/1214753/18511
* 
* @param date  Date to start with
* @param interval  One of: year, quarter, month, week, day, hour, minute, second
* @param units  Number of units of the given interval to add.
*/
function dateAdd(date, interval, units) {
    if(!(date instanceof Date)){
        return undefined;
    }
    var ret = new Date(date); //don't change original date
    var checkRollover = function() { if(ret.getDate() != date.getDate()) ret.setDate(0);};
    switch(String(interval).toLowerCase()) {
        case 'year'   :  ret.setFullYear(ret.getFullYear() + units); checkRollover();  break;
        case 'quarter':  ret.setMonth(ret.getMonth() + 3*units); checkRollover();  break;
        case 'month'  :  ret.setMonth(ret.getMonth() + units); checkRollover();  break;
        case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
        case 'day'    :  ret.setDate(ret.getDate() + units);  break;
        case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
        case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
        case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
        default       :  ret = undefined;  break;
    }
    return ret;
}
