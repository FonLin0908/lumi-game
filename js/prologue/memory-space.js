"use strict";


/* ==================================================
   記憶空間狀態
   ================================================== */

const discoveredMemories =
    new Set();

let memoryInteractionLocked =
    false;

/* ==================================================
   已取得的序章線索
   ================================================== */

const collectedPrologueClues =
    new Set();


/*
 * 引星鈴出現以前，
 * 玩家必須取得的全部線索。
 */

const PRE_BELL_REQUIRED_CLUES = [

    // 星形髮飾
    "maoya-gift",
    "star-hairpin-clue",
    "hairpin-paw",

    // 染血羊毛
    "wool",
    "blood",

    // 染血的刀
    "knife-paw"

];

/* ==================================================
   引星鈴解鎖音效
   ================================================== */

const memoryBellRevealSound =
    new Audio(
        "./assets/audio/memory_star_bell.mp3"
    );

memoryBellRevealSound.volume = 0.45;


/* ==================================================
   星形髮飾調查設定
   ================================================== */

const HAIRPIN_INSPECT_IMAGES = {

    front:
        "./assets/images/memories/inspect/hairpin-inspect-front.webp",

    back:
        "./assets/images/memories/inspect/hairpin-inspect-back.webp"

};


const HAIRPIN_MEMORY_IMAGE =
    "./assets/images/memories/scenes/hairpin-memory.webp";

const WOOL_INSPECT_IMAGE =
    "./assets/images/memories/inspect/wool-inspect.webp";

const KNIFE_INSPECT_IMAGE =
    "./assets/images/memories/memory-object-knife.webp";    

const KNIFE_MEMORY_IMAGE =
    "./assets/images/memories/scenes/knife-memory.webp";

const BELL_INSPECT_IMAGE =
    "./assets/images/memories/memory-object-bell.webp";

const BELL_MEMORY_IMAGE =
    "./assets/images/memories/scenes/bell-memory.webp";    
    
let hairpinGiftClueFound = false;

let hairpinStarClueFound = false;

let hairpinPawClueFound = false;    

/* ==================================================
   初始化記憶空間
   ================================================== */

function initializeMemorySpace() {

    const objectContainer =
        document.querySelector(
            "#memory-objects"
        );


    if (!objectContainer) {

        console.error(
            "找不到 #memory-objects。"
        );

        return;

    }


    /*
     * 清除舊物件。
     */

    objectContainer.innerHTML = "";


    /*
     * 重置場景調查狀態。
     */

    discoveredMemories.clear();


    /*
     * 重置已取得線索。
     */

    collectedPrologueClues.clear();


    memoryInteractionLocked =
        false;


    /*
     * 根據 memories.js 的資料
     * 建立所有場景物件。
     */

    PROLOGUE_MEMORIES.forEach(
        memory => {

            const button =
                createMemoryObject(
                    memory
                );


            objectContainer.appendChild(
                button
            );

        }
    );


    updateMemoryProgress();

    updateMemoryUnlocks();

}


/* ==================================================
   取得序章線索
   ================================================== */

function collectPrologueClue(
    clueId
) {

    /*
     * 已經取得過，
     * 不重複加入。
     */

    if (
        collectedPrologueClues.has(
            clueId
        )
    ) {

        return false;

    }


    /*
     * 確認 Puzzle 中存在這個碎片。
     */

    const clue =
        getPuzzleFragment(
            clueId
        );


    if (!clue) {

        console.warn(
            `找不到序章線索：${clueId}`
        );

        return false;

    }


    collectedPrologueClues.add(
        clueId
    );


    console.log(
        `取得線索：${clue.name}`
    );


    /*
     * 注意：
     *
     * 這裡不再立即呼叫
     * updateMemoryUnlocks()。
     *
     * 解鎖檢查會在玩家退出
     * Inspector 後統一進行，
     * 避免解鎖動畫被 Inspector 遮住。
     */


    return true;

}

/* ==================================================
   是否已取得指定序章線索
   ================================================== */

function hasPrologueClue(
    clueId
) {

    return collectedPrologueClues.has(
        clueId
    );

}

/* ==================================================
   是否已取得引星鈴出現前的全部線索
   ================================================== */

function hasAllPreBellClues() {

    return PRE_BELL_REQUIRED_CLUES.every(
        clueId =>
            collectedPrologueClues.has(
                clueId
            )
    );

}

/* ==================================================
   判斷記憶是否解鎖
   ================================================== */

function isMemoryUnlocked(
    memory
) {

    switch (
        memory.unlockType
    ) {

        /* ==================================================
           遊戲開始即可調查
           ================================================== */

        case "start":

            return true;


        /* ==================================================
           引星鈴
           ==================================================

           舊版：
           只檢查髮飾、羊毛、刀是否被點過。

           新版：
           玩家必須真正取得前置 6 個線索：

           ・貓燁送的禮物
           ・星形髮飾
           ・髮飾上的貓爪
           ・羊毛
           ・血跡
           ・刀上的貓爪

           才能讓引星鈴出現。
           ================================================== */

        case "afterFirstThree":

            return hasAllPreBellClues();


        /* ==================================================
           舊鍋
           ================================================== */

        case "afterBell":

            return discoveredMemories.has(
                "bell"
            );


        default:

            return false;

    }

}


/* ==================================================
   建立記憶物件
   ================================================== */

function createMemoryObject(
    memory
) {

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "memory-object";


    /* ==================================================
       記憶 ID
       ================================================== */

    button.dataset.memoryId =
        memory.id;


    /* ==================================================
       初始解鎖狀態
       ================================================== */

    if (
        !isMemoryUnlocked(
            memory
        )
    ) {

        button.classList.add(
            "locked"
        );

    }


    /*
     * 引星鈴：
     * 解鎖以前完全隱藏。
     */

    if (
        memory.id === "bell"
        &&
        !isMemoryUnlocked(
            memory
        )
    ) {

        button.classList.add(
            "memory-hidden"
        );

    }


    /* ==================================================
       場景位置
       ================================================== */

    button.style.left =
        `${memory.position.x}%`;


    button.style.top =
        `${memory.position.y}%`;


    /* ==================================================
       正式物件圖片
       ================================================== */

    if (
        memory.image
    ) {

        /* ==================================================
           染血羊毛：
           羊毛 + CSS 暗紅痕跡
           ================================================== */

        if (
            memory.id ===
            "bloody-wool"
        ) {

            button.classList.add(
                "memory-wool-clue"
            );


            /*
             * 暗紅地面痕跡。
             */

            const stain =
                document.createElement(
                    "span"
                );


            stain.className =
                "memory-red-stain";


            /*
             * 羊毛圖片。
             */

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "memory-wool-image";


            image.src =
                memory.image;


            image.alt =
                memory.name;


            image.draggable =
                false;


            button.append(
                stain,
                image
            );

        }


        /* ==================================================
           一般記憶物件
           ================================================== */

        else {

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "memory-object-image";


            image.src =
                memory.image;


            image.alt =
                memory.name;


            image.draggable =
                false;


            /* ==================================================
            舊鍋特殊結構
            ================================================== */

            if (
                memory.id ===
                "boiling-pot"
            ) {

                const potVisual =
                    document.createElement(
                        "span"
                    );


                potVisual.className =
                    "memory-pot-visual";


                /*
                * 爐火。
                */

                const fire =
                    document.createElement(
                        "span"
                    );


                fire.className =
                    "memory-pot-fire";


                /*
                * 蒸氣。
                */

                const steam =
                    document.createElement(
                        "span"
                    );


                steam.className =
                    "memory-pot-steam";


                potVisual.append(
                    fire,
                    image,
                    steam
                );


                button.appendChild(
                    potVisual
                );

            }


            /* ==================================================
            其他一般物件
            ================================================== */

            else {

                button.appendChild(
                    image
                );

            }

        }

    }


    /* ==================================================
       如果沒有圖片，
       暫時退回 Prototype symbol
       ================================================== */

    else {

        const symbol =
            document.createElement(
                "span"
            );


        symbol.className =
            "memory-object-symbol";


        symbol.textContent =
            memory.symbol;


        button.appendChild(
            symbol
        );

    }


    /* ==================================================
       Hover 物件名稱
       ================================================== */

    const label =
        document.createElement(
            "span"
        );


    label.className =
        "memory-object-label";


    label.textContent =
        memory.name;


    button.appendChild(
        label
    );


    /* ==================================================
       點擊調查
       ================================================== */

    button.addEventListener(
        "click",
        () => {

            inspectMemory(
                memory,
                button
            );

        }
    );


    return button;

}


/* ==================================================
   調查記憶
   ================================================== */

async function inspectMemory(
    memory,
    element
) {

    if (memoryInteractionLocked) {
        return;
    }


    /* ==================================================
       尚未解鎖
       ================================================== */

    if (
        !isMemoryUnlocked(
            memory
        )
    ) {

        if (
            memory.lockedLines
            &&
            memory.lockedLines.length > 0
        ) {

            memoryInteractionLocked =
                true;


            await showMemoryDialogue({

                name: memory.name,

                lines:
                    memory.lockedLines

            });


            memoryInteractionLocked =
                false;

        }


        return;

    }


    /* ==================================================
       面對型記憶
       ================================================== */

    if (
        memory.type ===
        "confrontation"
    ) {

        await inspectConfrontationMemory(
            memory,
            element
        );


        return;

    }


    /* ==================================================
       星形髮飾
       ================================================== */

    if (
        memory.id ===
        "star-hairpin"
    ) {

        await inspectHairpinMemory(
            memory,
            element
        );


        return;

    }


    /* ==================================================
       染血羊毛
       ================================================== */

    if (
        memory.id ===
        "bloody-wool"
    ) {

        await inspectWoolMemory(
            memory,
            element
        );


        return;

    }


    /* ==================================================
       染血的刀
       ================================================== */

    if (
        memory.id ===
        "knife"
    ) {

        await inspectKnifeMemory(
            memory,
            element
        );


        return;

    }


    /* ==================================================
       引星鈴
       ================================================== */

    if (
        memory.id ===
        "bell"
    ) {

        await inspectBellMemory(
            memory,
            element
        );


        return;

    }


    /* ==================================================
       一般記憶
       ================================================== */

    memoryInteractionLocked =
        true;


    const firstDiscovery =
        !discoveredMemories.has(
            memory.id
        );


    await showMemoryDialogue(
        memory
    );


    /*
     * 對話完成後，
     * 才正式視為尋回。
     */

    if (firstDiscovery) {

        discoveredMemories.add(
            memory.id
        );


        element.classList.add(
            "discovered"
        );


        updateMemoryProgress();

        updateMemoryUnlocks();

    }


    memoryInteractionLocked =
        false;

}

/* ==================================================
   調查星形髮飾
   ================================================== */

async function inspectHairpinMemory(
    memory,
    element
) {

    if (memoryInteractionLocked) {
        return;
    }


    memoryInteractionLocked =
        true;


    const firstDiscovery =
        !discoveredMemories.has(
            memory.id
        );


    /* ==================================================
       第一次調查
       ================================================== */

    if (firstDiscovery) {

        await showMemoryDialogue({

            name: "露米",

            lines: [
                "這是……",
                "麻麻送我的禮物？"
            ]

        });


        /*
         * 播放髮飾回憶。
         */

        await playHairpinMemory();


        /*
         * 回憶直接證明：
         *
         * 這個髮飾是貓燁送給露米的。
         */

        collectPrologueClue(
            "maoya-gift"
        );

    }


    /* ==================================================
       開啟髮飾放大檢視
       ================================================== */

    await openHairpinInspector();


    /*
     * Inspector 關閉後，
     * 才重新顯示探索畫面。
     */

    const memorySpace =
        document.querySelector(
            "#memory-space"
        );


    memorySpace?.classList.remove(
        "memory-cutscene-active"
    );


    /* ==================================================
       確認髮飾是否真的調查完整
       ================================================== */

    const hairpinComplete =
        (
            hasPrologueClue(
                "maoya-gift"
            )
            &&
            hasPrologueClue(
                "star-hairpin-clue"
            )
            &&
            hasPrologueClue(
                "hairpin-paw"
            )
        );


    /*
     * 三個線索全部取得後，
     * 才正式把髮飾視為完成調查。
     */

    if (
        firstDiscovery
        &&
        hairpinComplete
    ) {

        discoveredMemories.add(
            memory.id
        );


        element.classList.add(
            "discovered"
        );


        updateMemoryProgress();

        updateMemoryUnlocks();

    }


    memoryInteractionLocked =
        false;

}


/* ==================================================
   調查染血羊毛
   ================================================== */

async function inspectWoolMemory(
    memory,
    element
) {

    if (memoryInteractionLocked) {
        return;
    }


    memoryInteractionLocked =
        true;


    const firstDiscovery =
        !discoveredMemories.has(
            memory.id
        );


    /* ==================================================
       開啟羊毛放大檢視
       ================================================== */

    await openWoolInspector(
        firstDiscovery
    );


    /* ==================================================
       確認兩個必要線索都有取得
       ================================================== */

    const woolComplete =
        (
            hasPrologueClue(
                "wool"
            )
            &&
            hasPrologueClue(
                "blood"
            )
        );


    /*
     * 羊毛與血跡都取得後，
     * 才正式完成這件物品的調查。
     */

    if (
        !discoveredMemories.has(
            memory.id
        )
        &&
        woolComplete
    ) {

        discoveredMemories.add(
            memory.id
        );


        element.classList.add(
            "discovered"
        );


        updateMemoryProgress();

        updateMemoryUnlocks();

    }


    memoryInteractionLocked =
        false;

}

/* ==================================================
   開啟染血羊毛放大檢視
   ================================================== */

function openWoolInspector(
    firstDiscovery
) {

    return new Promise(
        resolve => {

            const inspector =
                document.querySelector(
                    "#memory-inspector"
                );

            const title =
                document.querySelector(
                    "#memory-inspector-title"
                );

            const image =
                document.querySelector(
                    "#memory-inspector-image"
                );

            const hotspots =
                document.querySelector(
                    "#memory-inspector-hotspots"
                );

            const hint =
                document.querySelector(
                    "#memory-inspector-hint"
                );

            const flipButton =
                document.querySelector(
                    "#memory-inspector-flip"
                );

            const closeButton =
                document.querySelector(
                    "#memory-inspector-close"
                );


            if (
                !inspector
                ||
                !title
                ||
                !image
                ||
                !hotspots
                ||
                !hint
                ||
                !flipButton
                ||
                !closeButton
            ) {

                console.error(
                    "羊毛 Inspector UI 不完整。"
                );

                resolve();

                return;

            }


            /* ==================================================
               初始化 Inspector
               ================================================== */

            title.textContent =
                "染血羊毛";


            image.src =
                WOOL_INSPECT_IMAGE;


            image.alt =
                "散落在木地板上的染血羊毛";


            /*
             * 羊毛不需要熱點。
             */

            hotspots.innerHTML =
                "";


            /*
             * 羊毛也不需要翻面。
             */

            flipButton.classList.add(
                "hidden"
            );


            hint.textContent =
                "仔細看看地上的羊毛……";


            /* ==================================================
               關閉 Inspector
               ================================================== */

            function closeInspector() {

                inspector.classList.add(
                    "hidden"
                );


                closeButton.removeEventListener(
                    "click",
                    closeInspector
                );


                /*
                 * 避免影響下一個需要翻面的 Inspector。
                 */

                flipButton.classList.remove(
                    "hidden"
                );

                updateMemoryUnlocks();
                resolve();

            }


            closeButton.addEventListener(
                "click",
                closeInspector
            );


            inspector.classList.remove(
                "hidden"
            );


            /* ==================================================
               第一次調查對話
               ================================================== */

            if (firstDiscovery) {

                window.setTimeout(
                    async () => {

                        await showMemoryDialogue({

                            name: "露米",

                            lines: [
                                "這是……羊毛？",
                                "還有血跡……？"
                            ]

                        });


                        /*
                         * 這個畫面已經能直接確認
                         * 羊毛與血跡兩項資訊。
                         */

                        collectPrologueClue(
                            "wool"
                        );


                        collectPrologueClue(
                            "blood"
                        );


                        hint.textContent =
                            "羊毛上沾著明顯的血跡。";

                    },
                    250
                );

            }
            else {

                hint.textContent =
                    "這是之前調查過的染血羊毛。";

            }

        }
    );

}


/* ==================================================
   調查刀子
   ================================================== */

async function inspectKnifeMemory(
    memory,
    element
) {

    if (memoryInteractionLocked) {
        return;
    }


    memoryInteractionLocked =
        true;


    const firstDiscovery =
        !discoveredMemories.has(
            memory.id
        );


    /* ==================================================
       開啟刀子 Inspector
       ================================================== */

    await openKnifeInspector(
        firstDiscovery
    );


    /* ==================================================
       是否已取得刀子真正需要的線索
       ================================================== */

    const knifeComplete =
        hasPrologueClue(
            "knife-paw"
        );


    /*
     * 取得刀上貓爪後，
     * 才正式視為刀子調查完成。
     */

    if (
        !discoveredMemories.has(
            memory.id
        )
        &&
        knifeComplete
    ) {

        discoveredMemories.add(
            memory.id
        );


        element.classList.add(
            "discovered"
        );


        updateMemoryProgress();

        updateMemoryUnlocks();

    }


    memoryInteractionLocked =
        false;

}


/* ==================================================
   開啟刀子放大檢視
   ================================================== */

function openKnifeInspector(
    firstDiscovery
) {

    return new Promise(
        async resolve => {

            const inspector =
                document.querySelector(
                    "#memory-inspector"
                );

            const title =
                document.querySelector(
                    "#memory-inspector-title"
                );

            const image =
                document.querySelector(
                    "#memory-inspector-image"
                );

            const hotspots =
                document.querySelector(
                    "#memory-inspector-hotspots"
                );

            const hint =
                document.querySelector(
                    "#memory-inspector-hint"
                );

            const flipButton =
                document.querySelector(
                    "#memory-inspector-flip"
                );

            const closeButton =
                document.querySelector(
                    "#memory-inspector-close"
                );


            if (
                !inspector
                ||
                !title
                ||
                !image
                ||
                !hotspots
                ||
                !hint
                ||
                !flipButton
                ||
                !closeButton
            ) {

                console.error(
                    "刀子 Inspector UI 不完整。"
                );

                resolve();

                return;

            }


            /* ==================================================
               初始化
               ================================================== */

            title.textContent =
                "染血的刀";


            image.src =
                KNIFE_INSPECT_IMAGE;


            image.alt =
                "帶有貓爪圖樣的刀";


            hotspots.innerHTML =
                "";


            /*
             * 刀子不需要翻面。
             */

            flipButton.classList.add(
                "hidden"
            );


            /*
             * 一開始先不允許關閉。
             *
             * 第一次調查必須先看完短回憶。
             */

            if (firstDiscovery) {

                closeButton.classList.add(
                    "hidden"
                );

            }


            hint.textContent =
                firstDiscovery
                    ? "這把刀……讓人感到很不舒服。"
                    : "再仔細看看這把刀……";


            inspector.classList.remove(
                "hidden"
            );


            /* ==================================================
               建立貓爪熱點
               ================================================== */

            function createKnifePawHotspot() {

                hotspots.innerHTML =
                    "";


                const hotspot =
                    document.createElement(
                        "button"
                    );


                hotspot.type =
                    "button";


                hotspot.className =
                    "memory-inspector-hotspot";


                /*
                 * 這是暫定值。
                 *
                 * 你的刀圖是斜放的，
                 * 貓爪大約位於刀柄與護手交界。
                 *
                 * 實際跑畫面後再微調。
                 */

                hotspot.style.left =
                    "62%";

                hotspot.style.top =
                    "39%";


                hotspot.setAttribute(
                    "aria-label",
                    "調查刀上的貓爪圖樣"
                );


                if (
                    hasPrologueClue(
                        "knife-paw"
                    )
                ) {

                    hotspot.classList.add(
                        "discovered"
                    );

                }


                hotspot.addEventListener(
                    "click",
                    async () => {

                        if (
                            hasPrologueClue(
                                "knife-paw"
                            )
                        ) {

                            return;

                        }


                        await showMemoryDialogue({

                            name: "露米",

                            lines: [
                                "這個圖樣……",
                                "好熟悉……",
                                "跟那個髮飾上的一樣？"
                            ]

                        });


                        collectPrologueClue(
                            "knife-paw"
                        );


                        hotspot.classList.add(
                            "discovered"
                        );


                        hint.textContent =
                            "刀柄上刻著熟悉的貓爪圖樣。";

                    }
                );


                hotspots.appendChild(
                    hotspot
                );

            }


            /* ==================================================
            關閉 Inspector
            ================================================== */

            function closeInspector() {

                inspector.classList.add(
                    "hidden"
                );


                closeButton.removeEventListener(
                    "click",
                    closeInspector
                );


                flipButton.classList.remove(
                    "hidden"
                );


                closeButton.classList.remove(
                    "hidden"
                );


                /*
                * 玩家離開 Inspector 後，
                * 才正式檢查場景解鎖條件。
                *
                * 如果此時 6 個前置線索已集齊，
                * 引星鈴會在玩家看得到的房間畫面中出現。
                */

                updateMemoryUnlocks();


                resolve();

            }


            closeButton.addEventListener(
                "click",
                closeInspector
            );


            /* ==================================================
               第二次以後直接開放貓爪調查
               ================================================== */

            if (!firstDiscovery) {

                createKnifePawHotspot();

                return;

            }


            /* ==================================================
               第一次調查
               ================================================== */

            await prologueWait(
                350
            );


            await showMemoryDialogue({

                name: "露米",

                lines: [
                    "這把刀……",
                    "為什麼……",
                    "有種很不舒服的感覺……？"
                ]

            });


            /* ==================================================
               暈眩
               ================================================== */

            await playKnifeDizziness();


            /* ==================================================
               短暫死亡回憶
               ================================================== */

            inspector.classList.add(
                "hidden"
            );


            await playKnifeMemory();


            /* ==================================================
            回到刀子 Inspector
            ================================================== */

            inspector.classList.remove(
                "hidden"
            );


            const memorySpace =
                document.querySelector(
                    "#memory-space"
                );


            memorySpace?.classList.remove(
                "memory-cutscene-active"
            );


            await prologueWait(
                450
            );


            await showMemoryDialogue({

                name: "露米",

                lines: [
                    "……剛剛那是什麼？",
                    "有人……拿著這把刀……",
                    "我倒在地上……？"
                ]

            });


            /*
             * 到這裡才開放正式調查刀上的貓爪。
             */

            createKnifePawHotspot();


            hint.textContent =
                "這把刀上，似乎還有值得注意的地方……";


            closeButton.classList.remove(
                "hidden"
            );

        }
    );

}


/* ==================================================
   刀子記憶：暈眩效果
   ================================================== */

async function playKnifeDizziness() {

    const memorySpace =
        document.querySelector(
            "#memory-space"
        );


    if (!memorySpace) {

        console.error(
            "找不到 #memory-space。"
        );

        return;

    }


    /* ==================================================
       第一階段：輕微暈眩
       ================================================== */

    memorySpace.classList.add(
        "knife-memory-dizziness"
    );


    await prologueWait(
        900
    );


    /* ==================================================
       第二階段：暈眩加劇
       ================================================== */

    memorySpace.classList.add(
        "knife-memory-dizziness-strong"
    );


    await prologueWait(
        650
    );


    /* ==================================================
       清除效果
       ================================================== */

    memorySpace.classList.remove(
        "knife-memory-dizziness",
        "knife-memory-dizziness-strong"
    );


    await prologueWait(
        150
    );

}


/* ==================================================
   播放刀子短暫死亡回憶
   ================================================== */

async function playKnifeMemory() {

    const memorySpace =
        document.querySelector(
            "#memory-space"
        );


    if (!memorySpace) {

        console.error(
            "找不到 #memory-space。"
        );

        return;

    }


    /* ==================================================
       1. 隱藏探索 UI
       ================================================== */

    memorySpace.classList.add(
        "memory-cutscene-active"
    );


    await prologueWait(
        250
    );


    /* ==================================================
       2. 泛白
       ================================================== */

    await showMemoryCutsceneTransition();


    /* ==================================================
       3. 切換刀子回憶
       ================================================== */

    memorySpace.style.backgroundImage =
        `url("${KNIFE_MEMORY_IMAGE}")`;


    await prologueWait(
        150
    );


    /* ==================================================
       4. 泛白退去
       ================================================== */

    await hideMemoryCutsceneTransition();


    /*
     * 讓玩家先看清楚畫面。
     *
     * 此時不要急著放對話，
     * 因為畫面本身就是重要資訊。
     */

    await prologueWait(
        1600
    );


    /* ==================================================
       5. 露米的碎片式感受
       ================================================== */

    await showMemoryDialogue({

        mode: "cinematic",

        character: "lumi",

        type: "thought",

        lines: [
            "……",
            "好痛……",
            "是誰……?"
        ]

    });


    await prologueWait(
        650
    );


    /*
     * 再讓玩家注意持刀者，
     * 但現在不揭露其身分。
     */

    await prologueWait(
        1100
    );


    /* ==================================================
       6. 回憶中斷
       ================================================== */

    await showMemoryCutsceneTransition();


    /* ==================================================
       7. 恢復原本房間
       ================================================== */

    memorySpace.style.backgroundImage =
        "";


    await prologueWait(
        150
    );


    await hideMemoryCutsceneTransition();


    /*
     * 不解除 memory-cutscene-active。
     *
     * 因為下一步會直接回到
     * 刀子 Inspector。
     */

    await prologueWait(
        250
    );

}


/* ==================================================
   調查引星鈴
   ================================================== */

async function inspectBellMemory(
    memory,
    element
) {

    if (memoryInteractionLocked) {
        return;
    }


    memoryInteractionLocked =
        true;


    const firstDiscovery =
        !discoveredMemories.has(
            memory.id
        );


    /* ==================================================
       點擊鈴鐺時再次播放鈴聲
       ================================================== */

    memoryBellRevealSound.pause();

    memoryBellRevealSound.currentTime =
        0;


    await memoryBellRevealSound
        .play()
        .catch(
            error => {

                console.warn(
                    "引星鈴音效播放失敗：",
                    error
                );

            }
        );


    await prologueWait(
        350
    );


    /* ==================================================
       開啟鈴鐺 Inspector
       ================================================== */

    await openBellInspector(
        firstDiscovery
    );


    /* ==================================================
       確認鈴鐺線索
       ================================================== */

    const bellComplete =
        (
            hasPrologueClue(
                "light-picker"
            )
            &&
            hasPrologueClue(
                "memory-stars"
            )
        );


    /*
     * 兩個鈴鐺線索都取得後，
     * 才正式視為完成。
     */

    if (
        !discoveredMemories.has(
            memory.id
        )
        &&
        bellComplete
    ) {

        discoveredMemories.add(
            memory.id
        );


        element.classList.add(
            "discovered"
        );


        updateMemoryProgress();

    }


    /* ==================================================
       尚未完成
       ================================================== */

    if (!bellComplete) {

        memoryInteractionLocked =
            false;

        return;

    }


    /* ==================================================
       Inspector 已經關閉。
       此時才正式進入 Puzzle。
       ================================================== */

    await prologueWait(
        450
    );


    memoryBellRevealSound.pause();

    memoryBellRevealSound.currentTime =
        0;


    await memoryBellRevealSound
        .play()
        .catch(
            error => {

                console.warn(
                    "引星鈴音效播放失敗：",
                    error
                );

            }
        );


    await prologueWait(
        700
    );


    await fadeOutAudio(
        memorySpaceExplorationBgm,
        1200
    );

    startMemoryPuzzle();

}


/* ==================================================
   開啟引星鈴放大檢視
   ================================================== */

function openBellInspector(
    firstDiscovery
) {

    return new Promise(
        async resolve => {

            const inspector =
                document.querySelector(
                    "#memory-inspector"
                );

            const title =
                document.querySelector(
                    "#memory-inspector-title"
                );

            const image =
                document.querySelector(
                    "#memory-inspector-image"
                );

            const hotspots =
                document.querySelector(
                    "#memory-inspector-hotspots"
                );

            const hint =
                document.querySelector(
                    "#memory-inspector-hint"
                );

            const flipButton =
                document.querySelector(
                    "#memory-inspector-flip"
                );

            const closeButton =
                document.querySelector(
                    "#memory-inspector-close"
                );


            if (
                !inspector
                ||
                !title
                ||
                !image
                ||
                !hotspots
                ||
                !hint
                ||
                !flipButton
                ||
                !closeButton
            ) {

                console.error(
                    "引星鈴 Inspector UI 不完整。"
                );

                resolve();

                return;

            }


            /* ==================================================
               初始化
               ================================================== */

            title.textContent =
                "破裂的引星鈴";


            image.src =
                BELL_INSPECT_IMAGE;


            image.alt =
                "破裂的引星鈴";


            hotspots.innerHTML =
                "";


            /*
             * 鈴鐺不需要翻面。
             */

            flipButton.classList.add(
                "hidden"
            );


            hint.textContent =
                firstDiscovery
                    ? "這個鈴聲……好熟悉。"
                    : "這是我的引星鈴……";


            /*
             * 第一次必須看完回憶，
             * 暫時不能退出。
             */

            if (firstDiscovery) {

                closeButton.classList.add(
                    "hidden"
                );

            }


            inspector.classList.remove(
                "hidden"
            );


            /* ==================================================
               關閉 Inspector
               ================================================== */

            function closeInspector() {

                inspector.classList.add(
                    "hidden"
                );


                closeButton.removeEventListener(
                    "click",
                    closeInspector
                );


                flipButton.classList.remove(
                    "hidden"
                );


                closeButton.classList.remove(
                    "hidden"
                );


                resolve();

            }


            closeButton.addEventListener(
                "click",
                closeInspector
            );


            /* ==================================================
               已經看過回憶
               ================================================== */

            if (!firstDiscovery) {

                closeButton.classList.remove(
                    "hidden"
                );

                return;

            }


            /* ==================================================
               第一次調查
               ================================================== */

            await prologueWait(
                400
            );


            await showMemoryDialogue({

                name: "露米",

                lines: [
                    "這個聲音……",
                    "好熟悉……",
                    "這是……我的鈴鐺？"
                ]

            });


            /* ==================================================
               進入回憶
               ================================================== */

            inspector.classList.add(
                "hidden"
            );


            await playBellMemory();


            /* ==================================================
               回到 Inspector
               ================================================== */

            inspector.classList.remove(
                "hidden"
            );


            const memorySpace =
                document.querySelector(
                    "#memory-space"
                );


            memorySpace?.classList.remove(
                "memory-cutscene-active"
            );


            await prologueWait(
                400
            );


            await showMemoryDialogue({

                name: "露米",

                lines: [
                    "那些人……",
                    "好像是在叫我……",
                    "『拾光者』……？",
                    "還有那片星空……",
                    "我好像曾經看過。"
                ]

            });


            /* ==================================================
               取得鈴鐺線索
               ================================================== */

            collectPrologueClue(
                "light-picker"
            );


            collectPrologueClue(
                "memory-stars"
            );


            hint.textContent =
                "鈴聲喚醒了一段關於拾光者與星空的記憶。";


            /*
             * 線索拿完才允許退出。
             */

            closeButton.classList.remove(
                "hidden"
            );

        }
    );

}


/* ==================================================
   播放引星鈴回憶
   ================================================== */

async function playBellMemory() {

    const memorySpace =
        document.querySelector(
            "#memory-space"
        );


    if (!memorySpace) {

        console.error(
            "找不到 #memory-space。"
        );

        return;

    }


    /* ==================================================
       1. 隱藏探索 UI
       ================================================== */

    memorySpace.classList.add(
        "memory-cutscene-active"
    );


    await prologueWait(
        350
    );


    /* ==================================================
       2. 白光轉場
       ================================================== */

    await showMemoryCutsceneTransition();


    /* ==================================================
       3. 切換鈴鐺回憶
       ================================================== */

    memorySpace.style.backgroundImage =
        `url("${BELL_MEMORY_IMAGE}")`;


    /*
     * CG 應該完整鋪滿畫面。
     */

    memorySpace.style.backgroundPosition =
        "center";

    memorySpace.style.backgroundSize =
        "cover";

    memorySpace.style.backgroundRepeat =
        "no-repeat";


    await prologueWait(
        150
    );


    /* ==================================================
       4. 白光退去
       ================================================== */

    await hideMemoryCutsceneTransition();


    /*
     * 先讓玩家看清楚：
     *
     * 星空
     * 特別的星星
     * 蜿蜒道路
     * 披風人影
     */

    await prologueWait(
        1400
    );


    /* ==================================================
       5. 回憶中的聲音
       ================================================== */

    await showMemoryDialogue({

        mode: "cinematic",

        lines: [
            "拾光者大人……"
        ]

    });


    await prologueWait(
        700
    );


    await showMemoryDialogue({

        mode: "cinematic",

        lines: [
            "請為我們……",
            "指引前往星光的道路。"
        ]

    });


    /*
     * 再讓畫面停留一下。
     */

    await prologueWait(
        1300
    );


    /* ==================================================
       6. 回憶開始模糊
       ================================================== */

    await showMemoryCutsceneTransition();


    /* ==================================================
       7. 恢復房間背景
       ================================================== */

    memorySpace.style.backgroundImage =
        "";

    memorySpace.style.backgroundPosition =
        "";

    memorySpace.style.backgroundSize =
        "";

    memorySpace.style.backgroundRepeat =
        "";


    await prologueWait(
        150
    );


    await hideMemoryCutsceneTransition();


    /*
     * 保持 cutscene-active，
     * 因為接下來直接回 Inspector。
     */

    await prologueWait(
        250
    );

}


/* ==================================================
   小型回憶轉場：淡入
   ================================================== */

async function showMemoryCutsceneTransition() {

    const transition =
        document.querySelector(
            "#memory-cutscene-transition"
        );


    if (!transition) {
        return;
    }


    transition.classList.add(
        "visible"
    );


    await prologueWait(
        700
    );

}


/* ==================================================
   小型回憶轉場：淡出
   ================================================== */

async function hideMemoryCutsceneTransition() {

    const transition =
        document.querySelector(
            "#memory-cutscene-transition"
        );


    if (!transition) {
        return;
    }


    transition.classList.remove(
        "visible"
    );


    await prologueWait(
        700
    );

}


/* ==================================================
   播放髮飾回憶
   ================================================== */

async function playHairpinMemory() {

    const memorySpace =
        document.querySelector(
            "#memory-space"
        );


    if (!memorySpace) {

        console.error(
            "找不到 #memory-space。"
        );

        return;

    }


    /* ==================================================
       1. 隱藏探索 UI
       ================================================== */

    memorySpace.classList.add(
        "memory-cutscene-active"
    );


    await prologueWait(
        450
    );


    /* ==================================================
       2. 白光／泛白轉場
       ================================================== */

    await showMemoryCutsceneTransition();


    /* ==================================================
       3. 切換回憶背景
       ================================================== */

    memorySpace.style.backgroundImage =
        `url("${HAIRPIN_MEMORY_IMAGE}")`;


    await prologueWait(
        150
    );


    /* ==================================================
       4. 白光退去
       ================================================== */

    await hideMemoryCutsceneTransition();


    /*
     * 讓玩家先看到回憶畫面。
     */

    await prologueWait(
        800
    );


    /* ==================================================
       5. 回憶對話
       ================================================== */

    await showMemoryDialogue({

        mode: "cinematic",

        character: "maoya",

        lines: [
            "這個送給你。",
            "來，我幫你戴上。"
        ]

    });


    await prologueWait(
        250
    );


    await showMemoryDialogue({

        mode: "cinematic",

        character: "lumi",

        lines: [
            "真的可以給我嗎？",
            "嘿嘿……我會好好珍惜的。"
        ]

    });


    await prologueWait(
        800
    );


    /* ==================================================
       6. 再次進入白光轉場
       ================================================== */

    await showMemoryCutsceneTransition();


    /* ==================================================
       7. 恢復房間背景
       ================================================== */

    memorySpace.style.backgroundImage =
        "";


    await prologueWait(
        150
    );


    /* ==================================================
       8. 白光退去
       ================================================== */

    await hideMemoryCutsceneTransition();


    /*
     * 仍然保留 memory-cutscene-active，
     * 因為下一步會直接進 Inspector。
     */

    await prologueWait(
        250
    );

}

/* ==================================================
   開啟星形髮飾放大檢視
   ================================================== */

function openHairpinInspector() {

    return new Promise(
        resolve => {

            const inspector =
                document.querySelector(
                    "#memory-inspector"
                );

            const title =
                document.querySelector(
                    "#memory-inspector-title"
                );

            const image =
                document.querySelector(
                    "#memory-inspector-image"
                );

            const hotspots =
                document.querySelector(
                    "#memory-inspector-hotspots"
                );

            const hint =
                document.querySelector(
                    "#memory-inspector-hint"
                );

            const flipButton =
                document.querySelector(
                    "#memory-inspector-flip"
                );

            const closeButton =
                document.querySelector(
                    "#memory-inspector-close"
                );


            if (
                !inspector
                ||
                !title
                ||
                !image
                ||
                !hotspots
                ||
                !hint
                ||
                !flipButton
                ||
                !closeButton
            ) {

                console.error(
                    "髮飾 Inspector UI 不完整。"
                );

                resolve();

                return;

            }


            let side =
                "front";


            /* ==================================================
               顯示目前正反面
               ================================================== */

            function renderSide() {

                hotspots.innerHTML =
                    "";


                /* ==================================================
                   正面
                   ================================================== */

                if (
                    side ===
                    "front"
                ) {

                    image.src =
                        HAIRPIN_INSPECT_IMAGES.front;


                    image.alt =
                        "星形髮飾正面";


                    flipButton.textContent =
                        "翻到背面";


                    hint.textContent =
                        "仔細看看髮飾的正面";


                    createHairpinStarHotspot();


                    return;

                }


                /* ==================================================
                   背面
                   ================================================== */

                image.src =
                    HAIRPIN_INSPECT_IMAGES.back;


                image.alt =
                    "星形髮飾背面";


                flipButton.textContent =
                    "翻到正面";


                hint.textContent =
                    "背面似乎刻著什麼……";


                createHairpinPawHotspot();

            }


            /* ==================================================
               正面星星
               ================================================== */

            function createHairpinStarHotspot() {

                const hotspot =
                    document.createElement(
                        "button"
                    );


                hotspot.type =
                    "button";


                hotspot.className =
                    "memory-inspector-hotspot";


                /*
                 * 暫定座標。
                 * 之後看畫面再調。
                 */

                hotspot.style.left =
                    "41%";

                hotspot.style.top =
                    "34%";


                hotspot.setAttribute(
                    "aria-label",
                    "調查中央星星"
                );


                /*
                 * 已經調查過。
                 */

                if (
                    hasPrologueClue(
                        "star-hairpin-clue"
                    )
                ) {

                    hotspot.classList.add(
                        "discovered"
                    );

                }


                hotspot.addEventListener(
                    "click",
                    async () => {

                        /*
                         * 已經取得就不重複播放。
                         */

                        if (
                            hasPrologueClue(
                                "star-hairpin-clue"
                            )
                        ) {

                            return;

                        }


                        await showMemoryDialogue({

                            name: "露米",

                            lines: [
                                "這是星星……",
                                "好熟悉的感覺。"
                            ]

                        });


                        collectPrologueClue(
                            "star-hairpin-clue"
                        );


                        hotspot.classList.add(
                            "discovered"
                        );

                    }
                );


                hotspots.appendChild(
                    hotspot
                );

            }


            /* ==================================================
               背面貓爪
               ================================================== */

            function createHairpinPawHotspot() {

                const hotspot =
                    document.createElement(
                        "button"
                    );


                hotspot.type =
                    "button";


                hotspot.className =
                    "memory-inspector-hotspot";


                /*
                 * 暫定座標。
                 */

                hotspot.style.left =
                    "59%";

                hotspot.style.top =
                    "42%";


                hotspot.setAttribute(
                    "aria-label",
                    "調查貓爪圖樣"
                );


                if (
                    hasPrologueClue(
                        "hairpin-paw"
                    )
                ) {

                    hotspot.classList.add(
                        "discovered"
                    );

                }


                hotspot.addEventListener(
                    "click",
                    async () => {

                        if (
                            hasPrologueClue(
                                "hairpin-paw"
                            )
                        ) {

                            return;

                        }


                        await showMemoryDialogue({

                            name: "露米",

                            lines: [
                                "這個圖樣……",
                                "是貓爪？"
                            ]

                        });


                        collectPrologueClue(
                            "hairpin-paw"
                        );


                        hotspot.classList.add(
                            "discovered"
                        );

                    }
                );


                hotspots.appendChild(
                    hotspot
                );

            }


            /* ==================================================
               翻面
               ================================================== */

            function handleFlip() {

                side =
                    side === "front"
                        ? "back"
                        : "front";


                image.style.opacity =
                    "0";


                image.style.transform =
                    "scaleX(0.15)";


                window.setTimeout(
                    () => {

                        renderSide();


                        image.style.opacity =
                            "1";


                        image.style.transform =
                            "scaleX(1)";

                    },
                    180
                );

            }


            /* ==================================================
               結束調查
               ================================================== */

            function closeInspector() {

                inspector.classList.add(
                    "hidden"
                );


                flipButton.removeEventListener(
                    "click",
                    handleFlip
                );


                closeButton.removeEventListener(
                    "click",
                    closeInspector
                );

                updateMemoryUnlocks();

                resolve();

            }


            /* ==================================================
               初始化
               ================================================== */

            title.textContent =
                "星形髮飾";


            renderSide();


            inspector.classList.remove(
                "hidden"
            );


            flipButton.addEventListener(
                "click",
                handleFlip
            );


            closeButton.addEventListener(
                "click",
                closeInspector
            );

        }
    );

}

/* ==================================================
   調查需要面對的記憶
   ================================================== */

async function inspectConfrontationMemory(
    memory,
    element
) {

    /*
     * Puzzle 還在進行時，
     * 不允許調查舊鍋。
     */

    if (memoryPuzzleActive) {
        return;
    }


    /*
     * 舊鍋尚未甦醒以前，
     * 不允許正式面對這段記憶。
     *
     * pot-awakened 會在
     * completeProloguePuzzle()
     * → triggerPotAwakening()
     * 之後加入。
     */

    if (
        !element.classList.contains(
            "pot-awakened"
        )
    ) {

        memoryInteractionLocked =
            true;


        await showMemoryDialogue({

            type: "thought",

            lines: [
                "……",
                "這個鍋子讓我有種很不舒服的感覺。",
                "現在……還不是靠近它的時候。"
            ]

        });


        memoryInteractionLocked =
            false;


        return;

    }


    memoryInteractionLocked =
        true;


    /* ==================================================
       面對舊鍋
       ================================================== */

    await showMemoryDialogue({

        type: "thought",

        lines: [
            "……",
            "胸口突然有種說不出的壓迫感。",
            "我知道……這裡面藏著最後的答案。",
            "可是……",
            "我真的要想起來嗎？"
        ]

    });


    /* ==================================================
       玩家決定是否面對
       ================================================== */

    const shouldFace =
        await showMemoryChoice();


    /* ==================================================
       還不是時候
       ================================================== */

    if (!shouldFace) {

        memoryInteractionLocked =
            false;


        return;

    }


    /* ==================================================
       面對這段記憶
       ================================================== */

    /*
     * 正式把舊鍋視為已調查。
     */

    if (
        !discoveredMemories.has(
            memory.id
        )
    ) {

        discoveredMemories.add(
            memory.id
        );


        element.classList.add(
            "discovered"
        );


        updateMemoryProgress();

    }


    /*
     * 停止鍋子的甦醒提示效果。
     *
     * CSS 如果需要保留火焰直到畫面切換，
     * 這行之後也可以再調整。
     */

    element.classList.remove(
        "pot-awakened"
    );


    /*
     * 稍微停頓後，
     * 進入最後完整回憶。
     */

    await prologueWait(
        500
    );


    /*
     * 新版死亡回憶入口。
     *
     * 目前 startCompleteDeathMemory()
     * 還是舊動畫內容，
     * 下一階段再重新設計。
     */

    await startCompleteDeathMemory();


    /*
     * 最終回憶開始後，
     * 不在這裡解除 memoryInteractionLocked。
     *
     * 後續由死亡回憶流程接管。
     */

}


/* ==================================================
   顯示記憶對話
   ================================================== */

function showMemoryDialogue(memory) {

    return new Promise(
        (resolve) => {

            const dialogue =
                document.querySelector(
                    "#memory-dialogue"
                );

            const name =
                document.querySelector(
                    "#memory-dialogue-name"
                );

            const text =
                document.querySelector(
                    "#memory-dialogue-text"
                );


            if (
                !dialogue
                ||
                !name
                ||
                !text
            ) {

                console.error(
                    "找不到記憶對話框 UI。"
                );

                resolve();

                return;
            }


            let lineIndex = 0;


            /*
             * 是否為內心獨白。
             */
            const isThought =
                memory.type === "thought";
            
            const isCinematic =
                memory.mode === "cinematic";

            const character =
                memory.character ?? null;    


            /* ==================================================
               顯示目前這一句
               ================================================== */

            function showCurrentLine() {

                text.textContent =
                    memory.lines[lineIndex];

            }


            /* ==================================================
               下一句
               ================================================== */

            function nextLine() {

                lineIndex++;


                if (
                    lineIndex <
                    memory.lines.length
                ) {

                    showCurrentLine();

                    return;
                }


                closeDialogue();

            }


            /* ==================================================
               關閉對話
               ================================================== */

            function closeDialogue() {

                dialogue.classList.add(
                    "hidden"
                );


                dialogue.removeEventListener(
                    "click",
                    handleDialogueClick
                );


                document.removeEventListener(
                    "keydown",
                    handleDialogueKeydown
                );


                resolve();

            }


            /* ==================================================
               點擊畫面
               ================================================== */

            function handleDialogueClick(
                event
            ) {

                event.preventDefault();

                nextLine();

            }


            /* ==================================================
               鍵盤操作
               ================================================== */

            function handleDialogueKeydown(
                event
            ) {

                if (
                    event.key === "Enter"
                    ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    nextLine();

                }

            }


            /* ==================================================
               初始化
               ================================================== */

            /*
            * 清除上一次動畫字幕的狀態。
            */

            dialogue.classList.remove(
                "cinematic",
                "character-lumi",
                "character-maoya"
            );


            /*
            * 電影字幕模式。
            */

            if (isCinematic) {

                dialogue.classList.add(
                    "cinematic"
                );


                if (character === "lumi") {

                    dialogue.classList.add(
                        "character-lumi"
                    );

                }


                if (character === "maoya") {

                    dialogue.classList.add(
                        "character-maoya"
                    );

                }


                /*
                * 動畫模式不顯示名字。
                */

                name.textContent = "";

            }
            else {

                name.textContent =
                    memory.name ?? "";

            }

            if (isThought) {

                /*
                 * 內心獨白不顯示角色名稱。
                 */

                name.textContent = "";

                dialogue.classList.add(
                    "thought"
                );

            }
            else {

                name.textContent =
                    memory.name ?? "";

                dialogue.classList.remove(
                    "thought"
                );

            }


            showCurrentLine();


            dialogue.classList.remove(
                "hidden"
            );


            dialogue.addEventListener(
                "click",
                handleDialogueClick
            );


            document.addEventListener(
                "keydown",
                handleDialogueKeydown
            );

        }
    );

}

/* ==================================================
   顯示記憶抉擇
   ================================================== */

function showMemoryChoice() {

    return new Promise(
        (resolve) => {

            const choice =
                document.querySelector(
                    "#memory-choice"
                );

            const faceButton =
                document.querySelector(
                    "#memory-choice-face"
                );

            const leaveButton =
                document.querySelector(
                    "#memory-choice-leave"
                );


            function cleanup() {

                choice.classList.add(
                    "hidden"
                );


                faceButton.removeEventListener(
                    "click",
                    handleFace
                );

                leaveButton.removeEventListener(
                    "click",
                    handleLeave
                );

            }


            function handleFace(event) {

                event.stopPropagation();

                cleanup();

                resolve(true);

            }


            function handleLeave(event) {

                event.stopPropagation();

                cleanup();

                resolve(false);

            }


            faceButton.addEventListener(
                "click",
                handleFace
            );

            leaveButton.addEventListener(
                "click",
                handleLeave
            );


            choice.classList.remove(
                "hidden"
            );

        }
    );

}


/* ==================================================
   記憶物件解鎖演出
   ================================================== */

function revealMemoryObject(
    element
) {

    if (!element) {
        return;
    }


    /*
     * 已經顯示過就不重複播放解鎖演出。
     */

    if (
        !element.classList.contains(
            "memory-hidden"
        )
    ) {
        return;
    }


    /*
     * 解除隱藏並開始解鎖動畫。
     */

    element.classList.remove(
        "memory-hidden"
    );

    element.classList.add(
        "memory-revealing"
    );


    /*
     * 引星鈴出現時播放專屬音效。
     */

    if (
        element.dataset.memoryId ===
        "bell"
    ) {

        memoryBellRevealSound.pause();

        memoryBellRevealSound.currentTime =
            0;

        memoryBellRevealSound
            .play()
            .catch(error => {

                console.warn(
                    "引星鈴音效播放失敗：",
                    error
                );

            });

    }


    /*
     * 解鎖動畫結束後恢復一般狀態。
     */

    element.addEventListener(
        "animationend",
        () => {

            element.classList.remove(
                "memory-revealing"
            );

        },
        {
            once: true
        }
    );

}


/* ==================================================
   更新記憶物件解鎖狀態
   ================================================== */

function updateMemoryUnlocks() {

    const memoryElements =
        document.querySelectorAll(
            ".memory-object"
        );


    memoryElements.forEach(
        (element) => {

            const memoryId =
                element.dataset.memoryId;

            const memory =
                PROLOGUE_MEMORIES.find(
                    (item) =>
                        item.id === memoryId
                );


            if (!memory) {
                return;
            }


            const unlocked =
                isMemoryUnlocked(memory);


            /*
             * 一般鎖定狀態。
             */

            element.classList.toggle(
                "locked",
                !unlocked
            );


            /*
            * 引星鈴：
            * 解鎖前完全隱藏。
            * 第一次解鎖時播放出現動畫。
            */

            if (
                memory.id === "bell"
            ) {

                if (unlocked) {

                    revealMemoryObject(
                        element
                    );

                }
                else {

                    element.classList.add(
                        "memory-hidden"
                    );

                }

            }

        }
    );

}


/* ==================================================
   更新記憶進度
   ================================================== */

function updateMemoryProgress() {

    const progress =
        document.querySelector(
            "#memory-progress"
        );


    progress.textContent =
        `${discoveredMemories.size} / ${PROLOGUE_MEMORIES.length}`;

}


/* ==================================================
   全部記憶尋回
   ================================================== */

async function completeMemorySearch() {

    memoryInteractionLocked = true;


    /*
     * 稍微停一下，
     * 不要最後一段對話結束後立刻跳文字。
     */

    await prologueWait(700);


    const completion =
        document.querySelector(
            "#memory-completion"
        );


    completion.classList.remove(
        "hidden"
    );


    /*
     * 觸發淡入。
     */

    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    completion.classList.add(
                        "visible"
                    );

                }
            );

        }
    );

}

/* ==================================================
   舊鍋記憶甦醒演出
   ================================================== */

function triggerPotAwakening() {

    const pot =
        document.querySelector(
            '.memory-object[data-memory-id="boiling-pot"]'
        );


    if (!pot) {

        console.warn(
            "找不到舊鍋記憶物件。"
        );

        return;

    }


    /*
     * 防止重複觸發。
     */

    if (
        pot.classList.contains(
            "pot-awakened"
        )
    ) {
        return;
    }


    pot.classList.add(
        "pot-awakened"
    );

}

function fadeOutAudio(
    audio,
    duration = 1200
) {

    return new Promise(resolve => {

        if (
            !audio ||
            audio.paused
        ) {

            resolve();
            return;
        }


        const startVolume =
            audio.volume;

        const startTime =
            performance.now();


        function fade(currentTime) {

            const progress =
                Math.min(
                    (currentTime - startTime) / duration,
                    1
                );


            audio.volume =
                startVolume * (1 - progress);


            if (progress < 1) {

                requestAnimationFrame(
                    fade
                );

                return;
            }


            audio.pause();

            audio.currentTime =
                0;

            audio.volume =
                startVolume;

            resolve();
        }


        requestAnimationFrame(
            fade
        );

    });

}