const config = require('../config')
const { cmd, commands } = require('../command')
const axios = require('axios');
const cheerio = require('cheerio');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const sharp = require('sharp');

// ==================== HELPERS ====================


async function searchAnime(q) {
    const url = `https://animexin.dev/?s=${encodeURIComponent(q)}&post_type=anime`;
    const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" }
    });
    const $ = cheerio.load(data);
    const results = [];
    $(".bsx").each((i, el) => {
        const title = $(el).find(".tt").text().trim().split('\t')[0];
        const link = $(el).find("a").attr("href");
        results.push({ title, url: link });
    });
    return results;
}


async function getAnimeDetails(url) {
    const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(data);
    const title = $(".entry-title").text().trim();
    const image = $(".thumb img").attr("src") || $(".infox img").attr("src");
    const description = $(".entry-content p").text().trim() || $(".desc").text().trim();
    
    let info = "";
    $(".spe span").each((i, el) => {
        info += `*${$(el).text().trim()}*\n`;
    });

    const episodes = [];
    $(".eplister li").each((i, el) => {
        const epTitle = $(el).find(".epl-title").text().trim() || $(el).find("a").text().trim();
        const epUrl = $(el).find("a").attr("href");
        if (epTitle && epUrl) {
            episodes.push({ title: epTitle, url: epUrl });
        }
    });
    return { title, image, description, info, episodes };
}


async function getMediafireLink(mfUrl) {
    try {
        const apiUrl = `https://api-dark-shan-yt.koyeb.app/download/mediafire?url=${encodeURIComponent(mfUrl)}&apikey=82406ca340409d44`;
        const { data } = await axios.get(apiUrl);
        
        if (data && data.status && data.data && data.data.url) {
            return {
                dl_link: data.data.url,
                size: data.data.size,
                title: data.data.title
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}


async function getResizedThumb(url) {
    try {
        if (!url) return null;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        return await sharp(buffer).resize(200, 200).jpeg({ quality: 80 }).toBuffer();
    } catch (e) {
        return null;
    }
}

// ==================== COMMANDS ====================

// 1. ANIME SEARCH
cmd({
    pattern: "anime",
    react: '🔍',
    category: "anime",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return await reply('*Please enter an Anime name! ⛩️*');
        const results = await searchAnime(q);
        if (results.length === 0) return await reply('*No results found ❌*');

        let rows = results.map(v => ({
            title: v.title,
            rowId: `${prefix}aniinfo ${v.url}`
        }));

        await conn.listMessage(from, {
            text: `\n*ANIMEXIN SEARCH RESULTS ⛩️*\n\n*🔎 Input:* ${q}\n\n*Select an anime from the list below.*`,
            footer: config.FOOTER,
            buttonText: 'Select Anime 🎬',
            sections: [{ title: "Search Results", rows }]
        }, mek);
    } catch (e) { reply('🚩 *Error during search!*'); }
});

// 2. ANIME INFO & EPISODES
cmd({
    pattern: "aniinfo",
    react: "⛩️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        const anime = await getAnimeDetails(q);
        const posterUrl = anime.image || config.LOGO;
        const episodes = anime.episodes; 

        const LIMIT = 20;
        const totalParts = Math.ceil(episodes.length / LIMIT);

        for (let i = 0; i < totalParts; i++) {
            let chunk = episodes.slice(i * LIMIT, (i + 1) * LIMIT);
            let buttons = [];

            if (i === 0) {
                buttons.push({ buttonId: `${prefix}anidetails ${q}`, buttonText: { displayText: 'View Details 📋' }, type: 1 });
                buttons.push({ buttonId: `${prefix}aniallquality ${q}`, buttonText: { displayText: '📥 Download All Episodes' }, type: 1 });
            }

            chunk.forEach(ep => {
                buttons.push({
                    buttonId: `${prefix}anidlopt ${ep.url}±${ep.title.replace(/±/g, '-')}`,
                    buttonText: { displayText: ep.title },
                    type: 1
                });
            });

            let caption = `*🍿 Title:* ${anime.title}\n*📂 Part:* ${i + 1}/${totalParts}\n\nSelect an episode below:`;
            await conn.buttonMessage(from, {
                image: { url: posterUrl },
                caption: caption,
                footer: config.FOOTER,
                buttons: buttons,
                headerType: 4
            }, mek);
            
            if (totalParts > 1) await new Promise(res => setTimeout(res, 1500));
        }
    } catch (e) { reply('🚩 *Error fetching information!*'); }
});

// 3. DETAILS CARD
cmd({
    pattern: "anidetails",
    react: '📋',
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        const anime = await getAnimeDetails(q);
        let msg = `*✨ ANIME DETAILS ✨*\n\n` +
                  `*🍿 Title:* ${anime.title}\n\n` +
                  `${anime.info}\n` +
                  `*📝 Description:* ${anime.description.substring(0, 500)}...\n\n` +
                  `${config.FOOTER}`;
                  

        const targetJid = config.JID || from;
        
      
        await conn.sendMessage(targetJid, { image: { url: anime.image }, caption: msg });
        
        if (targetJid !== from) {
            await reply('✅ *Details sent to the target group!*');
        }

    } catch (e) { reply('🚩 *Error fetching details!*'); }
});

// 4. DOWNLOAD ALL - QUALITY SELECTION
cmd({
    pattern: "aniallquality",
    react: "📑",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        let buttons = [
            { buttonId: `${prefix}anidlall ${q}±360`, buttonText: { displayText: "360p Quality" }, type: 1 },
            { buttonId: `${prefix}anidlall ${q}±480`, buttonText: { displayText: "480p Quality" }, type: 1 },
            { buttonId: `${prefix}anidlall ${q}±720`, buttonText: { displayText: "720p Quality" }, type: 1 },
            { buttonId: `${prefix}anidlall ${q}±1080`, buttonText: { displayText: "1080p Quality" }, type: 1 }
        ];

        await conn.buttonMessage(from, {
            image: { url: config.LOGO },
            caption: `*📥 DOWNLOAD ALL EPISODES*\n\nPlease select the video quality for all episodes:`,
            footer: config.FOOTER,
            buttons: buttons,
            headerType: 4
        }, mek);
    } catch (e) { reply("🚩 *Error fetching quality menu!*"); }
});

// 5. DOWNLOAD ALL - EXECUTION PROCESS
cmd({
    pattern: "anidlall",
    react: "⏳",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        const [mainUrl, selectedQuality] = q.split("±");
        const targetJid = config.JID || from;
        
        await reply(`*🚀 Download All Started!*\n\nDownloading all episodes (${selectedQuality}p) to the target chat. Please wait...`);

        const anime = await getAnimeDetails(mainUrl);
        const episodesToDownload = anime.episodes.reverse(); 

        for (const ep of episodesToDownload) {
            try {
                const { data } = await axios.get(ep.url, { headers: { "User-Agent": "Mozilla/5.0" } });
                const $ = cheerio.load(data);
                
                let mfUrl = null;
                
                $("a").each((i, el) => {
                    const link = $(el).attr("href");
                    if (link && link.includes("mediafire.com")) {
                        const parentText = $(el).parent().text().toLowerCase() || $(el).parent().parent().text().toLowerCase();
                        if (parentText.includes(selectedQuality)) {
                            mfUrl = link;
                        }
                    }
                });

                if (!mfUrl) {
                    $("a").each((i, el) => {
                        const link = $(el).attr("href");
                        if (link && link.includes("mediafire.com") && !mfUrl) {
                            mfUrl = link;
                        }
                    });
                }

                if (mfUrl) {
                    const mfData = await getMediafireLink(mfUrl);
                    if (mfData && mfData.dl_link) {
                        const finalTitle = mfData.title || ep.title;
                        const fileSize = mfData.size || "Unknown Size";
                        const thumb = await getResizedThumb(config.LOGO);

                        await conn.sendMessage(targetJid, {
                            document: { url: mfData.dl_link },
                            fileName: `🎬 ${finalTitle}.mp4`,
                            mimetype: "video/mp4",
                            jpegThumbnail: thumb,
                            caption: `*🎬 Name:* ${finalTitle}\n*📦 Size:* ${fileSize}\n*🎥 Quality:* ${selectedQuality}p\n\n${config.NAME}`
                        });
                        
                        await new Promise(resolve => setTimeout(resolve, 4000));
                    }
                }
            } catch (err) {
                console.log(`Failed to process ${ep.title}:`, err.message);
            }
        }
        await reply(`*✅ All episodes downloaded successfully to the target chat!*`);
    } catch (e) {
        console.error("Download All Error:", e);
        reply('🚩 *Error during Download All process!*'); 
    }
});

// 6. SINGLE DOWNLOAD OPTIONS (Mediafire)
cmd({
    pattern: "anidlopt",
    react: "📥",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        const [epUrl, title] = q.split("±");
        const { data } = await axios.get(epUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);
        
        let buttons = [];
        $("a").each((i, el) => {
            const link = $(el).attr("href");
            const name = $(el).text().trim();
            if (link && link.includes("mediafire.com")) {
                buttons.push({
                    buttonId: `${prefix}anidrive ${link}±${title}`,
                    buttonText: { displayText: `Mediafire - ${name}` },
                    type: 1
                });
            }
        });

        if (buttons.length === 0) return reply("🚩 *No Mediafire link found for this episode.*");

        await conn.buttonMessage(from, {
            image: { url: config.LOGO }, 
            caption: `*🎬 Episode:* ${title}\n\nSelect a download option below:`,
            footer: config.FOOTER,
            buttons: buttons,
            headerType: 4
        }, mek);

    } catch (e) { reply("🚩 *Error fetching download links!*"); }
});

// 7. SINGLE FINAL DOWNLOAD EXECUTION
cmd({
    pattern: "anidrive",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        let [mfUrl, defaultTitle] = q.split("±");
        
        if (!mfUrl) return reply("🚩 *Invalid link.*");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const mfData = await getMediafireLink(mfUrl);
        if (!mfData || !mfData.dl_link) return reply("🚩 *Failed to get direct link.*");

        const thumb = await getResizedThumb(config.LOGO);
        const finalTitle = mfData.title || defaultTitle;
        const fileSize = mfData.size || "Unknown Size";

        const targetJid = config.JID || from;
        await conn.sendMessage(targetJid, {
            document: { url: mfData.dl_link },
            fileName: `🎬 ${finalTitle}.mp4`,
            mimetype: "video/mp4",
            jpegThumbnail: thumb,
            caption: `*🎬 Name:* ${finalTitle}\n*📦 Size:* ${fileSize}\n\n${config.NAME}`
        });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
        
        if (targetJid !== from) {
            await reply('✅ *Video sent to the target group!*');
        }

    } catch (e) {
        console.error("Download Error:", e);
        reply('🚩 *Error during download!*');
    }
});
