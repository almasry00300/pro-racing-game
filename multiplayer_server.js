const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });
const players = {};

wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substring(2, 9);
    console.log(`🏎️ لاعب جديد اتصل بالسباق! المعرف: ${id}`);
    
    // إرسال المعرف الخاص باللاعب الجديد له
    ws.send(JSON.stringify({ type: 'init', id: id }));

    // استقبال حركة السيارات ومشاركتها مع الباقيين فوراً
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'move') {
                players[id] = { x: data.x, z: data.z, r: data.r };
                // بث تحديثات المواقع لكل اللاعبين المتصلين في نفس اللحظة
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === 1) {
                        client.send(JSON.stringify({ type: 'update', players: players }));
                    }
                });
            }
        } catch (e) {}
    });

    // عند خروج اللاعب أو قفل اللعبة
    ws.on('close', () => {
        delete players[id];
        console.log(`❌ لاعب غادر السباق: ${id}`);
    });
});
console.log('🌍 خادم التحديات أونلاين يعمل الآن بنجاح على بورت: 8080');
