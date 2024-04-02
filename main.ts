import {log, ScanStatus, WechatyBuilder} from "wechaty";
import {PuppetPadlocal} from "wechaty-puppet-padlocal";
import { getMessagePayload, LOGPRE, sendPostMessage} from "./helper";

/****************************************
 * 去掉注释，可以完全打开调试日志
 ****************************************/
// log.level("silly");

const puppet = new PuppetPadlocal({
    token: ""//此处写下token
})
// const mysql = require('mysql');
import * as mysql from 'mysql'
const conn = mysql.createConnection({
  // host: 'localhost',//本地运行
  // host:'host.docker.internal',//本机docker运行
  host:'',//服务器切换为此地址
  user: 'root',//数据库用户名
  password: '',//数据库密码
  // password: '123456',
  database: ''//写数据库的名字
});


// 连接到数据库
conn.connect((err: Error) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database');
});
const bot = WechatyBuilder.build({
  name: "PadLocalDemo",
  puppet,
})
  .on("scan", (qrcode, status) => {
    if (status === ScanStatus.Waiting && qrcode) {
      const qrcodeImageUrl = [
        'https://wechaty.js.org/qrcode/',
        encodeURIComponent(qrcode),
      ].join('')

      log.info(LOGPRE, `onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);

      require('qrcode-terminal').generate(qrcode, {small: true})  // show qrcode on console
    } else {
      log.info(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`);
    }
  })

  .on("login",  async (user) => {
    log.info(LOGPRE, `${user} login`);
    // await sendPostMessage(bot);
    setInterval(async () => {
      await sendPostMessage(bot,conn);
    }, 900000); // 60000毫秒 = 60秒，900000毫秒 = 15分钟
  })

  .on("logout", (user, reason) => {
    log.info(LOGPRE, `${user} logout, reason: ${reason}`);
  })

  .on("message", async (message) => {
    log.info(LOGPRE, `on message: ${message.toString()}`);
    // log.info(`${message.room()`});
    // console.log(message.room());
    // const roomList =  await bot.Room.findAll()

    await getMessagePayload(message);
    // await sendMessageRoom2(message);


  })

  .on("room-invite", async (roomInvitation) => {
    log.info(LOGPRE, `on room-invite: ${roomInvitation}`);
  })

  .on("room-join", (room, inviteeList, inviter, date) => {
    log.info(LOGPRE, `on room-join, room:${room}, inviteeList:${inviteeList}, inviter:${inviter}, date:${date}`);
  })

  .on("room-leave", (room, leaverList, remover, date) => {
    log.info(LOGPRE, `on room-leave, room:${room}, leaverList:${leaverList}, remover:${remover}, date:${date}`);
  })

  .on("room-topic", (room, newTopic, oldTopic, changer, date) => {
    log.info(LOGPRE, `on room-topic, room:${room}, newTopic:${newTopic}, oldTopic:${oldTopic}, changer:${changer}, date:${date}`);
  })

  .on("friendship", (friendship) => {
    log.info(LOGPRE, `on friendship: ${friendship}`);
  })

  .on("error", (error) => {
    log.error(LOGPRE, `on error: ${error}`);
  })

bot.start().then(() => {
  log.info(LOGPRE, "started.");


});


export {
  bot
}
