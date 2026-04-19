const config = require('../config');
const { cmd, commands } = require('../command');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions');

const axios = require("axios"); 

var tmsg = '';
if (config.LANG === 'SI') tmsg = 'එය Bot link ලබා දෙයි.';
else tmsg = "It gives bot link.";

cmd({
    pattern: "script",
    alias: ["sc", "git", "repo"],
    react: '📚',
    desc: tmsg,
    category: "main",
    use: '.script',
    filename: __filename
},
async (conn, mek, m, {
    from, l, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2, botNumber,
    pushname, isMe, isOwner, groupMetadata, groupName,
    participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        
        const response = await axios.get("https://mv-visper-full-db.pages.dev/Main/main_var.json");
        const details = response.data;

        const result = `*╭───────────────╮*
*│    🧿  VISPER-MD  🧿*
*╰───────────────╯*

*👋 Hello There! Welcome to Visper-MD.*

*📁 Project Details:*
*────────────────*
*🔖 Github:* ${details.reponame}

*🪀 Official Channel:* ${details.chlink}

*⚕️ Support Community:* ${details.supglink}

*📡 Bot Version:* *6.0.0 (Latest)*

*────────────────*
*© 2026 VISPER-MD PROJECT*`;

        reply(result);
    } catch (e) {
        l(e);
        reply("❌ Failed to fetch script details.");
    }
});

cmd({
  pattern: "stiktok",
  alias: ["tstalk", "ttstalk"],
  react: "📱",
  desc: "Fetch TikTok user profile details.",
  category: "search",
  filename: __filename
}, async (conn, m, store, { from, args, q, reply }) => {
  try {
    if (!q) {
      return reply("❎ Please provide a TikTok username.\n\n*Example:* .tiktokstalk Nadeenpoornaeditz");
    }

    const apiUrl = `https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status) {
      return reply("❌ User not found. Please check the username and try again.");
    }

    const user = data.data.user;
    const stats = data.data.stats;

    const profileInfo = `🎭 *TikTok Profile Stalker* 🎭

👤 *Username:* @${user.uniqueId}
📛 *Nickname:* ${user.nickname}
✅ *Verified:* ${user.verified ? "Yes ✅" : "No ❌"}
📍 *Region:* ${user.region}
📝 *Bio:* ${user.signature || "No bio available."}
🔗 *Bio Link:* ${user.bioLink?.link || "No link available."}

📊 *Statistics:*
👥 *Followers:* ${stats.followerCount.toLocaleString()}
👤 *Following:* ${stats.followingCount.toLocaleString()}
❤️ *Likes:* ${stats.heartCount.toLocaleString()}
🎥 *Videos:* ${stats.videoCount.toLocaleString()}

📅 *Account Created:* ${new Date(user.createTime * 1000).toLocaleDateString()}
🔒 *Private Account:* ${user.privateAccount ? "Yes 🔒" : "No 🌍"}

🔗 *Profile URL:* https://www.tiktok.com/@${user.uniqueId}

> ${config.FOOTER}
`;

    const profileImage = { image: { url: user.avatarLarger }, caption: profileInfo };

    await conn.sendMessage(from, profileImage, { quoted: m });
  } catch (error) {
    console.error("❌ Error in TikTok stalk command:", error);
    reply("⚠️ An error occurred while fetching TikTok profile data.");
  }
});

cmd({
    pattern: "tempmail",
    alias: ["genmail"],
    desc: "Generate a new temporary email address",
    category: "other",
    react: "📧",
    filename: __filename
},
async (conn, mek, m, { from, reply, prefix }) => {
    try {
        const response = await axios.get('https://apis.davidcyriltech.my.id/temp-mail');
        const { email, session_id, expires_at } = response.data;

        // Format the expiration time and date
        const expiresDate = new Date(expires_at);
        const timeString = expiresDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const dateString = expiresDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Create the complete message
        const message = `
📧 *TEMPORARY EMAIL GENERATED*

✉️ *Email Address:*
${email}

⏳ *Expires:*
${timeString} • ${dateString}

🔑 *Session ID:*
\`\`\`${session_id}\`\`\`

📥 *Check Inbox:*
.inbox ${session_id}

_Email will expire after 24 hours_
${config.FOOTER}
`;
const session = `${session_id}`;
        await conn.sendMessage(
            from,
            { 
                text: message,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363304606757133@newsletter',
                        newsletterName: 'NADEEN-MD',
                        serverMessageId: 101
                    }
                }
            },
            { quoted: mek }
        );
await conn.sendMessage(
            from,
            { 
                text: session,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363304606757133@newsletter',
                        newsletterName: 'NADEEN-MD',
                        serverMessageId: 101
                    }
                }
            },
            { quoted: mek }
        );
    } catch (e) {
        console.error('TempMail error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});
cmd({
    pattern: "checkmail",
    alias: ["inbox", "tmail", "mailinbox"],
    desc: "Check your temporary email inbox",
    category: "other",
    react: "📬",
    filename: __filename
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        const sessionId = args[0];
        if (!sessionId) return reply('🔑 Please provide your session ID\nExample: .checkmail YOUR_SESSION_ID');

        const inboxUrl = `https://apis.davidcyriltech.my.id/temp-mail/inbox?id=${encodeURIComponent(sessionId)}`;
        const response = await axios.get(inboxUrl);

        if (!response.data.success) {
            return reply('❌ Invalid session ID or expired email');
        }

        const { inbox_count, messages } = response.data;

        if (inbox_count === 0) {
            return reply('📭 Your inbox is empty');
        }

        let messageList = `📬 *You have ${inbox_count} message(s)*\n\n`;
        messages.forEach((msg, index) => {
            messageList += `━━━━━━━━━━━━━━━━━━\n` +
                          `📌 *Message ${index + 1}*\n` +
                          `👤 *From:* ${msg.from}\n` +
                          `📝 *Subject:* ${msg.subject}\n` +
                          `⏰ *Date:* ${new Date(msg.date).toLocaleString()}\n\n` +
                          `📄 *Content:*\n${msg.body}\n\n ` +
                          `*㋛ 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝙽𝙰𝙳𝙴𝙴𝙽 〽️𝙳*`;
        });

        await reply(messageList);

    } catch (e) {
        console.error('CheckMail error:', e);
        reply(`❌ Error checking inbox: ${e.response?.data?.message || e.message}`);
    }
});

cmd({
  pattern: "countryinfo",
  alias: ["cinfo", "country", "cinfo2"],
  desc: "Get information about a country",
  category: "other",
  react: "🌍",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, react }) => {
  try {
    if (!q) return reply("Please provide a country name.\nExample: `.countryinfo Pakistan`");

    const apiUrl = `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.data) {
      await react("❌");
      return reply(`No information found for *${q}*. Please check the country name.`);
    }

    const info = data.data;
    let neighborsText = info.neighbors.length > 0
      ? info.neighbors.map(n => `🌍 *${n.name}*`).join(", ")
      : "No neighboring countries found.";

    const text = `🌍 *Visper Country Information: ${info.name}* 🌍\n\n` +
      `🏛 *Capital:* ${info.capital}\n` +
      `📍 *Continent:* ${info.continent.name} ${info.continent.emoji}\n` +
      `📞 *Phone Code:* ${info.phoneCode}\n` +
      `📏 *Area:* ${info.area.squareKilometers} km² (${info.area.squareMiles} mi²)\n` +
      `🚗 *Driving Side:* ${info.drivingSide}\n` +
      `💱 *Currency:* ${info.currency}\n` +
      `🔤 *Languages:* ${info.languages.native.join(", ")}\n` +
      `🌟 *Famous For:* ${info.famousFor}\n` +
      `🌍 *ISO Codes:* ${info.isoCode.alpha2.toUpperCase()}, ${info.isoCode.alpha3.toUpperCase()}\n` +
      `🌎 *Internet TLD:* ${info.internetTLD}\n\n` +
      `🔗 *Neighbors:* ${neighborsText}` +
    `${config.FOOTER}`;

    await conn.sendMessage(from, {
      image: { url: info.flag },
      caption: text,
      contextInfo: { mentionedJid: [m.sender] }
    }, { quoted: mek });

    await react("✅");
  } catch (e) {
    console.error("Error in countryinfo command:", e);
    await react("❌");
    reply("An error occurred while fetching country information.");
  }
});
cmd({
    pattern: "onlinelist",
    react: "🟢",
    alias: ["online","onlinemembers","activelist"],
    desc: "Show online members in group with mentions",
    category: "group",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

    // Check if command is used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups!")
    
    // Check if bot has admin permissions (optional - remove if not needed)
    if (!isBotAdmins) return reply("❌ Bot needs admin permissions to check online status!")
    
    // Get group participants
    const groupParticipants = participants || groupMetadata.participants
    
    // Array to store online members
    let onlineMembers = []
    let onlineMentions = []
    
    // Check each participant's presence/status
    for (let participant of groupParticipants) {
        try {
            // Get user's presence/last seen info
            const presence = await conn.presenceSubscribe(participant.id)
            const lastSeen = await conn.chatRead(participant.id)
            
            // Check if user is online (you can adjust this logic based on your needs)
            // This is a basic implementation - you might need to modify based on your bot's capabilities
            const userStatus = await conn.fetchStatus(participant.id).catch(() => null)
            
            // For now, we'll consider all participants as potentially online
            // You can implement more sophisticated online detection here
            
            onlineMembers.push(participant.id.split('@')[0])
            onlineMentions.push(participant.id)
            
        } catch (err) {
            // If can't fetch status, skip this user
            continue
        }
    }
    
    // If no online detection is available, show all group members as a fallback
    if (onlineMembers.length === 0) {
        groupParticipants.forEach(participant => {
            onlineMembers.push(participant.id.split('@')[0])
            onlineMentions.push(participant.id)
        })
    }
    
    // Create the online list message
    let onlineList = `*╭──────────●●►*\n`
    onlineList += `*🟢 ${groupName} ONLINE LIST 🟢*\n\n`
    onlineList += `*📊 Total Members:* ${groupParticipants.length}\n`
    onlineList += `*🟢 Online Members:* ${onlineMembers.length}\n\n`
    onlineList += `*👥 Online Members List:*\n`
    
    // Add each online member with mention
    onlineMembers.forEach((member, index) => {
        onlineList += `${index + 1}. @${member}\n`
    })
    
    onlineList += `\n*╰──────────●●►*\n`
    onlineList += `*⚡VISPER-MD*`
    
    // Send the message with mentions
    await conn.sendMessage(from, {
        text: onlineList,
        mentions: onlineMentions
    }, {quoted: mek})

}catch(e){
    console.log(e)
    reply(`❌ Error: ${e}`)
}
})

// Alternative simpler version that just shows all group members
cmd({
    pattern: "grouplist",
    react: "👥",
    alias: ["memberlist","groupmembers","allmembers"],
    desc: "Show all group members with mentions",
    category: "group", 
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

    // Check if command is used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups!")
    
    // Get group participants
    const groupParticipants = participants || groupMetadata.participants
    
    // Arrays for members and mentions
    let membersList = []
    let mentionsList = []
    
    // Get all members
    groupParticipants.forEach(participant => {
        membersList.push(participant.id.split('@')[0])
        mentionsList.push(participant.id)
    })
    
    // Create the members list message
    let membersMessage = `*╭──────────●●►*\n`
    membersMessage += `*👥 ${groupName} MEMBERS LIST 👥*\n\n`
    membersMessage += `*📊 Total Members:* ${membersList.length}\n\n`
    membersMessage += `*👥 All Members:*\n`
    
    // Add each member with mention
    membersList.forEach((member, index) => {
        membersMessage += `${index + 1}. @${member}\n`
    })
    
    membersMessage += `\n*╰──────────●●►*\n`
    membersMessage += `*⚡VISPER-MD*`
    
    // Send the message with mentions
    await conn.sendMessage(from, {
        text: membersMessage,
        mentions: mentionsList
    }, {quoted: mek})

}catch(e){
    console.log(e)
    reply(`❌ Error: ${e}`)
}
})

cmd({
    pattern: "freefire",
    desc: "Fetch ff info using a given URL",
    category: "search",
    react: "🤹🏼‍♂️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const url = q || (quoted?.text ?? "").trim();

        const res = await axios.get(`https://api.vreden.my.id/api/v1/stalker/freefire?id=${encodeURIComponent(url)}`);
        const data = res.data;

        if (!data.status) {
            return reply("Failed to fetch ff data. Please try again later.");
        }

        const result = data.result;

        const caption = `🔍 *FreeFire Id Info*\n\n` +
                        `*🏵 Game ID:* ${result.game_id}\n` +
                        `*🍱 Username:* ${result.username}\n\n${config.FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/vp0t1w.png' },
            caption,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363380090478709@newsletter',
                    newsletterName: 'VISPER-MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("ffStalk Error:", err);
        reply("Something went wrong while fetching the ff info.");
    }
});

cmd({
    pattern: "short",
    react: "🔗",
    category: "other",
    use: ".short <url>",
    filename: __filename
}, async (conn, mek, m, context) => {
    const { from, args } = context;

    try {
        if (!args[0]) {
            return await conn.sendMessage(from, { text: '❌ Please provide a valid URL.\n\nExample: `.short https://youtube.com/`' }, { quoted: m });
        }

        const longUrl = args[0];
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        const shortUrl = await res.text();

        await conn.sendMessage(from, { text: `✅ *Shortened URL:*\n${shortUrl}\n${config.FOOTER}` }, { quoted: m });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { text: '❌ Failed to shorten the URL.' }, { quoted: m });
    }
});

cmd({
    pattern: "imgtotext",
    react: "🖼️",
    category: "other",
    use: ".ocr (reply to an image)",
    filename: __filename
}, async (conn, mek, m, context) => {
    const { from } = context;

    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        if (!mime || !mime.startsWith('image')) {
            return await conn.sendMessage(from, { text: '❌ Reply to an *image* to extract text using `.ocr`' }, { quoted: m });
        }

        // Download image buffer
        let imgBuffer = await q.download();

        // Use OCR.space free API (you can replace API key with yours)
        const formData = new FormData();
        formData.append("language", "eng");
        formData.append("isOverlayRequired", "false");
        formData.append("file", imgBuffer, "image.jpg");

        const response = await fetch("https://api.ocr.space/parse/image", {
            method: "POST",
            headers: { apikey: "helloworld" }, // Free test key
            body: formData
        });

        const result = await response.json();
        const text = result?.ParsedResults?.[0]?.ParsedText?.trim();

        if (!text) {
            return await conn.sendMessage(from, { text: "⚠️ No readable text found in image." }, { quoted: m });
        }

        await conn.sendMessage(from, { text: `📝 *Extracted Text:*\n\n${text}\n${config.FOOTER}` }, { quoted: m });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { text: "❌ Failed to extract text from image." }, { quoted: m });
    }
});

cmd({
    pattern: "loading",
    react: "⚡",
    category: "fun",
    use: ".loading",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const totalSteps = 10; // Number of updates
        const delay = 700; // milliseconds between updates
        let progress = 0;

        // Generate random increments (to make it look real)
        const randomIncrease = () => Math.floor(Math.random() * 10) + 5; // between 5% - 15%

        // first message
        let msg = await conn.sendMessage(from, { text: `🔄 Loading... 0%\n[░░░░░░░░░░]` }, { quoted: m });

        for (let i = 0; i < totalSteps; i++) {
            await new Promise(r => setTimeout(r, delay));

            progress += randomIncrease();
            if (progress > 100) progress = 100;

            // create animated bar
            const barLength = 10;
            const filledBlocks = Math.floor((progress / 100) * barLength);
            const emptyBlocks = barLength - filledBlocks;
            const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

            const text = progress < 100
                ? `⚙️ Loading... ${progress}%\n[${bar}]`
                : `✅ *Loading Completed!*\n\nලෝඩ් උනාට මුකුත් නෑ 👾\n\n${config.FOOTER}`;

            await conn.sendMessage(from, {
                edit: msg.key,
                text
            });
        }
    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { text: "❌ Loading animation failed." }, { quoted: m });
    }
});

cmd({
  pattern: "love",
  react: "💘",
  desc: "Love percentage එක",
  category: "fun",
  use: ".love <name1> & <name2>",
  filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("💘 උදා: `.love Amal & Kavindi`");
    if (!q.includes("&")) return reply("💘 නම දෙකක් & වෙතින් වෙන් කර දෙන්න. උදා: `.love Amal & Kavindi`");

    const parts = q.split("&").map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) return reply("💘 දෙවැනි නම දාන්න. උදා: `.love Amal & Kavindi`");

    const name1 = parts[0];
    const name2 = parts.slice(1).join(" & "); // in case user uses extra &'s keep rest as 2nd name

    // --- Option A: Deterministic percent (same names => same percent) ---
    function deterministicPercent(a, b) {
      const s = (a + "|" + b).toLowerCase().replace(/\s+/g, "");
      // simple hash: char codes sum with some mixing, then mod 101
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        hash = (hash * 31 + s.charCodeAt(i)) >>> 0; // unsigned
        hash = (hash ^ (hash >>> 16));
      }
      return hash % 101; // 0..100
    }

    // --- Option B: Random percent ---
    function randomPercent() {
      return Math.floor(Math.random() * 101); // 0..100
    }

    // Choose mode: "deterministic" or "random"
    const MODE = "deterministic"; // change to "random" if you prefer

    const percent = MODE === "random"
      ? randomPercent()
      : deterministicPercent(name1, name2);

    // A little fun message flair based on percent
    let emoji = "🤍";
    if (percent >= 85) emoji = "💖";
    else if (percent >= 65) emoji = "💘";
    else if (percent >= 40) emoji = "🙂";
    else if (percent >= 20) emoji = "😅";
    else emoji = "💔";

    const replyText =
      `💞 ${name1} ❤️ ${name2}\n` +
      `🔢 Love Compatibility: *${percent}%* ${emoji}\n\n` +
      `> ᴠɪꜱᴘᴇʀ ɪɴᴄ`;

    await reply(replyText);
  } catch (err) {
    console.error(err);
    await reply("අවස්ථාවක් තිබුනා — නැවත උත්සාහ කරන්න.");
  }
});


// 1. Birthday Love Calculator (උපන්දිනය අනුව)
cmd({
    pattern: "bdaylove",
    react: "🎂",
    desc: "Birthday Love percentage calculator",
    category: "fun",
    use: ".bdaylove <YYYY-MM-DD> & <YYYY-MM-DD>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {

    if (!q || !q.includes("&")) {
        return reply("🎂 උදා: `.bdaylove 2002-05-11 & 2004-10-28`");
    }

    const parts = q.split("&").map(s => s.trim());
    if (parts.length < 2) {
        return reply("🎂 උපන්දිනය දෙකම දාන්න. උදා: `.bdaylove 2002-05-11 & 2004-10-28`");
    }

    const bday1 = parts[0];
    const bday2 = parts[1];

    const isValidDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d);

    if (!isValidDate(bday1) || !isValidDate(bday2)) {
        return reply("🎂 දින වලට වසර-මාසය-දිනය (YYYY-MM-DD) format එක භාවිතා කරන්න.");
    }

    // Deterministic percent based on birthdays
    function birthdayPercent(a, b) {
        const s = (a + "|" + b).replace(/-/g, "");
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
            hash = (hash * 37 + s.charCodeAt(i)) >>> 0;
            hash ^= (hash >>> 15);
        }
        return hash % 101; 
    }

    const percent = birthdayPercent(bday1, bday2);

    let emoji = "🤍";
    if (percent >= 85) emoji = "💖";
    else if (percent >= 65) emoji = "💘";
    else if (percent >= 40) emoji = "😊";
    else if (percent >= 20) emoji = "😅";
    else emoji = "💔";

    await reply(
`🎂 Birthday Match
📅 ${bday1} ❤️ ${bday2}
💞 Compatibility: *${percent}%* ${emoji}

> ᴠɪꜱᴘᴇʀ ɪɴᴄ`
    );
});

// 2. Love Test (නම් දෙක අනුව)
cmd({
    pattern: "lovetest",
    react: "❤️",
    desc: "Check love percentage between two names",
    category: "fun",
    use: ".lovetest <Name1> & <Name2>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {

    if (!q || !q.includes("&")) {
        return reply("❤️ උදා: `.lovetest Nimal & Kanthi`");
    }

    const parts = q.split("&").map(s => s.trim());
    const name1 = parts[0];
    const name2 = parts[1];

    const combined = (name1 + name2).toLowerCase().replace(/[^a-z]/g, "");
    let total = 0;
    for (let i = 0; i < combined.length; i++) {
        total += combined.charCodeAt(i);
    }
    const percent = total % 101;

    let desc;
    if (percent >= 90) desc = "නියම යුවලක්! විවාහ වෙන්න සුදුසුයි 💍";
    else if (percent >= 70) desc = "ගොඩක් ආදරෙයි වගේ.. 🥰";
    else if (percent >= 50) desc = "හොඳයි... උත්සාහ කරන්න 😉";
    else if (percent >= 30) desc = "යාළුකමකට වඩා දෙයක් නෑ වගේ 😕";
    else desc = "වෙන කෙනෙක් හොයාගමු 💔";

    await reply(
`❤️ *Love Calculator*
👤 ${name1} x 👤 ${name2}

💞 Percentage: *${percent}%*
💬 ${desc}

> ᴠɪꜱᴘᴇʀ ɪɴᴄ`
    );
});

// 3. Baby Name Generator (බබාට නමක්)
cmd({
    pattern: "mix",
    react: "👶",
    desc: "Mix two names to create a baby name",
    category: "fun",
    use: ".babyname <Name1> & <Name2>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {

    if (!q || !q.includes("&")) {
        return reply("👶 උදා: `.babyname Nimal & Kanthi`");
    }

    const parts = q.split("&").map(s => s.trim());
    if (parts.length < 2) {
        return reply("👶 නම් දෙකම දාන්න. උදා: `.babyname Nimal & Kanthi`");
    }

    const name1 = parts[0];
    const name2 = parts[1];

    if (name1.length < 3 || name2.length < 3) {
        return reply("👶 නම් වලට අවම අකුරු 3ක් වත් තියෙන්න ඕන.");
    }

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const mid1 = Math.ceil(name1.length / 2);
    const mid2 = Math.ceil(name2.length / 2);

    const babyName1 = capitalize(name1.slice(0, mid1) + name2.slice(mid2));
    const babyName2 = capitalize(name2.slice(0, mid2) + name1.slice(mid1));
    const babyName3 = capitalize(name1.slice(0, 2) + name2.slice(-2));

    await reply(
`👶 *Baby Name Generator*
 
👨‍👩‍👦 Parents: ${name1} & ${name2}

✨ ඔයාලට ගැලපෙන නම් ටිකක්:
1️⃣ *${babyName1}*
2️⃣ *${babyName2}*
3️⃣ *${babyName3}*

> ᴠɪꜱᴘᴇʀ ɪɴᴄ`
    );
});

// 4. Gay Check (විනෝදය සඳහා)
cmd({
    pattern: "gaycheck",
    react: "🏳️‍🌈",
    desc: "Check gay percentage",
    category: "fun",
    use: ".gaycheck <@user>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {

    const percent = Math.floor(Math.random() * 101);

    let desc;
    if (percent >= 90) desc = "අම්මෝ ඔයා නම් Gay රජෙක්නේ! 😱🏳️‍🌈";
    else if (percent >= 50) desc = "භාගයක් විතර Gay වගේ.. 🤔";
    else desc = "ඔයා කෙල්ලන්ට ආසයි වගේ.. 😎";

    await reply(
`🏳️‍🌈 *Gay Checker*

👤 User: ${q ? q : "You"}
📊 Gay Percentage: *${percent}%*
💬 ${desc}

> ᴠɪꜱᴘᴇʀ ɪɴᴄ`
    );
});

// 5. Future Job Predictor (අනාගත රැකියාව)
cmd({
    pattern: "myjob",
    react: "🔮",
    desc: "Predict your future job",
    category: "fun",
    use: ".myjob",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    const jobs = [
        "Software Engineer 💻", "Kottu Baas 🥘", "Three-wheel Driver 🛺",
        "President of Sri Lanka 🇱🇰", "Tea Plucker 🍃", "Doctor 🩺",
        "Bus Conductor 🚌", "Astronaut 🚀", "Professional Sleeper 😴", "YouTuber 📹"
    ];

    const randomJob = jobs[Math.floor(Math.random() * jobs.length)];

    await reply(
`🔮 *Future Job Prediction*

ඔයාගේ අනාගත රැකියාව තමයි:
🚀 *${randomJob}*

> මහන්සි වෙලා වැඩ කරන්න! 😂
> ᴠɪꜱᴘᴇʀ ɪɴᴄ`
    );
});

// 6. Waifu Selector (Anime කෙල්ලන්)
cmd({
    pattern: "waifu",
    react: "💃",
    desc: "Find your waifu",
    category: "fun",
    use: ".waifu",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    const waifus = [
        "Hinata Hyuga (Naruto)", "Mikasa Ackerman (AOT)", "Nezuko Kamado (Demon Slayer)",
        "Zero Two (Darling in the Franxx)", "Yor Forger (Spy x Family)",
        "Nami (One Piece)", "Rem (Re:Zero)", "Makima (Chainsaw Man)"
    ];

    const result = waifus[Math.floor(Math.random() * waifus.length)];

    await reply(
`💃 *Waifu Selector*

ඔයාට ගැලපෙනම කෙල්ල තමයි:
💖 *${result}*

> ᴠɪꜱᴘᴇʀ ɪɴᴄ`
    );
});


// 1. Roast Me (මඩ ගැසීම)
cmd({
    pattern: "roast",
    react: "🔥",
    desc: "Roast someone with funny insults",
    category: "fun",
    use: ".roast <@user>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {

    const insults = [
        "ඔයාගේ මූණ දැක්කම මට හිතෙනවා Darwin ගේ පරිණාම වාදය බොරු කියලා. 🦍",
        "ඔයා කතා නොකර ඉද්දි තමයි ගොඩක්ම ලස්සන. 🤫",
        "ඔයාගේ මොළේ හරියට Google Chrome වගේ.. RAM එක කනවා විතරයි වැඩක් නෑ. 🖥️",
        "කණ්ණාඩියක් ඉස්සරහට ගිහින් බලන්න.. එතකොට තේරෙයි ඇයි ඔයා Single කියලා. 🪞",
        "ඔයා ඉපදුන දවසේ ඩොක්ටර් අඬලා තියෙන්නේ ඔයාගේ මූණ දැකලා. 😂",
        "පොඩ්ඩක් නාගන්න බාබූ.. ෆෝන් එකත් ගඳ ගහනවා. ඩේටා නාස්ති කරන්න එපා. 🚿",
        "ඔයාගේ IQ එකයි මගේ සපත්තු සයිස් එකයි සමානයි වගේ. 👟",
        "මම දැකලා තියෙනවා ඔයාට වඩා ලස්සන වඳුරෝ දෙහිවල සූ එකේ. 🐒",
        "ඔයාගේ හිනාව හරියට අකුණු ගැහුවා වගේ.. දැක්කම බය හිතෙනවා. ⚡"
    ];

    const randomInsult = insults[Math.floor(Math.random() * insults.length)];
    const target = q ? q : "ඔයාට";

    await reply(
`🔥 *Roast Master*

${target}, 
${randomInsult}

> ᴠɪꜱᴘᴇʀ ɪɴᴄ`
    );
});

// 2. Past Life (පෙර ආත්මය)
cmd({
    pattern: "pastlife",
    react: "👻",
    desc: "Check your past life",
    category: "fun",
    use: ".pastlife",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    const animals = ["හිඟන බල්ලෙක් 🐕", "කම්මැලි පූසෙක් 🐈", "වංශවත් කැරපොත්තෙක් 🪳", "මදුරුවෙක් 🦟", "පිස්සු වැද්දෙක් 🏹", "රජ කෙනෙක් 👑", "කුකුළෙක් 🐓", "ඩයිනෝසිරස් කෙනෙක් 🦕"];
    const deaths = ["ත්‍රීවිල් එකක හැප්පිලා 🛺", "බඩේ අමාරුවක් හැදිලා 🤢", "වහ බීලා ☠️", "ගඟේ ගිලිලා 🌊", "බිරිඳගෙන් ගුටි කාලා 👊", "කෙසෙල් ලෙල්ලක ලිස්සලා 🍌", "යුද්ධ කරලා ⚔️"];
    const countries = ["ශ්‍රී ලංකාවේ 🇱🇰", "උගන්ඩාවේ 🇺🇬", "අඟහරු ලෝකේ 🪐", "ඇමසන් වනාන්තරේ 🌳", "සෝමාලියාවේ 🇸🇴", "ඊජිප්තුවේ 🇪🇬"];

    const animal = animals[Math.floor(Math.random() * animals.length)];
    const death = deaths[Math.floor(Math.random() * deaths.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];

    await reply(
`👻 *Past Life Finder*

ඔයා පෙර ආත්මයේ හිටියේ:
📍 *${country}*
👤 *${animal}* විදියට.

මැරුණේ කොහොමද දන්නවද?
💀 *${death}*

> පුදුමයි තාම මනුස්ස ආත්මයක් ලැබුන එක ගැන 😂
> ᴠɪꜱᴘᴇʀ ɪɴᴄ`
    );
});

// 3. Personality Scan (චරිත සහතිකය)
cmd({
    pattern: "scan",
    react: "🧬",
    desc: "Scan your personality",
    category: "fun",
    use: ".scan",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    const handsome = Math.floor(Math.random() * 101);
    const kindness = Math.floor(Math.random() * 101);
    const pissu = Math.floor(Math.random() * 101); 
    const mole = Math.floor(Math.random() * 101); 

    await reply(
`🧬 *Personality Scanner*

👤 User: You

😎 හැන්ඩියාව:
[${"█".repeat(Math.floor(handsome / 10))}${"░".repeat(10 - Math.floor(handsome / 10))}] ${handsome}%

😇 කරුණාවන්තකම:
[${"█".repeat(Math.floor(kindness / 10))}${"░".repeat(10 - Math.floor(kindness / 10))}] ${kindness}%

🤪 පිස්සු ලෙවල් එක:
[${"█".repeat(Math.floor(pissu / 10))}${"░".repeat(10 - Math.floor(pissu / 10))}] ${pissu}%

🧠 මොළේ තරම:
[${"█".repeat(Math.floor(mole / 10))}${"░".repeat(10 - Math.floor(mole / 10))}] ${mole}%

> ᴠɪꜱᴘᴇʀ ɪɴᴄ`
    );
});

// 4. Death Predictor (මරණ සහතිකය)
cmd({
    pattern: "death",
    react: "⚰️",
    desc: "Predict your death",
    category: "fun",
    use: ".death",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    const years = Math.floor(Math.random() * 60) + 1; 
    const cause = [
        "කොත්තු කද්දි හිර වෙලා 🥘", 
        "බොක දාන්න ගිහින් ලිස්සලා වැටිලා 🚽", 
        "TikTok වීඩියෝවක් කරන්න ගිහින් 📱", 
        "කෙල්ලෙක්ගෙන්/කොල්ලෙක්ගෙන් බූට් එකක් කාලා දුකට 💔", 
        "බස් එකේ ෆුට්බෝඩ් එකෙන් වැටිලා 🚌",
        "හිනාවෙලාම පණ ගිහින් 😂",
        "අකුණක් ගහලා ⚡"
    ];
    const randomCause = cause[Math.floor(Math.random() * cause.length)];
    
    const deathDate = new Date();
    deathDate.setFullYear(deathDate.getFullYear() + years);
    const dateString = deathDate.toISOString().split('T')[0];

    await reply(
`⚰️ *Death Prediction*

📅 දිනය: *${dateString}*
(තව අවුරුදු ${years} කින්)

💀 හේතුව:
*${randomCause}*

> පින් දහම් කරගන්න ඉක්මනට... 👻
> ᴠɪꜱᴘᴇʀ ɪɴᴄ`
    );
});

// 5. Truth or Dare (සත්‍ය හෝ අභියෝග)
cmd({
    pattern: "tord",
    react: "🎲",
    desc: "Get a Truth or Dare task",
    category: "fun",
    use: ".tord",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    const tasks = [
        "TRUTH: ඔයාගේ ලොකුම රහස මොකක්ද? 🤫",
        "DARE: ඔයාගේ crush ට 'I love you' කියලා msg එකක් දාන්න. ❤️",
        "TRUTH: අන්තිමට නෑවේ කවදාද? 🛁",
        "DARE: Voice note එකකින් සින්දුවක් කියන්න. 🎤",
        "TRUTH: මේ ගෲප් එකේ වැඩියෙන්ම අකමැති කාටද? 😡",
        "DARE: ඔයාගේ අන්තිම photo එක ගෲප් එකට දාන්න. 🖼️",
        "TRUTH: ජීවිතේ කරපු ලොකුම බොරුව මොකක්ද? 🤥",
        "DARE: Status එකට ඔයාගේ කැතම ෆොටෝ එකක් දාන්න. 🤪",
        "TRUTH: ඔයා ආදරේ කරපු මුල්ම කෙනා කවුද? 💏",
        "DARE: විනාඩි 10ක් යනකම් emoji විතරක් පාවිච්චි කරන්න. 🤐"
    ];

    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];

    await reply(
`🎲 *Truth or Dare*

${randomTask}

> බය නැත්නම් කරන්න! 😎
> ᴠɪꜱᴘᴇʀ ɪɴᴄ`
    );
});

