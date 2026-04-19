const { cmd } = require('../command');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const mumaker = require("mumaker");
const axios = require('axios');

/* ---------------------- HELPER: BUILD STICKER ----------------------- */

async function makeSticker(url, packName, conn, mek, m) {
    try {

        let response = await axios.get(url, {
            responseType: 'arraybuffer', 
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "Referer": "https://textpro.me/",
                "Accept": "image/webp,image/png,image/jpeg,*/*"
            }
        });


        let buffer = Buffer.from(response.data);


        if (!buffer || buffer.length === 0) {
            return await conn.sendMessage(m.chat, { text: "❌ Image download failed (Empty buffer)." }, { quoted: mek });
        }


        let sticker = new Sticker(buffer, {
            pack: packName,
            author: "VISPER_MD",
            type: StickerTypes.FULL,
            categories: ['🤩', '🎉'],
            quality: 80, 
            background: 'transparent'
        });

        const stickerBuffer = await sticker.build();


        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: mek });

    } catch (e) {
        console.error("Sticker Gen Error:", e);
        await conn.sendMessage(m.chat, { text: "❌ Error: Could not generate sticker." }, { quoted: mek });
    }
}

/* ---------------------- STYLE ටික තමයි පකෝ---------------------- */
const styles = [
    // --- 🔥 HOT & FIRE ---
    { pattern: "stfire", url: "https://textpro.me/firework-sparkle-text-effect-930.html", react: "🔥", name: "Fire" },
    { pattern: "stlava", url: "https://textpro.me/create-lava-text-effects-online-914.html", react: "🌋", name: "Lava" },
    { pattern: "stmagma", url: "https://textpro.me/create-magma-hot-text-effect-online-1030.html", react: "🌡️", name: "Magma" },

    // --- ❄️ ICE & WATER ---
    { pattern: "stice", url: "https://textpro.me/ice-cold-text-effect-862.html", react: "❄️", name: "Ice" },
    { pattern: "stwater", url: "https://textpro.me/dropwater-text-effect-872.html", react: "💧", name: "Water" },
    { pattern: "stsea", url: "https://textpro.me/underwater-text-effect-generator-online-1022.html", react: "🌊", name: "Underwater" },

    // --- ✨ NEON & LIGHTS ---
    { pattern: "stneon", url: "https://textpro.me/neon-light-text-effect-online-882.html", react: "✨", name: "Neon" },
    { pattern: "stglow", url: "https://textpro.me/create-glowing-neon-light-text-effect-online-free-1061.html", react: "🌟", name: "Glow" },
    { pattern: "stgalaxy", url: "https://textpro.me/neon-text-effect-online-879.html", react: "🌌", name: "Galaxy" },
    { pattern: "stlight", url: "https://textpro.me/create-light-glow-sliced-text-effect-online-1068.html", react: "💡", name: "Light" },

    // --- 💻 TECH & GLITCH ---
    { pattern: "stglitch", url: "https://textpro.me/create-glitch-text-effect-style-tik-tok-983.html", react: "👾", name: "Glitch" },
    { pattern: "sttech", url: "https://textpro.me/create-artistic-typography-online-1086.html", react: "💻", name: "Tech" },
    { pattern: "sthack", url: "https://textpro.me/matrix-style-text-effect-online-884.html", react: "👨‍💻", name: "Matrix" },

    // --- 👹 HORROR ---
    { pattern: "sthorror", url: "https://textpro.me/horror-gift-text-effect-866.html", react: "🧟", name: "Horror" },
    { pattern: "stblood", url: "https://textpro.me/blood-text-on-the-frosted-glass-941.html", react: "🩸", name: "Blood" },
    { pattern: "stzombie", url: "https://textpro.me/zombie-3d-text-effect-876.html", react: "🧟‍♂️", name: "Zombie" },

    // --- 🆕 හෙනගහන STYLES ---
    { pattern: "stthunder", url: "https://textpro.me/online-thunder-text-effect-generator-1031.html", react: "⚡", name: "Thunder" },
    { pattern: "stcloud", url: "https://textpro.me/create-a-cloud-text-effect-on-the-sky-online-916.html", react: "☁️", name: "Cloud" },
    { pattern: "stblackpink", url: "https://textpro.me/create-blackpink-logo-style-online-1001.html", react: "💖", name: "BlackPink" },
    { pattern: "stsand", url: "https://textpro.me/write-in-sand-summer-beach-free-online-991.html", react: "🏖️", name: "Sand" },
    { pattern: "stjoker", url: "https://textpro.me/create-logo-joker-online-934.html", react: "🤡", name: "Joker" },
    { pattern: "stwicker", url: "https://textpro.me/create-wicker-text-effect-online-1069.html", react: "🧶", name: "Wicker" },
    { pattern: "stbokeh", url: "https://textpro.me/bokeh-text-effect-876.html", react: "🎇", name: "Bokeh" },
    { pattern: "stpaper", url: "https://textpro.me/create-art-paper-cut-text-effect-online-1022.html", react: "📄", name: "PaperArt" },
    { pattern: "sttoxic", url: "https://textpro.me/toxic-text-effect-online-901.html", react: "☣️", name: "Toxic" },
    { pattern: "strainbow", url: "https://textpro.me/create-rainbow-color-text-effect-online-1099.html", react: "🌈", name: "Rainbow" },
    { pattern: "stpencil", url: "https://textpro.me/create-pencil-sketch-text-effect-online-1064.html", react: "✏️", name: "Pencil" },
    { pattern: "stcircuit", url: "https://textpro.me/create-blue-circuit-style-text-effect-online-1043.html", react: "🔌", name: "Circuit" },
    { pattern: "stdiscovery", url: "https://textpro.me/create-space-discovery-text-effect-online-1082.html", react: "🚀", name: "Discovery" },
    { pattern: "stfiction", url: "https://textpro.me/create-science-fiction-text-effect-online-free-1038.html", react: "👽", name: "SciFi" },
    { pattern: "stmetalfire", url: "https://textpro.me/create-hot-metal-text-effect-online-1066.html", react: "🔥", name: "MetalFire" }
];

/* ----------------------COMMAND GENERATOR ------------------- */

styles.forEach((item) => {
    cmd({
        pattern: item.pattern,
        react: item.react,
        desc: `Generates ${item.name} sticker`,
        category: "sticker",
        filename: __filename
    }, async (conn, mek, m, { q, reply }) => {

        if (!q) return reply(`📝 Use: .${item.pattern} Name`);
        if (q.length > 30) return reply("❌ Text is too long. Max 30 chars.");

        try {
            reply(`🔄 Generating ${item.name} sticker...`);


            let imageUrl = await mumaker.textpro(item.url, q);


            if (typeof imageUrl === 'object' && imageUrl.image) {
                imageUrl = imageUrl.image;
            }

            console.log(`Generated URL for ${item.name}:`, imageUrl);

            if (imageUrl && typeof imageUrl === 'string') {
                await makeSticker(imageUrl, item.name, conn, mek, m);
            } else {
                reply("❌ Failed to generate image from TextPro.");
            }

        } catch (e) {
            console.error(e);
            reply("❌ Error occurred. Try again later.");
        }
    });
});

/* ========================================================
   ------- OMINISAVE API LOGO STICKER GENERATOR --------
   ======================================================== */

const oministyles = [
    { pattern: "stomneon", type: "neon", react: "✨", name: "Neon" },
    { pattern: "stomneon2", type: "neon2", react: "🌟", name: "Neon 2" },
    { pattern: "stomfire", type: "fire", react: "🔥", name: "Fire" },
    { pattern: "stomfire2", type: "fire2", react: "💥", name: "Fire 2" },
    { pattern: "stomglitch", type: "glitch", react: "👾", name: "Glitch" },
    { pattern: "stomhacker", type: "hacker", react: "👨‍💻", name: "Hacker" },
    { pattern: "stomfuturistic", type: "futuristic", react: "🚀", name: "Futuristic" },
    { pattern: "stomthunder", type: "thunder", react: "⚡", name: "Thunder" },
    { pattern: "stomdevil", type: "devil", react: "😈", name: "Devil" },
    { pattern: "stomice", type: "ice", react: "🧊", name: "Ice" },
    { pattern: "stomsnow", type: "snow", react: "❄️", name: "Snow" },
    { pattern: "stomlava", type: "lava", react: "🌋", name: "Lava" },
    { pattern: "stommetal", type: "metal", react: "⚙️", name: "Metal" },
    { pattern: "stomgold", type: "gold", react: "🪙", name: "Gold" },
    { pattern: "stomsilver", type: "silver", react: "🥄", name: "Silver" },
    { pattern: "stomglossy", type: "glossy", react: "🪞", name: "Glossy" },
    { pattern: "stomblackpink", type: "blackpink", react: "💖", name: "BlackPink" },
    { pattern: "stomtransformer", type: "transformer", react: "🤖", name: "Transformer" },
    { pattern: "stomhorror", type: "horror", react: "🧟", name: "Horror" },
    { pattern: "stomblood", type: "blood", react: "🩸", name: "Blood" },
    { pattern: "stomjoker", type: "joker", react: "🤡", name: "Joker" },
    { pattern: "stomgalaxy", type: "galaxy", react: "🌌", name: "Galaxy" },
    { pattern: "stomspace", type: "space", react: "🪐", name: "Space" },
    { pattern: "stomcloud", type: "cloud", react: "☁️", name: "Cloud" },
    { pattern: "stomsand", type: "sand", react: "🏖️", name: "Sand" },
    { pattern: "stomstone", type: "stone", react: "🪨", name: "Stone" },
    { pattern: "stommagma", type: "magma", react: "🌡️", name: "Magma" },
    { pattern: "stomgradient", type: "gradient", react: "🌈", name: "Gradient" },
    { pattern: "stomlight", type: "light", react: "💡", name: "Light" },
    { pattern: "stompaper", type: "paper", react: "📄", name: "Paper" },
    { pattern: "stomwatercolor", type: "watercolor", react: "🖌️", name: "Watercolor" },
    { pattern: "stomcandy", type: "candy", react: "🍬", name: "Candy" },
    { pattern: "stomxmas", type: "christmas", react: "🎄", name: "Christmas" },
    { pattern: "stomluxury", type: "luxury", react: "💎", name: "Luxury" },
    { pattern: "stomleaf", type: "leaf", react: "🍃", name: "Leaf" },
    { pattern: "stomsummer", type: "summer", react: "☀️", name: "Summer" },
    { pattern: "stomcircuit", type: "circuit", react: "🔌", name: "Circuit" },
    { pattern: "stomblock3d", type: "block3d", react: "🧱", name: "Block 3D" },
    { pattern: "stomcartoon", type: "cartoon", react: "🎨", name: "Cartoon" },
    { pattern: "stomchrome", type: "chrome", react: "💿", name: "Chrome" },
    { pattern: "stomfrozen", type: "frozen", react: "🥶", name: "Frozen" }
];


oministyles.forEach((item) => {
    cmd({
        pattern: item.pattern,
        react: item.react,
        desc: `Generates ${item.name} sticker`,
        category: "sticker",
        filename: __filename
    }, async (conn, mek, m, { q, reply }) => {

        if (!q) return reply(`📝 *Use:* .${item.pattern} Name\n*Example:* .${item.pattern} Visper-Md`);
        if (q.length > 30) return reply("❌ *Text is too long. Max 30 chars.*");

        try {
            reply(`🔄 *Generating ${item.name} sticker...*`);


            const imageUrl = `https://ominisave.zone.id/api/logo?name=${encodeURIComponent(q)}&type=${item.type}`;


            await makeSticker(imageUrl, `Logo-${item.type.toUpperCase()}`, conn, mek, m);

        } catch (e) {
            console.error(e);
            reply("❌ *Error occurred while generating logo sticker.*");
        }
    });
});