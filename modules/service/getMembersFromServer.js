const fs = require('fs');

exports.execute = async (client) => {
    const members = client.guilds.filter(g => g.id === '117579849794715652').first().members;

    const listOfMembers = members.filter(m => m.user.bot === false).map(u => {
        const userRoles = u.roles.filter(r => r.name !== '@everyone').map(r => r.name);
        userRoles.sort(function(a,b) {
            return a < b ? -1 : a > b ? 1 : 0;
        });
        return {
            cmdrName: u.nickname || u.displayName,
            joinedAt: u.joinedAt,
            role: userRoles.join(' - '),
        };
    });

    listOfMembers.sort(function(a,b) {
        var x = a.cmdrName.toLowerCase();
        var y = b.cmdrName.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    let exportCSV =  'CMDR NAME,ENTROU EM,CARGOS\n';

    listOfMembers.forEach(member => {
        exportCSV += `${member.cmdrName},${member.joinedAt},${member.role}\n`;
    });

    exportCSV += `\n\nTotal: ${listOfMembers.length}`;
    const fileName = './cw-members.csv';
    await fs.promises.writeFile(fileName, exportCSV);

    return Promise.resolve(fileName);
};