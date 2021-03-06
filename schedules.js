const commands = require("./commands.js");
const { moveTimeout } = require("./config.json");

const schedules = [];

const addMoveSchedule = function(member){
    const index = getMoveScheduleIndex(member.id);
    const timeout = setTimeout(() => {
        commands.moveToDeafChannel(member);
        schedules.splice(getMoveScheduleIndex(member.id), 1);
    }, moveTimeout);

    if (index == -1){
        schedules.push({
            memberId: member.id,
            timeout: timeout
        });
    } else {
        clearTimeout(schedules[index].timeout);
        schedules[index].timeout = timeout;
    }
}

const removeMoveSchedule = function(member){
    const index = getMoveScheduleIndex(member.id);

    if (index != -1){
        clearTimeout(schedules[index].timeout);
        schedules.splice(index, 1);
    }
}

const getMoveScheduleIndex = function(id){
    for (let i = 0; i < schedules.length; i++){
        if (schedules[i].memberId == id){
            return i;
        }
    }
    return -1;
}

module.exports = {
    addMoveSchedule,
    removeMoveSchedule
}
