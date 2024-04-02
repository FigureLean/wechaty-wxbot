import {log, Message, Room, Wechaty} from "wechaty";
import * as PUPPET from "wechaty-puppet";
import {bot} from "./main";
import {FileBox} from 'file-box';
export const LOGPRE = "[PadLocalDemo]"


// 连接到数据库

export async function getMessagePayload(message: Message) {
  switch (message.type()) {
    case PUPPET.types.Message.Text: {
      log.silly(LOGPRE, `get message text: ${message.text()}`);
      break;
    }
    case PUPPET.types.Message.Attachment:
    case PUPPET.types.Message.Audio: {
      const attachFile = await message.toFileBox();

      const dataBuffer = await attachFile.toBuffer();

      log.info(LOGPRE, `get message audio or attach: ${dataBuffer.length}`);

      break;
    }

    case PUPPET.types.Message.Video: {
      const videoFile = await message.toFileBox();

      const videoData = await videoFile.toBuffer();

      log.info(LOGPRE, `get message video: ${videoData.length}`);

      break;
    }

    case PUPPET.types.Message.Emoticon: {
      const emotionFile = await message.toFileBox();

      const emotionJSON = emotionFile.toJSON();
      log.info(LOGPRE, `get message emotion json: ${JSON.stringify(emotionJSON)}`);

      const emotionBuffer: Buffer = await emotionFile.toBuffer();

      log.info(LOGPRE, `get message emotion: ${emotionBuffer.length}`);

      break;
    }

    case PUPPET.types.Message.Image: {
      const messageImage = await message.toImage();

      const thumbImage = await messageImage.thumbnail();
      const thumbImageData = await thumbImage.toBuffer();

      log.info(LOGPRE, `get message image, thumb: ${thumbImageData.length}`);

      const hdImage = await messageImage.hd();
      const hdImageData = await hdImage.toBuffer();

      log.info(LOGPRE, `get message image, hd: ${hdImageData.length}`);

      const artworkImage = await messageImage.artwork();
      const artworkImageData = await artworkImage.toBuffer();

      log.info(LOGPRE, `get message image, artwork: ${artworkImageData.length}`);

      break;
    }

    case PUPPET.types.Message.Url: {
      const urlLink = await message.toUrlLink();
      log.info(LOGPRE, `get message url: ${JSON.stringify(urlLink)}`);

      const urlThumbImage = await message.toFileBox();
      const urlThumbImageData = await urlThumbImage.toBuffer();

      log.info(LOGPRE, `get message url thumb: ${urlThumbImageData.length}`);

      break;
    }

    case PUPPET.types.Message.MiniProgram: {
      const miniProgram = await message.toMiniProgram();

      log.info(LOGPRE, `MiniProgramPayload: ${JSON.stringify(miniProgram)}`);

      break;
    }
  }
}


// 将数据库查询封装成返回 Promise 的函数
function queryDatabase(conn: any, sql: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    conn.query(sql, (err: Error, rows: any[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
        // console.log("执行查询");
        // console.log(rows);
      }
    });
  });
}

let sendNum = 0;//全局变量，设置发送消息的次数

export async function sendPostMessage(bot: Wechaty, conn: any) {
  // const lastMessageTimeMap: Map<string, number> = new Map();
  const roomList = await bot.Room.findAll();
  let messageArray: Array<string> = [];
  const sql: string = "SELECT post_text_content,wx_url_link FROM post_message WHERE post_time > NOW() - INTERVAL 30 MINUTE AND state = '2' ";
  // const sql:string = "SELECT post_text_content FROM post_message";
  console.log("开始发送信息");


  // 等待数据库查询完成
  const rows = await queryDatabase(conn, sql);

  rows.forEach((row)=>{
    if(row.post_text_content !== null && row.post_text_content !== undefined && row.post_text_content !== ''){
      let truncatedText :string = '';
      if(row.post_text_content.length>20){
        if(row.wx_url_link !== null && row.wx_url_link !== ''){
          // truncatedText = row.post_text_content;
          truncatedText = row.post_text_content.substring(0,14)+'...'+'\n'+row.wx_url_link;
        }
        // else{
        //   // truncatedText = row.post_text_content+'\n'+row.wx_url_link;
        //   truncatedText = row.post_text_content.substring(0,14)+'...';
        // }
      }
      else{
        if(row.wx_url_link !== null && row.wx_url_link !== ''){
          truncatedText = row.post_text_content+'\n'+row.wx_url_link;
        }
        // else{
        //   truncatedText = row.post_text_content;
        // }
        
      }
      messageArray.push(truncatedText as string);
      // console.log(truncatedText);
      // console.log(messageArray);
      // console.log(truncatedText);
    }
  });


  if (messageArray.length > 0) {

      // let messageString: string = "";
      let messageString = messageArray.join('\n\n');
    // console.log(messageString);
    // const path:string = "image/cover.jpg";
    // const fileBox = FileBox.fromFile(path);
    
    try {

      if (messageString!== ''||messageString!==null){

        for (let room of roomList) {

          console.log(messageString);
          // room.say("下面开始推送\n"+messageString);
          
          // await room.say(messageString);
          waitAndExecute(room,messageString);
          
          // await room.say(fileBox);
          
        }
        // sendNum ++ ;

        
        // console.log('发送了'+sendNum);
        // if(sendNum % 10 === 0&&sendNum!=0){
          
        //   for(let room of roomList){
        //     console.log('发送图片');
        //     await room.say(fileBox);
        //   }
        //   sendNum = 0;
        // }

      }
     

    } catch (error) {
      console.error('发送消息时出错：', error);
    }
  }


}


async function BotSay(room, msg) {
  await room.say(msg);
}

function waitAndExecute(room, msg) {
  let delay = Math.random() * 10000;
  console.log("延时时间：" + delay);

  setTimeout(async () => {
    await BotSay(room, msg);
  }, delay);
}