"use strict";


/* ==================================================
   序章：死亡記憶碎片資料
   ================================================== */

const PROLOGUE_MEMORIES = [

    /* ==================================================
       星形髮飾

       第一視覺焦點。
       位於餐桌前方的地面。

       正式美術階段使用較明顯的暖金色光芒，
       引導玩家優先注意這件物品。

       一開始即可調查。
       ================================================== */

    {
        id: "star-hairpin",

        name: "星形髮飾",

        symbol: "★",

        image:
            "./assets/images/memories/memory-object-hairpin.webp",

        type: "fragment",

        unlockType: "start",

        position: {
            x: 80,
            y: 83
        },

        lines: [
            "這個……我記得。",
            "好像是某個很重要的人送給我的。",
            "但是……是誰？"
        ]
    },


    /* ==================================================
       染血羊毛

       位於餐桌左側的地面。

       羊毛本體使用透明圖片，
       地面暗紅痕跡由 CSS 額外繪製。

       一開始即可調查。
       ================================================== */

    {
        id: "bloody-wool",

        name: "染血羊毛",

        symbol: "☁",

        image:
            "./assets/images/memories/memory-object-wool.webp",

        type: "fragment",

        unlockType: "start",

        position: {
            x: 23,
            y: 75
        },

        lines: [
            "好柔軟……",
            "上面卻沾著血。",
            "為什麼碰到它的時候，我會覺得這麼難受？"
        ]
    },


    /* ==================================================
       染血的刀

       放置於餐桌上。

       一開始即可調查。
       ================================================== */

    {
        id: "knife",

        name: "餐刀",

        symbol: "†",

        image:
            "./assets/images/memories/memory-object-knife.webp",

        type: "fragment",

        unlockType: "start",

        position: {
            x: 51,
            y: 55
        },

        lines: [
            "……刀？",
            "刀刃上，好像還殘留著什麼。",
            "不行……我不想再看了。"
        ]
    },


    /* ==================================================
       破裂的引星鈴

       位於左側櫃子。

       完成髮飾、羊毛、刀三份記憶後，
       才會正式出現在場景中。
       ================================================== */

    {
        id: "bell",

        name: "破裂的引星鈴",

        symbol: "🔔",

        image:
            "./assets/images/memories/memory-object-bell.webp",

        type: "unlock",

        unlockType: "afterFirstThree",

        position: {
            x: 18,
            y: 41
        },

        lines: [
            "叮……",
            "這個聲音，很熟悉。",
            "這是……我的引星鈴。"
        ]
    },


    /* ==================================================
       沸騰的鍋

       位於右側料理區。

       一開始就存在於場景中，
       但處於記憶封鎖狀態。

       必須完成引星鈴的記憶後才能正式面對。

       正式版本會加入：

       【面對這段記憶】
       【還不是時候】

       在選擇「面對」之前，
       不會算入記憶進度。
       ================================================== */

    {
        id: "boiling-pot",

        name: "舊鍋",

        symbol: "♨",

        image:
            "./assets/images/memories/memory-object-pot.webp",

        type: "confrontation",

        unlockType: "afterBell",

        position: {
            x: 83,
            y: 42
        },

        lockedLines: [
            "……",
            "強烈的不適感突然湧了上來。",
            "現在的我，還無法想起這段記憶。"
        ],

        lines: [
            "好熱……",
            "這個聲音……",
            "我不想靠近它。",
            "……我想起來了。"
        ]
    }

];