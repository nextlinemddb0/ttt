const config = require('../config')
const { cmd, commands } = require('../command')
const axios = require('axios');
const sharp = require('sharp');
const Seedr = require("seedr");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { Buffer } = require('buffer'); 
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const fileType = require("file-type")
const l = console.log
const https = require("https")
const { URL } = require('url');
const { sizeFormatter} = require('human-readable');
const fg = require('api-dylux');
const { Octokit } = require("@octokit/rest");



cmd({
    pattern: "moviepro",
    react: '🔎',
    category: "movie",
    alias: ["mp"],
    desc: "moviepro search",
    use: ".moviepro movie name",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isSudo, isOwner, isMe, reply }) => {
    try {

        if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
            return reply("*This command currently only works for the Bot owner.*");
        }

        if (!q) return reply("*Please give movie or tv name 🎬*");

        const api = `https://moviepro.sadas.dev/api/search?keyword=${encodeURIComponent(q)}&key=sadas2012`;
        const { data: result } = await axios.get(api);

        if (!result.status || !result.results?.length) {
            return reply("*No results found ❌*");
        }

        let rows = [];

        result.results.slice(0, 30).forEach(movie => {
            rows.push({
                title: movie.title,
                description: `⭐ IMDb: ${movie.rating}`,
                rowId: `${prefix}movieprodl ${movie.id}`
            });
        });

        const sections = [{
            title: `Search Results (${rows.length})`,
            rows
        }];

        await conn.listMessage(from, {
            text: `🎬 *MOVIEPRO SEARCH*\n\n🔎 Query: *${q}*\n\n_Select movie below._`,
            footer: config.FOOTER,
            title: "MoviePro Downloader",
            buttonText: "📂 View Results",
            sections
        }, mek);

    } catch (e) {
        console.log(e);
        reply("*🚩 Search error!*");
    }
});


cmd({
    pattern: "movieprodl",
    react: '🎥',
    desc: "movie info",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return reply("*Please provide movie id!*");

        const api = `https://moviepro.sadas.dev/api/info?id=${q}&key=sadas2012`;
        const { data: res } = await axios.get(api);

        if (!res.status || !res.movie_details) {
            return reply("*🚩 Movie details not found!*");
        }

        const movie = res.movie_details;

        let msg = `*▫🍿 𝗧ɪᴛʟᴇ ➮* *_${movie.title}_*

*▫📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲𝗱 ➮* _${movie.releaseDate}_
*▫🌎 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${movie.countryName}_
*▫🎭 𝗚𝗲𝗻𝗿𝗲 ➮* _${movie.genre}_
*▫⭐ 𝗜𝗠𝗗𝗕 ➮* _${movie.imdbRatingValue}_`;

        let buttons = [];

        res.download_links.forEach(dl => {
            buttons.push({
                buttonId: `${prefix}movieprosend ${dl.direct_url}±${movie.title}±${movie.image}±${dl.quality}`,
                buttonText: {
                    displayText: `${dl.quality} - ${dl.size}`
                },
                type: 1
            });
        });

        await conn.buttonMessage(from, {
            image: { url: movie.image },
            caption: msg,
            footer: config.FOOTER,
            buttons,
            headerType: 4
        }, mek);

    } catch (e) {
        console.log(e);
        reply("*🚩 Info error!*");
    }
});


cmd({
    pattern: "movieprosend",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("*📍 Please provide link!*");

        const [directUrl, movieName, thumbUrl, quality] = q.split("±");

        const loading = await conn.sendMessage(from, {
            text: "*Uploading movie... ⬆️*"
        }, { quoted: mek });

        let thumb = null;

        if (thumbUrl) {
            try {
                const response = await axios.get(thumbUrl, {
                    responseType: "arraybuffer"
                });

                thumb = await sharp(Buffer.from(response.data))
                    .resize(300, 300, { fit: "cover" })
                    .jpeg({ quality: 80 })
                    .toBuffer();

            } catch (e) {
                console.log(e);
            }
        }

        await conn.sendMessage(from, {
            document: { url: directUrl },
            mimetype: "video/mp4",
            fileName: `🎬${movieName}.mp4`,
            jpegThumbnail: thumb,
            caption: `*🎬 ${movieName}*\n\n*\`${quality}\`*\n\n${config.NAME}`
        }, { quoted: mek });

        await conn.sendMessage(from, { delete: loading.key });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.log(e);
        reply("*❌ Error:* " + e.message);
    }
});


   cmd({
         pattern: "mv",
         react: "🔎",
         alias: ["movie", "film", "cinema"],
         desc: "all movie search",
         category: "movie",
         use: '.movie',
         filename: __filename
        },
async (conn, mek, m, {
	
from, prefix, l, quoted, q,
isPre, isSudo, isOwner, isMe, reply
}) => {
try {


    if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return await conn.sendMessage(from, {
        text: "*This command currently only works for the Bot owner. To disable it for others, use .the .settings command 👨‍🔧.*"
      }, { quoted: mek });
    }

    if (!q) return await reply('*Enter movie name..🎬*');

    const sources = [
      { name: "CINESUBZ", cmd: "cine" },
      { name: "SINHALASUB", cmd: "sinhalasub" },
      { name: "SUBLK", cmd: "sublk" },
       { name: "DINKA", cmd: "sublk" }
		
	 
    ];


    let imageBuffer;
    try {
      const res = await axios.get('https://nadeen-botzdatabse.vercel.app/MovieZoneX.png', {
        responseType: 'arraybuffer'
      });
      imageBuffer = Buffer.from(res.data, 'binary');
    } catch {
      imageBuffer = null; 
    }

    const caption = `_*MOVIExGO SYSTEM 🎬*_\n\n*\`🔍Input :\`* ${q}\n\n_*🌟 Select your preferred movie download site*_`;

  
      const buttons = sources.map(src => ({
        buttonId: prefix + src.cmd + ' ' + q,
        buttonText: { displayText: `_${src.name} Results 🍿_` },
        type: 1
      }));

      return await conn.buttonMessage2(from, {
        image: { url: config.LOGO },
        caption,
        footer: config.FOOTER,
        buttons,
        headerType: 4
      }, mek);
   

  } catch (e) {
    reply('*❌ Error occurred*');
    l(e);
  }
});



cmd({
    pattern: "cine",
    react: '🔎',
    category: "movie",
    alias: ["cz"],
    desc: "cinesubz movie search",
    use: ".cine movie name",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isSudo, isOwner, isMe, reply }) => {
    try {

        if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
            return reply("*This command currently only works for the Bot owner.*");
        }

        if (!q) return reply('*Please give me a movie name 🎬*');

        const apiUrl = `https://apis.sadas.dev/api/v1/movie/cinesubz/search?q=${q}&apiKey=ea4d57a2a2db72e0bb3ba58f56b1ff9b`;
        const { data: result } = await axios.get(apiUrl);

        if (!result.status || !result.data?.length) {
            return reply('*No results found ❌*');
        }

        let srh = [];

        result.data.slice(0, 30).forEach((movie) => {
            const cleanTitle = movie.title
                .replace(/Sinhala Subtitles \| සිංහල උපසිරැසි සමඟ/gi, "")
                .replace(/Sinhala Subtitle \| සිංහල උපසිරැසි සමඟ/gi, "")
                .trim();

            srh.push({
                title: cleanTitle,
                description: `📺 ${movie.type.toUpperCase()} | ⭐ ${movie.rating} | 🎞 ${movie.quality}`,
                rowId: `${prefix}cinedl2 ${movie.link}`
            });
        });

        const sections = [{
            title: `Search Results (${srh.length})`,
            rows: srh
        }];

        const listMessage = {
            text: `🎬 *CINESUBZ SEARCH*\n\n🔎 Query: *${q}*\n\n_Select a movie or series below._`,
            footer: config.FOOTER,
            title: 'Cinesubz Downloader',
            buttonText: '📂 View Results',
            sections
        };

        await conn.listMessage(from, listMessage, mek);

    } catch (e) {
        console.log(e);
        reply('*🚩 Error occurred while fetching data!*');
    }
});




cmd({
    pattern: "cinedl2",
    react: '🎥',
    desc: "movie downloader info",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return reply('*Please provide a link!*');

        const apiUrl = `https://apis.sadas.dev/api/v1/movie/cinesubz/info?q=${q}&apiKey=ea4d57a2a2db72e0bb3ba58f56b1ff9b`;
        const { data: res } = await axios.get(apiUrl);

        if (!res.status || !res.data) {
            return reply('*🚩 Movie details not found!*');
        }

        const movie = res.data;

        let msg = `*▫🍿 𝗧ɪᴛʟᴇ ➮* *_${movie.title}_*

*▫📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲𝗱 𝗗𝗮𝘁𝗲 ➮* _${movie.year}_
*▫🌎 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _N/A_
*▫💃 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${movie.imdb_rating}_
*▫⏰ 𝗤𝘂𝗮𝗹𝗶𝘁𝘆 ➮* _${movie.quality}_
*▫🎭 𝗖𝗮𝘀𝘁 ➮* ${movie.cast?.slice(0, 5).map(c => `• ${c.name} (${c.role})`).join('\n') || "N/A"}


*▫🕵️‍♀️ 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻 ➮* _${movie.description?.slice(0, 300) || "No description"}..._`;

        let buttons = [];

        buttons.push({
            buttonId: `${prefix}cdetails ${q}`,
            buttonText: { displayText: 'Details Card 📄' },
            type: 1
        });

        if (movie.download_links && movie.download_links.length > 0) {
            movie.download_links.forEach(dl => {
                buttons.push({
                    buttonId: `${prefix}nadeendl ${dl.final_link}±${movie.title}±${movie.poster}±${dl.quality}`,
                    buttonText: {
                        displayText: `${dl.quality} - ${dl.size}`
                    },
                    type: 1
                });
            });
        }

        const buttonMessage = {
            image: { url: movie.poster },
            caption: msg,
            footer: config.FOOTER,
            buttons,
            headerType: 4
        };

        await conn.buttonMessage(from, buttonMessage, mek);

    } catch (e) {
        console.log(e);
        reply('*🚩 Error occurred!*');
    }
});





cmd({
    pattern: "nadeendl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply('*📍 Please provide link!*');

        const [movieUrl, movieName, thumbUrl, quality] = q.split("±");
        if (!movieUrl) return reply('*⚠️ Invalid input!*');

        const api = `https://apis.sadas.dev/api/v1/movie/cinesubz/dl?q=${movieUrl}&apiKey=ea4d57a2a2db72e0bb3ba58f56b1ff9b`;
        const { data: res } = await axios.get(api);

        if (!res.status || !res.data?.links?.length) {
            return reply('*❌ Download link not found!*');
        }

        // direct link only (no pixeldrain / no telegram)
        const directLink = res.data.links.find(link =>
            link.includes('.mp4') &&
            !link.includes('pixeldrain') &&
            !link.includes('t.me')
        );

        if (!directLink) return reply('*❌ Direct file unavailable!*');

        const loading = await conn.sendMessage(from, {
            text: '*Uploading movie... ⬆️*'
        }, { quoted: mek });

        let thumb = null;

if (thumbUrl) {
    try {
        const response = await axios.get(thumbUrl, {
            responseType: "arraybuffer"
        });

        // Resize image using sharp
        thumb = await sharp(Buffer.from(response.data))
            .resize(300, 300, {
                fit: "cover"
            })
            .jpeg({ quality: 80 })
            .toBuffer();

    } catch (e) {
        console.log(e);
    }
}

        await conn.sendMessage(from, {
            document: { url: directLink },
            mimetype: 'video/mp4',
            fileName: `🎬𝕲𝖔𝖑𝖉𝖊𝖓 𝕾𝖈𝖗𝖊𝖊𝖓🎬${movieName}.mp4`,
            jpegThumbnail: thumb,
            caption: `*🎬 ${movieName}*\n\n*\`${quality || res.data.size}\`*\n\n${config.NAME}`
        }, { quoted: mek });

        await conn.sendMessage(from, { delete: loading.key });
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.log(e);
        reply('*❌ Error:* ' + e.message);
    }
});

cmd({
    pattern: "sinhalasub",
    react: '🔎',
    category: "movie",
    alias: ["cz"],
    desc: "sinhalasub.lk movie search",
    use: ".cine 2025",
    filename: __filename
},
async (conn, m, mek, {
    from, q, prefix, isPre, isSudo, isOwner, isMe, reply
}) => {
    try {
        // Premium check
        const pr = (await axios.get('https://raw.githubusercontent.com/Nadeenpoorna-app/main-data/refs/heads/main/master.json')).data;
        const isFree = pr.mvfree === "true";

        if (!isFree && !isMe && !isPre) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, {
                text: "*`You are not a premium user⚠️`*\n\n" +
                      "*Send a message to one of the 2 numbers below and buy Lifetime premium 🎉.*\n\n" +
                      "_Price : 200 LKR ✔️_\n\n" +
                      "*👨‍💻Contact us : 0778500326 , 0722617699*"
            }, { quoted: mek });
        }

        // Block check
        if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, {
                text: "*This command currently only works for the Bot owner.*"
            }, { quoted: mek });
        }

        if (!q) return await reply('*Please give me a movie name 🎬*');

        // Fetching Data from API
        const apiUrl = `https://apis.sadas.dev/api/v1/movie/sinhalasub/search?q=${q}&apiKey=sadasggggg`;
        const response = await axios.get(apiUrl);
        const result = response.data;

        if (!result.status || !result.data || result.data.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
        }

        let srh = [];
        result.data.forEach((movie) => {
            // Clean title
            const cleanTitle = movie.Title
                .replace("Sinhala Subtitles | සිංහල උපසිරැසි සමඟ", "")
                .replace("Sinhala Subtitle | සිංහල උපසිරැසි සමඟ", "")
                .trim();

            srh.push({
                title: cleanTitle,
                //description: `Quality: ${movie.quality} | Rating: ${movie.rating}`,
                rowId: `${prefix}sinhalasubinfo ${movie.Link}`
            });
        });

        const sections = [{
            title: "Sinhalasub.lk Search Results",
            rows: srh
        }];

        const listMessage = {
            text: `_*SINHALASUB MOVIE SEARCH RESULTS 🎬*_\n\n*\`Input :\`* ${q}\n\n*Select a movie from the list below to download.*`,
            footer: config.FOOTER,
            title: 'Sinhalasub Movie Downloader',
            buttonText: 'Click here to view',
            sections
        };

        // Sending the list
        await conn.listMessage(from, listMessage, mek);

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { text: '🚩 *Error occurred while fetching data!*' }, { quoted: mek });
    }
});



cmd({
    pattern: "sinhalasubinfo",
    react: '🎥',
    desc: "movie downloader info",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, prefix, reply }) => {
    try {
        if (!q) return await reply('*Please provide a link!*');

        // ලින්ක් එක encode කර API එකට යැවීම
        const apiUrl = `https://apis.sadas.dev/api/v1/movie/sinhalasub/infodl?q=${q}&apiKey=sadasggggg`;

        const res = await axios.get(apiUrl);
        const sadas = res.data;

        if (!sadas.status || !sadas.data) {
            return await conn.sendMessage(from, { text: '🚩 *Error fetching movie details!*' }, { quoted: mek });
        }

        const movie = sadas.data;

        // Message Format එක (ඔබ ඉල්ලූ පරිදි)
        // සටහන: මෙම API එකෙන් දැනට ලැබෙන්නේ title සහ size පමණක් බැවින් අනෙක්වා default අගයන් ලෙස තබා ඇත.
       let msg = `*🍿 𝗧ɪᴛʟᴇ ➮* *_${sadas.data.title || 'N/A'}_*

*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* _${sadas.data.date || 'N/A'}_
*🌎 𝗖ᴏᴜɴᴛʀʏ ➮* _${sadas.data.country || 'N/A'}_
*💃 𝗥ᴀᴛɪɴɢ ➮* _${sadas.data.rating || 'N/A'}_
*⏰ 𝗗ᴜʀᴀᴛɪᴏɴ ➮* _${sadas.data.duration || 'N/A'}_
*💁 𝗦ᴜʙᴛɪᴛʟᴇ ʙʏ ➮* _${sadas.data.subtitles || 'N/A'}_
*🎭 𝗗ᴇꜱᴄʀɪᴘᴛɪᴏɴ ➮* _${sadas.data.description ? sadas.data.description.substring(0, 100) + '...' : 'N/A'}_`

        let rows = [];

                rows.push(
    { buttonId: prefix + 'sinhalasubdetails ' + `${q}`, buttonText: { displayText: 'Details Card\n' }, type: 1 }

);
       // Download Links බොත්තම් ලෙස සැකසීම
// Download Links බොත්තම් ලෙස සැකසීම (Pixeldrain පමණක්)
if (sadas.data.downloadLinks && sadas.data.downloadLinks.length > 0) {
    sadas.data.downloadLinks.forEach((dl) => {
        // server එක Pixeldrain නම් පමණක් බොත්තමක් සාදන්න
        if (dl.server === "Pixeldrain") {
            rows.push({
                buttonId: `${prefix}sinhalasubdl ${dl.link}±${sadas.data.title}±${sadas.data.images[0]}±${dl.quality}`, 
                buttonText: { 
                    displayText: `${dl.size} - ${dl.quality}` 
                },
                type: 1
            });
        }
    });
}

        // පින්තූරය සහිත බොත්තම් පණිවිඩය
        const buttonMessage = {
            image: { url: movie.images[0] }, // API එකේ පින්තූරය නැති නිසා default logo එක
            caption: msg,
            footer: config.FOOTER,
            buttons: rows,
            headerType: 4
        };

        return await conn.buttonMessage(from, buttonMessage, mek);

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { text: '🚩 *Error !!*' }, { quoted: mek });
    }
});

cmd({
    pattern: "sinhalasubdl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply('*📍 Please provide the movie link!*');
        
        const [movieUrl, movieName, thumbUrl, quality] = q.split("±");
        if (!movieUrl || !movieName) return await reply('*⚠️ Invalid Format!*');

     const original_link = movieUrl;
const direct_link = original_link.replace("/u/", "/api/file/")
        // Thumbnail Processing
        let resizedBotImg = null;
        if (thumbUrl) {
            try {
                const botimgResponse = await fetch(thumbUrl);
                const botimgBuffer = await botimgResponse.buffer();
                resizedBotImg = await resizeImage(botimgBuffer, 200, 200);
            } catch (e) { console.log("Thumb error skipped"); }
        }

        // --- STEP 4: Sending File ---
        await conn.sendMessage(from, { 
            document: { url: direct_link }, 
            mimetype: 'video/mp4',
            fileName: `🎬𝕲𝖔𝖑𝖉𝖊𝖓 𝕾𝖈𝖗𝖊𝖊𝖓🎬 ${movieName}.mp4`,
            caption: `*🎬 Name :* *${movieName}*\n\n*\`${quality}\`*\n\n${config.NAME}`,
            jpegThumbnail: await (await fetch(thumbUrl.trim())).buffer(),
        }, { quoted: mek });

       
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.log("Error Log:", e);
        await reply(`*❌ Error:* ${e.message}`);
        await conn.sendMessage(from, { react: { text: "⚠️", key: mek.key } });
    }
});





































cmd({
    pattern: "cineauto",
    react: '🔄',
    category: "movie",
    desc: "A-Z Movie Automation with DB Save & File Sender",
    filename: __filename
},
async (conn, m, mek, { from, reply }) => {
    try {
        if (autoStatus) return await reply("*⚠️ Automation is already running!*");
        autoStatus = true;

        const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        await reply("*🚀 Starting A-Z Automation & DB Syncing...*");

        for (let char of alphabet) {
            if (!autoStatus) break;

            const searchUrl = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-search?q=${char}&apikey=82406ca340409d44`;
            const searchRes = await axios.get(searchUrl);
            if (!searchRes.data.status || !searchRes.data.data) continue;

            for (let movie of searchRes.data.data) {
                if (!autoStatus) break;

                try {
                    // 1. චිත්‍රපට විස්තර ලබා ගැනීම
                    const infoUrl = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${encodeURIComponent(movie.link)}&apikey=82406ca340409d44`;
                    const infoRes = await axios.get(infoUrl);
                    const movieData = infoRes.data.data;
                    if (!movieData) continue;

                    // 2. DB එක පරීක්ෂා කිරීම සහ ලින්ක් ලබා ගැනීම
                    const { db } = await getStoredData();
                    let linkData = db[movie.link] || null;

                    if (!linkData) {
                        const dlApi = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(movie.link)}&apikey=82406ca340409d44`;
                        const dlRes = await axios.get(dlApi);
                        const dlLinks = dlRes.data.data.download;
                        const target = dlLinks.find(l => l && (l.name === "mega" || l.name === "gdrive" || l.name === "pix"));

                        if (target) {
                            linkData = { type: target.name, url: target.url };
                            await saveToDb(movie.link, linkData); // DB එකට Save කිරීම
                        }
                    }

                    if (linkData) {
                        // 3. Card එක යැවීම
                        let msg = `*🍿 𝗧ɪᴛʟᴇ ➮* *_${movieData.title}_*\n*📅 𝗬ᴇᴀʀ ➮* _${movieData.year || 'N/A'}_\n*⚖️ 𝗦ɪᴢᴇ ➮* _${movieData.size || 'N/A'}_`;
                        await conn.sendMessage(from, { image: { url: movieData.image }, caption: msg });

                        // 4. File එක Direct කර යැවීම
                        let finalDownloadUrl = "";
                        if (linkData.type === 'mega') {
                            const megaRes = await axios.get(`https://apis.sadas.dev/api/v1/download/mega?q=${encodeURIComponent(linkData.url)}&apiKey=${MEGA_API_KEY}`);
                            finalDownloadUrl = megaRes.data.data.result.download;
                        } else if (linkData.type === 'gdrive') {
                            const gdRes = await fg.GDriveDl(linkData.url.replace('download?id=', 'file/d/').split('&')[0]);
                            finalDownloadUrl = gdRes.downloadUrl;
                        }
                                                 else { finalDownloadUrl = linkData.url }

                        await conn.sendMessage(from, { 
                            document: { url: finalDownloadUrl }, 
                            mimetype: 'video/mp4',
                            fileName: `🎬 ${movieData.title}.mp4`,
                            caption: `*✅ Done:* ${movieData.title}`
                        });
                    }

                    // විරාමයක් ලබා දීම
                    await new Promise(resolve => setTimeout(resolve, 15000));

                } catch (err) {
                    console.log("Error in Loop:", err);
                    continue;
                }
            }
        }
        autoStatus = false;
        await reply("*✅ A-Z Automation Completed!*");
    } catch (e) {
        autoStatus = false;
        console.log(e);
    }
});

// Stop Command
cmd({ pattern: "stopauto", filename: __filename }, async (conn, m, mek, { reply }) => {
    autoStatus = false;
    await reply("*🛑 Automation Stopped!*");
});













cmd({
    pattern: "cdetails",
    react: '🎬',
    desc: "Movie details sender from Cinesubz",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, reply }) => {
    try {
        if (!q) return reply('*Please provide a link!*');

        const apiUrl = `https://apis.sadas.dev/api/v1/movie/cinesubz/info?q=${q}&apiKey=ea4d57a2a2db72e0bb3ba58f56b1ff9b`;
        const { data: res } = await axios.get(apiUrl);

        if (!res.status || !res.data) {
            return reply('*🚩 Movie details not found!*');
        }

        const movie = res.data;

        let msg = `*▫🍿 𝗧ɪᴛʟᴇ ➮* *_${movie.title}_*

*▫📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲𝗱 𝗗𝗮𝘁𝗲 ➮* _${movie.year}_
*▫🌎 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _N/A_
*▫⭐ 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${movie.imdb_rating}_
*▫🔮 𝗤𝘂𝗮𝗹𝗶𝘁𝘆 ➮* _${movie.quality}_
*▫🎭 𝗖𝗮𝘀𝘁 ➮* ${movie.cast?.slice(0, 5).map(c => `• ${c.name} (${c.role})`).join('\n') || "N/A"}
*▫🕵️‍♀️ 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻 ➮* _${movie.description?.slice(0, 300) || "No description"}..._\n⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛\n🪀Follow us : https://whatsapp.com/channel/0029Vb8NvTj5K3zbmo1MCo35\n⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛\n\n\`𝕲𝖔𝖑𝖉𝖊𝖓 𝕾𝖈𝖗𝖊𝖊𝖓 🎬💛✨\``;

        await conn.sendMessage(config.JID || from, {
            image: { url: movie.poster },
            caption: msg
        });
    } catch (error) {
        console.error('Error:', error);
        await conn.sendMessage(from, '⚠️ *An error occurred while fetching details.*', { quoted: mek });
    }
});

cmd({
    pattern: "sinhalasubdetails",
    react: '🎬',
    desc: "Movie details sender from SinhalaSub",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, reply }) => {
    try {
        if (!q) 
            return await reply('⚠️ *Please provide the movie search query!*');

        // ඔබ දුන් API URL එක (q යනු සෙවිය යුතු නමයි)
        let apiUrl = `https://apis.sadas.dev/api/v1/movie/sinhalasub/infodl?q=${q}&apiKey=sadasggggg`;
        let sadas = await fetchJson(apiUrl);

        if (!sadas || !sadas.status || !sadas.data) {
            return await conn.sendMessage(from, { text: '🚩 *Error: Could not find movie details!*' }, { quoted: mek });
        }

        const movie = sadas.data;
         let details = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data;
        // විස්තර පෙළ සැකසීම
        let msg = `*🎬 𝗧ɪᴛʟᴇ ➮* *_${movie.title || 'N/A'}_*

*📅 𝗬ᴇᴀʀ ➮* _${movie.date || 'N/A'}_
*🌟 𝗥ᴀᴛɪɴɢ ➮* _${movie.rating || 'N/A'}_
*⏰ 𝗗ᴜʀᴀᴛɪᴏɴ ➮* _${movie.duration || 'N/A'}_
*🌍 𝗖ᴏᴜɴᴛʀʏ ➮* _${movie.country || 'N/A'}_
*✍️ 𝗔ᴜᴛʜᴏʀ ➮* _${movie.author || 'N/A'}_
*📂 𝗦ᴜʙᴛɪᴛʟᴇꜱ ➮* _${movie.subtitles || 'N/A'}_
*📝 𝗗ᴇsᴄʀɪᴘᴛɪᴏɴ ➮*
_${movie.description || 'N/A'}_
\n⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛\n🪀Follow us : https://whatsapp.com/channel/0029Vb8NvTj5K3zbmo1MCo35\n⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛\n\n${config.NAME}`;

        // පණිවිඩය යැවීම
        await conn.sendMessage(from, {
            image: { url: movie.images[0] }, // API එකේ images array එකේ පළමු එක
            caption: msg
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (error) {
        console.error('Error:', error);
        await conn.sendMessage(from, { text: '⚠️ *An error occurred while fetching details.*' }, { quoted: mek });
    }
});





cmd({
    pattern: "imdb",  
    alias: ["mvinfo","filminfo"],
    desc: "Fetch detailed information about a movie.",
    category: "movie",
    react: "🎬",
    use: '.movieinfo < Movie Name >',
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, msr, creator, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {


if(!q) return await reply(msr.giveme)
        
        const apiUrl = `http://www.omdbapi.com/?t=${encodeURIComponent(q)}&apikey=76cb7f39`;
        const response = await axios.get(apiUrl);

        const data = response.data;
       
const details = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data
 
        const movieInfo = `*☘️ 𝗧ɪᴛʟᴇ ➮* ${data.Title}


*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* ${data.Released}
*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* ${data.Runtime}
*🎭 𝗚ᴇɴᴀʀᴇꜱ ➮* ${data.Genre}
*💁‍♂️ 𝗦ᴜʙᴛɪᴛʟᴇ ʙʏ ➮* ${data.Director}
*🌎 𝗖ᴏᴜɴᴛʀʏ ➮* ${data.Country}
*💃 𝗥ᴀᴛɪɴɢ ➮* ${data.imdbRating}

\n⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛\n🪀Follow us : https://whatsapp.com/channel/0029Vb8NvTj5K3zbmo1MCo35\n⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛\n*\n${config.NAME}`;

        // Define the image URL
        const imageUrl = data.Poster && data.Poster !== 'N/A' ? data.Poster : config.LOGO;

        // Send the movie information along with the poster image
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: `${movieInfo}
            
           `
          
        });
    } catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
})

cmd({
    pattern: "sublk",
    react: '🔎',
    category: "movie",
    alias: ["cz"],
    desc: "Search movies from SubzLK",
    use: ".cine movie name",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isSudo, isOwner, isMe, reply }) => {
    try {

        if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
            return reply("*This command currently only works for the Bot owner.*");
        }

        if (!q) return reply("*Please give me a movie name 🎬*");

        const apiUrl = `https://apis.sadas.dev/api/v1/movie/sublk/search?q=${q}&apiKey=ea4d57a2a2db72e0bb3ba58f56b1ff9b`;
        const { data: result } = await axios.get(apiUrl);

        if (!result.status || !result.data?.length) {
            return reply("*No results found ❌*");
        }

        let rows = [];

        result.data.slice(0, 30).forEach((movie) => {
            const cleanTitle = movie.title
                .replace(/Sinhala Subtitles \|.*$/gi, "")
                .replace(/Sinhala Subtitle \|.*$/gi, "")
                .replace(/\| සිංහල.*$/gi, "")
                .trim();

            rows.push({
                title: cleanTitle,
                description: `⭐ ${movie.imdb_rating || "N/A"} | 📅 ${movie.year || "N/A"}`,
                rowId: `${prefix}sdl ${movie.url}`
            });
        });

        const sections = [{
            title: `Search Results (${rows.length})`,
            rows
        }];

        const listMessage = {
            text: `🎬 *SUBZLK SEARCH*\n\n🔎 Query: *${q}*\n\n_Select a movie below._`,
            footer: config.FOOTER,
            title: 'SubzLK Downloader',
            buttonText: '📂 View Results',
            sections
        };

        await conn.listMessage(from, listMessage, mek);

    } catch (e) {
        console.log(e);
        reply("*🚩 Error occurred while fetching data!*");
    }
});








cmd({
    pattern: "sdl",
    react: '🎥',
    desc: "SubzLK movie info",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return reply("*Please provide a movie link!*");

        const apiUrl = `https://apis.sadas.dev/api/v1/movie/sublk/infodl?q=${encodeURIComponent(q)}&apiKey=ea4d57a2a2db72e0bb3ba58f56b1ff9b`;
        const { data: res } = await axios.get(apiUrl);

        if (!res.status || !res.data) {
            return reply("*🚩 Movie details not found!*");
        }

        const movie = res.data;

        const cleanTitle = movie.title
            .replace(/Sinhala Subtitles \|.*$/gi, "")
            .replace(/Sinhala Subtitle \|.*$/gi, "")
            .replace(/\| සිංහල.*$/gi, "")
            .trim();

        let msg = `*▫🍿 𝗧ɪᴛʟᴇ ➮* *_${cleanTitle}_*

*▫📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲𝗱 ➮* _${movie.releaseDate || "N/A"}_
*▫🌎 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${movie.country || "N/A"}_
*▫⏱ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲 ➮* _${movie.runtime || "N/A"}_
*▫🔞 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${movie.contentRating || "N/A"}_
*▫⭐ 𝗜𝗠𝗗𝗯 ➮* _${movie.ratingValue || "N/A"}/10_
*▫🎭 𝗚𝗲𝗻𝗿𝗲 ➮* _${movie.genres?.join(", ") || "N/A"}_`;

     let buttons = [];

        // details button
        buttons.push({
            buttonId: `${prefix}subdetails ${q}`,
            buttonText: { displayText: "Details 📄" },
            type: 1
        });

           movie.pixeldrainDownloads?.slice(0, 3).forEach(dl => {
            buttons.push({
                buttonId: `${prefix}subdl ${dl.finalDownloadUrl}±${cleanTitle}±${movie.imageUrl}±${dl.quality}`,
                buttonText: {
                    displayText: `${dl.quality} • ${dl.size}`
                },
                type: 1
            });
        });

        const buttonMessage = {
            image: { url: movie.imageUrl },
            caption: msg,
            footer: config.FOOTER,
            buttons,
            headerType: 4
        };

        await conn.buttonMessage(from, buttonMessage, mek);

    } catch (e) {
        console.log(e);
        reply("*🚩 Error occurred while fetching movie info!*");
    }
});

cmd({
    pattern: "subdl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {

    if (typeof isUploadinggggg !== 'undefined' && isUploadinggggg) {
        return await conn.sendMessage(from, {
            text: '*A movie is already being uploaded. Please wait until it finishes.* ⏳',
            quoted: mek
        });
    }

    try {
        const [downloadUrl, title, imglink, quality] = q.split("±");

        if (!downloadUrl || !title || !imglink) {
            return await reply("⚠️ Invalid format.");
        }

        isUploadinggggg = true;

        await conn.sendMessage(from, {
            text: '*Uploading your movie... ⬆️*',
            quoted: mek
        });

        const message = {
            document: { url: downloadUrl.trim() },
            mimetype: "video/mp4",
            fileName: `🎬𝕲𝖔𝖑𝖉𝖊𝖓 𝕾𝖈𝖗𝖊𝖊𝖓🎬${title.trim()} ${quality || ""}.mp4`,
            jpegThumbnail: await (await fetch(imglink.trim())).buffer(),
            caption: `🎬 *${title.trim()}*\n\n*${quality || "Movie"}*\n\n${config.NAME}`
        };

        await conn.sendMessage(config.JID || from, message, { quoted: mek });

        await conn.sendMessage(from, {
            react: { text: '✔️', key: mek.key }
        });

    } catch (e) {
        console.error("subdl error:", e);
        reply('🚫 *Error Occurred !!*\n\n' + e.message);
    } finally {
        isUploadinggggg = false;
    }
});

cmd({
    pattern: "subdetails",
    react: '🎬',
    desc: "Movie details sender from SubzLK",
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply('*Please provide a link!*');

        const apiUrl = `https://apis.sadas.dev/api/v1/movie/sublk/infodl?q=${encodeURIComponent(q)}&apiKey=ea4d57a2a2db72e0bb3ba58f56b1ff9b`;
        const { data: res } = await axios.get(apiUrl);

        if (!res.status || !res.data) {
            return reply('*🚩 Movie details not found!*');
        }

        const movie = res.data;

       

        let msg = `*▫🍿 𝗧ɪᴛʟᴇ ➮* *_${movie.title}_*

*▫📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲𝗱 𝗗𝗮𝘁𝗲 ➮* _${movie.releaseDate || "N/A"}_
*▫🌎 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${movie.country || "N/A"}_
*▫⏱️ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲 ➮* _${movie.runtime || "N/A"}_
*▫🔞 𝗖𝗼𝗻𝘁𝗲𝗻𝘁 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${movie.contentRating || "N/A"}_
*▫⭐ 𝗜𝗠𝗗𝗯 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${movie.ratingValue || "N/A"}/10_
*▫🗳️ 𝗩𝗼𝘁𝗲𝘀 ➮* _${movie.ratingCount || "0"}_

*▫🎭 𝗚𝗲𝗻𝗿𝗲 ➮*
${movie.genres?.map(g => `• ${g}`).join('\n') || "N/A"}\n⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛\n🪀Follow us : https://whatsapp.com/channel/0029Vb8NvTj5K3zbmo1MCo35\n⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛⇛\n${config.NAME}`;

        await conn.sendMessage(config.JID || from, {
            image: { url: movie.imageUrl },
            caption: msg
        }, { quoted: mek });

    } catch (error) {
        console.error('Error:', error);
        await conn.sendMessage(from, {
            text: '⚠️ *An error occurred while fetching details.*'
        }, { quoted: mek });
    }
});




