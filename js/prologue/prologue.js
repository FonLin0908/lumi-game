"use strict";


/* ==================================================
   序章設定
   ================================================== */

const PROLOGUE_TEXTS = [

    "這裡是哪裡...?",

    "......",

    "頭好痛...\n我...我怎麼了..."

];


/* ==================================================
   記憶空間探索 BGM
   ================================================== */

const memorySpaceExplorationBgm =
    new Audio(
        "./assets/audio/bgm/memory-space-exploration.mp3"
    );

memorySpaceExplorationBgm.preload =
    "auto";

memorySpaceExplorationBgm.loop =
    true;

memorySpaceExplorationBgm.volume =
    0.35;


/* ==================================================
   工具：等待
   ================================================== */

function prologueWait(milliseconds) {

    return new Promise(
        (resolve) => {

            window.setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


function startMemorySpaceExplorationBgm() {

    memorySpaceExplorationBgm.pause();

    memorySpaceExplorationBgm.currentTime =
        0;

    memorySpaceExplorationBgm.volume =
        0.35;


    memorySpaceExplorationBgm
        .play()
        .catch(error => {

            console.warn(
                "記憶空間探索 BGM 播放失敗：",
                error
            );

        });

}

/* ==================================================
   顯示一段文字
   ================================================== */

async function showPrologueText(
    element,
    text,
    displayDuration = 1800
) {

    /*
     * 先確保文字不可見。
     */

    element.classList.remove(
        "visible"
    );


    await prologueWait(400);


    /*
     * 更換文字。
     */

    element.textContent = text;


    /*
     * 等瀏覽器完成一次畫面更新，
     * 再觸發淡入動畫。
     */

    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    element.classList.add(
                        "visible"
                    );

                }
            );

        }
    );


    /*
     * 顯示一段時間。
     */

    await prologueWait(
        displayDuration
    );


    /*
     * 淡出。
     */

    element.classList.remove(
        "visible"
    );


    await prologueWait(1200);

}


/* ==================================================
   進入死亡記憶空間
   ================================================== */

async function enterMemorySpace() {

    const intro =
        document.querySelector(
            "#prologue-intro"
        );

    const memorySpace =
        document.querySelector(
            "#memory-space"
        );


    /*
     * 開場黑幕淡出。
     */

    intro.classList.add(
        "fade-out"
    );


    await prologueWait(1200);


    /*
     * 顯示記憶空間。
     */

    memorySpace.classList.remove(
        "hidden"
    );

    
    /*
    * 建立死亡記憶空間中的
    * 可互動物件。
    */

    initializeMemorySpace();


    await prologueWait(
        500
    );

    startMemorySpaceExplorationBgm();

    /*
     * 觸發場景淡入。
     */

    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    memorySpace.classList.add(
                        "visible"
                    );

                }
            );

        }
    );


    /*
     * 開場層已經不需要顯示。
     */

    intro.classList.add(
        "hidden"
    );

}


/* ==================================================
   重置序章狀態
   ================================================== */

function resetPrologueState() {

    console.log(
        "重置序章狀態。"
    );


    /* ==================================================
       1. 停止所有序章音訊
       ================================================== */

    const audios = [

        memorySpaceExplorationBgm,

        memoryBellRevealSound,

        memoryPuzzleBgm,

        warmMemoryBgm,

        sadMemoryBgm,

        deathMemoryKnifeSlashSound,

        deathMemorySounds?.hairpinFall,
        deathMemorySounds?.starBell,
        deathMemorySounds?.boiling

    ];


    audios.forEach(audio => {

        if (!audio) {
            return;
        }

        audio.pause();

        audio.currentTime =
            0;

    });


    /* ==================================================
       2. 重置探索狀態
       ================================================== */

    discoveredMemories.clear();

    collectedPrologueClues.clear();


    memoryInteractionLocked =
        false;


    hairpinGiftClueFound =
        false;

    hairpinStarClueFound =
        false;

    hairpinPawClueFound =
        false;


    /* ==================================================
       3. 重置 Puzzle 狀態
       ================================================== */

    memoryPuzzleActive =
        false;

    memoryPuzzleInteractionLocked =
        false;


    puzzlePlacedFragments =
        [];


    draggingPuzzleFragment =
        null;

    draggingFragmentWasPlaced =
        false;


    puzzleDragOffsetX =
        0;

    puzzleDragOffsetY =
        0;


    generatedPuzzleFragmentCount =
        0;


    /* ==================================================
       4. 重置探索畫面
       ================================================== */

    const memorySpace =
        document.querySelector(
            "#memory-space"
        );


    const memoryHeader =
        document.querySelector(
            ".memory-space-header"
        );


    const memoryObjects =
        document.querySelector(
            "#memory-objects"
        );


    const memoryCompletion =
        document.querySelector(
            "#memory-completion"
        );


    memorySpace?.classList.remove(
        "visible",
        "memory-cutscene-active",
        "complete-memory-playing"
    );


    memorySpace?.classList.add(
        "hidden"
    );


    memoryHeader?.classList.remove(
        "hidden"
    );


    memoryObjects?.classList.remove(
        "hidden"
    );


    memoryCompletion?.classList.remove(
        "visible"
    );


    memoryCompletion?.classList.add(
        "hidden"
    );


    /* ==================================================
       5. 重置 Puzzle 畫面
       ================================================== */

    const puzzle =
        document.querySelector(
            "#memory-puzzle"
        );


    const fragmentContainer =
        document.querySelector(
            "#puzzle-fragments"
        );


    const reconstructionZone =
        document.querySelector(
            "#puzzle-reconstruction-zone"
        );


    puzzle?.classList.add(
        "hidden"
    );


    puzzle?.classList.remove(
        "puzzle-exit"
    );


    if (fragmentContainer) {

        fragmentContainer.innerHTML =
            "";

    }


    reconstructionZone?.classList.remove(
        "drag-over",
        "final-complete"
    );


    /* ==================================================
       6. 移除可能殘留的 Inspector / 最終動畫
       ================================================== */

    document
        .querySelectorAll(
            `
            .memory-inspector,
            .death-memory-scene
            `
        )
        .forEach(
            element => {

                element.remove();

            }
        );


    console.log(
        "序章狀態重置完成。"
    );

}


/* ==================================================
   啟動序章
   ================================================== */

async function startPrologue() {


    /*
     * 每次正式開始序章，
     * 都先恢復成全新的遊戲狀態。
     */

    resetPrologueState();



    const intro =
        document.querySelector(
            "#prologue-intro"
        );

    const introText =
        document.querySelector(
            "#prologue-intro-text"
        );

    const memorySpace =
        document.querySelector(
            "#memory-space"
        );


    /*
     * 初始化序章狀態。
     */

    intro.classList.remove(
        "hidden",
        "fade-out"
    );

    introText.classList.remove(
        "visible"
    );

    memorySpace.classList.add(
        "hidden"
    );

    memorySpace.classList.remove(
        "visible"
    );


    /*
     * 第一段稍微多停一下，
     * 不要標題畫面一消失就立刻蹦字。
     */

    await prologueWait(600);


    /*
     * 依序播放開場文字。
     */

    await showPrologueText(
        introText,
        PROLOGUE_TEXTS[0],
        1800
    );


    await showPrologueText(
        introText,
        PROLOGUE_TEXTS[1],
        1000
    );


    await showPrologueText(
        introText,
        PROLOGUE_TEXTS[2],
        2200
    );


    /*
     * 正式進入死亡記憶空間。
     */

    await enterMemorySpace();

}