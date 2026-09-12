"use strict";


/* ==================================================
   記憶重組狀態
   ================================================== */

let memoryPuzzleActive =
    false;


/*
 * 合成動畫期間鎖定操作。
 */
let memoryPuzzleInteractionLocked =
    false;


/*
 * 目前放在中央重組區中的碎片 ID。
 */
let puzzlePlacedFragments =
    [];


/*
 * 目前正在拖曳的碎片。
 */
let draggingPuzzleFragment =
    null;


/*
 * 這塊碎片開始拖曳前，
 * 是否原本位於重組區內。
 */
let draggingFragmentWasPlaced =
    false;


/*
 * 拖曳偏移。
 */
let puzzleDragOffsetX =
    0;

let puzzleDragOffsetY =
    0;


/*
 * 已經生成多少塊大型碎片。
 *
 * 用來決定大型碎片飛出後的位置。
 */
let generatedPuzzleFragmentCount =
    0;


/* ==================================================
   完整死亡記憶音效
   ================================================== */

const deathMemorySounds = {

    hairpinFall:
        new Audio(
            "./assets/audio/memory_hairpin_fall.mp3"
        ),

    starBell:
        new Audio(
            "./assets/audio/memory_star_bell.mp3"
        ),

    boiling:
        new Audio(
            "./assets/audio/memory_boiling.mp3"
        )

};


deathMemorySounds.hairpinFall.volume = 0.65;

deathMemorySounds.starBell.volume = 0.75;

deathMemorySounds.boiling.volume = 0.45;

deathMemorySounds.boiling.loop = true;


const deathMemoryKnifeSlashSound =
    new Audio(
        "./assets/audio/memories/knife-slash.mp3"
    );

deathMemoryKnifeSlashSound.preload =
    "auto";

deathMemoryKnifeSlashSound.volume =
    0.8;


/* ==================================================
   記憶拼圖 BGM
   ================================================== */

const memoryPuzzleBgm =
    new Audio(
        "./assets/audio/bgm/memory-puzzle.mp3"
    );

memoryPuzzleBgm.preload =
    "auto";

memoryPuzzleBgm.loop =
    true;

memoryPuzzleBgm.volume =
    0.35;


/* ==================================================
   最終回憶 BGM
   ================================================== */

const warmMemoryBgm =
    new Audio(
        "./assets/audio/bgm/memory-warm.mp3"
    );

warmMemoryBgm.preload =
    "auto";

warmMemoryBgm.loop =
    true;

warmMemoryBgm.volume =
    0.45;


/* ==================================================
   最終記憶：悲傷跑馬燈 BGM
   ================================================== */

const sadMemoryBgm =
    new Audio(
        "./assets/audio/bgm/memory-sad-flashback.mp3"
    );

sadMemoryBgm.preload =
    "auto";

sadMemoryBgm.loop =
    true;

sadMemoryBgm.volume =
    0.42;


/* ==================================================
   初始化記憶重組
   ================================================== */

function initializeMemoryPuzzle() {

    const puzzle =
        document.querySelector(
            "#memory-puzzle"
        );


    const fragmentContainer =
        document.querySelector(
            "#puzzle-fragments"
        );


    if (
        !puzzle
        ||
        !fragmentContainer
    ) {

        console.error(
            "Memory Puzzle UI 找不到。"
        );

        return;

    }


    /*
     * 清除上一輪狀態。
     */

    fragmentContainer.innerHTML = "";

    puzzlePlacedFragments = [];

    draggingPuzzleFragment = null;

    draggingFragmentWasPlaced = false;

    generatedPuzzleFragmentCount = 0;

    memoryPuzzleInteractionLocked = false;


    clearPuzzleFeedback();


    /*
     * 建立目前所有基礎記憶碎片。
     *
     * 新版流程中：
     * 舊鍋不再屬於 Puzzle 碎片。
     */

    PROLOGUE_INITIAL_PUZZLE_FRAGMENTS.forEach(
        (fragmentId, index) => {

            const fragment =
                getPuzzleFragment(
                    fragmentId
                );


            if (!fragment) {

                console.warn(
                    `找不到拼圖碎片：${fragmentId}`
                );

                return;

            }


            const element =
                createPuzzleFragment(
                    fragment,
                    index
                );


            fragmentContainer.appendChild(
                element
            );

        }
    );


    /*
     * 避免重複註冊 Pointer Events。
     */

    document.removeEventListener(
        "pointermove",
        handlePuzzlePointerMove
    );

    document.removeEventListener(
        "pointerup",
        handlePuzzlePointerUp
    );


    document.addEventListener(
        "pointermove",
        handlePuzzlePointerMove
    );

    document.addEventListener(
        "pointerup",
        handlePuzzlePointerUp
    );


    memoryPuzzleActive = true;

}


/* ==================================================
   建立初始記憶碎片
   ================================================== */

function createPuzzleFragment(
    fragment,
    index
) {

    const element =
        createPuzzleFragmentElement(
            fragment
        );


    const position =
        getPuzzleFragmentPosition(
            index
        );


    element.style.left =
        `${position.x}%`;

    element.style.top =
        `${position.y}%`;


    return element;

}


/* ==================================================
   建立記憶碎片 DOM
   ================================================== */

function createPuzzleFragmentElement(
    fragment
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "puzzle-fragment";


    /*
     * 大型記憶碎片使用不同樣式。
     */

    if (
        fragment.type !==
        PUZZLE_FRAGMENT_TYPES.CLUE
    ) {

        element.classList.add(
            "puzzle-fragment-large"
        );

    }


    element.dataset.fragmentId =
        fragment.id;


    /*
     * 圖示。
     */

    const symbol =
        document.createElement(
            "span"
        );

    symbol.className =
        "puzzle-fragment-symbol";

    symbol.textContent =
        fragment.symbol;


    /*
     * 名稱。
     */

    const name =
        document.createElement(
            "span"
        );

    name.className =
        "puzzle-fragment-name";

    name.textContent =
        fragment.name;


    element.append(
        symbol,
        name
    );


    element.addEventListener(
        "pointerdown",
        handlePuzzlePointerDown
    );


    return element;

}


/* ==================================================
   初始碎片位置
   ================================================== */

function getPuzzleFragmentPosition(
    index
) {

    const positions = [

        /* 左側 */

        { x: 5,  y: 18 },
        { x: 16, y: 28 },
        { x: 4,  y: 41 },
        { x: 17, y: 53 },
        { x: 5,  y: 66 },
        { x: 18, y: 78 },
        { x: 31, y: 72 },


        /* 右側 */

        { x: 86, y: 18 },
        { x: 75, y: 28 },
        { x: 87, y: 41 },
        { x: 74, y: 53 },
        { x: 86, y: 66 },
        { x: 73, y: 78 },
        { x: 61, y: 72 }

    ];


    return positions[
        index % positions.length
    ];

}


/* ==================================================
   大型碎片生成位置
   ================================================== */

function getGeneratedFragmentPosition(
    index
) {

    /*
     * 大型碎片主要安排在畫面下半部外圍。
     *
     * 之後正式美術階段可以再調。
     */

    const positions = [

        { x: 27, y: 88 },
        { x: 40, y: 82 },
        { x: 60, y: 82 },
        { x: 73, y: 88 },

        { x: 13, y: 86 },
        { x: 87, y: 86 },

        { x: 28, y: 16 },
        { x: 72, y: 16 }

    ];


    return positions[
        index % positions.length
    ];

}


/* ==================================================
   開始拖曳
   ================================================== */

function handlePuzzlePointerDown(
    event
) {

    if (
        !memoryPuzzleActive
        ||
        memoryPuzzleInteractionLocked
    ) {

        return;

    }


    event.preventDefault();


    const fragment =
        event.currentTarget;


    draggingPuzzleFragment =
        fragment;


    const fragmentId =
        fragment.dataset.fragmentId;


    /*
     * 記錄原本是否在重組區。
     */

    draggingFragmentWasPlaced =
        puzzlePlacedFragments.includes(
            fragmentId
        );


    /*
     * 玩家拿起時先從投入清單移除。
     */

    puzzlePlacedFragments =
        puzzlePlacedFragments.filter(
            id => id !== fragmentId
        );


    fragment.classList.remove(
        "placed"
    );


    /*
     * 清除之前的錯誤提示。
     *
     * 玩家已經開始重新調整組合。
     */

    clearPuzzleFeedback();


    const rect =
        fragment.getBoundingClientRect();


    puzzleDragOffsetX =
        event.clientX -
        rect.left;

    puzzleDragOffsetY =
        event.clientY -
        rect.top;


    const container =
        document.querySelector(
            "#puzzle-fragments"
        );


    const containerRect =
        container.getBoundingClientRect();


    /*
     * 轉成 pixel 座標。
     */

    fragment.style.left =
        `${
            rect.left -
            containerRect.left
        }px`;

    fragment.style.top =
        `${
            rect.top -
            containerRect.top
        }px`;


    fragment.style.transform =
        "none";


    fragment.classList.add(
        "dragging"
    );


    fragment.style.zIndex =
        "100";

}


/* ==================================================
   拖曳中
   ================================================== */

function handlePuzzlePointerMove(
    event
) {

    if (
        !memoryPuzzleActive
        ||
        memoryPuzzleInteractionLocked
        ||
        !draggingPuzzleFragment
    ) {

        return;

    }


    event.preventDefault();


    const container =
        document.querySelector(
            "#puzzle-fragments"
        );


    if (!container) {
        return;
    }


    const containerRect =
        container.getBoundingClientRect();


    let x =
        event.clientX -
        containerRect.left -
        puzzleDragOffsetX;


    let y =
        event.clientY -
        containerRect.top -
        puzzleDragOffsetY;


    /*
     * 限制在畫面內。
     */

    const fragmentWidth =
        draggingPuzzleFragment.offsetWidth;

    const fragmentHeight =
        draggingPuzzleFragment.offsetHeight;


    x =
        Math.max(
            0,
            Math.min(
                x,
                containerRect.width -
                fragmentWidth
            )
        );


    y =
        Math.max(
            0,
            Math.min(
                y,
                containerRect.height -
                fragmentHeight
            )
        );


    draggingPuzzleFragment.style.left =
        `${x}px`;

    draggingPuzzleFragment.style.top =
        `${y}px`;


    /*
     * Hover 重組區提示。
     */

    const zone =
        document.querySelector(
            "#puzzle-reconstruction-zone"
        );


    if (
        zone
        &&
        isPointerInsidePuzzleZone(
            event,
            zone
        )
    ) {

        zone.classList.add(
            "drag-over"
        );

    }
    else {

        zone?.classList.remove(
            "drag-over"
        );

    }

}


/* ==================================================
   放開碎片
   ================================================== */

async function handlePuzzlePointerUp(
    event
) {

    if (
        !memoryPuzzleActive
        ||
        memoryPuzzleInteractionLocked
        ||
        !draggingPuzzleFragment
    ) {

        return;

    }


    const fragment =
        draggingPuzzleFragment;


    const zone =
        document.querySelector(
            "#puzzle-reconstruction-zone"
        );


    const placedInsideZone =
        (
            zone
            &&
            isFragmentInsidePuzzleZone(
                fragment,
                zone
            )
        );


    /*
     * 放進重組區。
     */

    if (placedInsideZone) {

        placePuzzleFragmentInZone(
            fragment
        );

    }


    fragment.classList.remove(
        "dragging"
    );


    fragment.style.zIndex =
        "";


    zone?.classList.remove(
        "drag-over"
    );


    draggingPuzzleFragment =
        null;


    /*
     * 不論是：
     *
     * - 新碎片放進去
     * - 原本碎片被拿出去
     *
     * 都重新檢查目前狀態。
     */

    if (
        placedInsideZone
        ||
        draggingFragmentWasPlaced
    ) {

        await evaluatePuzzleCombination();

    }


    draggingFragmentWasPlaced =
        false;

}


/* ==================================================
   Pointer 是否進入重組區
   ================================================== */

function isPointerInsidePuzzleZone(
    event,
    zone
) {

    const rect =
        zone.getBoundingClientRect();


    return (
        event.clientX >= rect.left
        &&
        event.clientX <= rect.right
        &&
        event.clientY >= rect.top
        &&
        event.clientY <= rect.bottom
    );

}


/* ==================================================
   碎片是否位於重組區
   ================================================== */

function isFragmentInsidePuzzleZone(
    fragment,
    zone
) {

    const fragmentRect =
        fragment.getBoundingClientRect();

    const zoneRect =
        zone.getBoundingClientRect();


    const centerX =
        fragmentRect.left +
        fragmentRect.width / 2;


    const centerY =
        fragmentRect.top +
        fragmentRect.height / 2;


    return (
        centerX >= zoneRect.left
        &&
        centerX <= zoneRect.right
        &&
        centerY >= zoneRect.top
        &&
        centerY <= zoneRect.bottom
    );

}


/* ==================================================
   放入重組區
   ================================================== */

function placePuzzleFragmentInZone(
    fragment
) {

    const fragmentId =
        fragment.dataset.fragmentId;


    if (
        !puzzlePlacedFragments.includes(
            fragmentId
        )
    ) {

        puzzlePlacedFragments.push(
            fragmentId
        );

    }


    /*
     * 不吸附位置。
     *
     * 玩家放在哪裡，
     * 就停在哪裡。
     */

    fragment.classList.add(
        "placed"
    );


    console.log(
        "目前投入：",
        [...puzzlePlacedFragments]
    );

}


/* ==================================================
   判斷目前組合
   ================================================== */

async function evaluatePuzzleCombination() {

    /*
     * 沒有碎片。
     */

    if (
        puzzlePlacedFragments.length ===
        0
    ) {

        clearPuzzleFeedback();

        return;

    }


    const result =
        getPuzzleMatchState(
            puzzlePlacedFragments
        );


    switch (result.state) {


        /* ==================================================
           PARTIAL
           ================================================== */

        case PUZZLE_MATCH_STATES.PARTIAL:

            clearPuzzleFeedback();

            break;


        /* ==================================================
           INVALID
           ================================================== */

        case PUZZLE_MATCH_STATES.INVALID:

            showPuzzleInvalidFeedback();

            break;


        /* ==================================================
           COMPLETE
           ================================================== */

        case PUZZLE_MATCH_STATES.COMPLETE:

            clearPuzzleFeedback();

            await combinePuzzleFragments(
                result.recipe
            );

            break;

    }

}


/* ==================================================
   INVALID 提示
   ================================================== */

function showPuzzleInvalidFeedback() {

    const zone =
        document.querySelector(
            "#puzzle-reconstruction-zone"
        );


    const hint =
        document.querySelector(
            ".puzzle-zone-hint"
        );


    zone?.classList.add(
        "invalid"
    );


    if (hint) {

        hint.textContent =
            "記憶之間沒有產生共鳴……";

    }

}


/* ==================================================
   清除 Puzzle 提示
   ================================================== */

function clearPuzzleFeedback() {

    const zone =
        document.querySelector(
            "#puzzle-reconstruction-zone"
        );


    const hint =
        document.querySelector(
            ".puzzle-zone-hint"
        );


    zone?.classList.remove(
        "invalid",
        "combining"
    );


    if (hint) {

        hint.textContent =
            "將相關碎片放入這裡";

    }

}


/* ==================================================
   合成記憶碎片
   ================================================== */

async function combinePuzzleFragments(
    recipe
) {

    if (!recipe) {
        return;
    }


    memoryPuzzleInteractionLocked = true;


    const zone =
        document.querySelector(
            "#puzzle-reconstruction-zone"
        );


    const fragmentContainer =
        document.querySelector(
            "#puzzle-fragments"
        );


    if (!fragmentContainer) {

        console.error(
            "找不到 #puzzle-fragments。"
        );

        memoryPuzzleInteractionLocked = false;

        return;

    }


    zone?.classList.add(
        "combining"
    );


    /*
     * 找到這次參與合成的碎片。
     */

    const sourceElements =
        recipe.requires
            .map(
                id =>
                    document.querySelector(
                        `.puzzle-fragment[data-fragment-id="${id}"]`
                    )
            )
            .filter(Boolean);


    /*
     * 正確碎片產生共鳴。
     */

    sourceElements.forEach(
        element => {

            element.classList.add(
                "combining"
            );

        }
    );


    await prologueWait(
        550
    );


    /*
     * 碎片向中央收縮。
     */

    sourceElements.forEach(
        element => {

            element.classList.add(
                "combine-collapse"
            );

        }
    );


    await prologueWait(
        500
    );


    /*
     * 消耗來源碎片。
     */

    sourceElements.forEach(
        element => {

            element.remove();

        }
    );


    /*
     * 從中央投入清單移除。
     */

    puzzlePlacedFragments =
        puzzlePlacedFragments.filter(
            id =>
                !recipe.requires.includes(
                    id
                )
        );


    /*
     * 取得合成後的新碎片。
     */

    const resultFragment =
        getPuzzleFragment(
            recipe.result
        );


    if (!resultFragment) {

        console.error(
            `找不到合成結果：${recipe.result}`
        );

        zone?.classList.remove(
            "combining"
        );

        memoryPuzzleInteractionLocked =
            false;

        return;

    }


    /*
     * 建立新的推論／真相碎片。
     */

    const resultElement =
        createGeneratedPuzzleFragment(
            resultFragment,
            fragmentContainer
        );


    resultElement.style.pointerEvents =
        "none";


    await prologueWait(
        100
    );


    resultElement.classList.add(
        "generated-visible"
    );


    /*
     * 等待碎片從中央飛到外圍。
     */

    await prologueWait(
        650
    );


    /*
     * 清除生成動畫狀態。
     *
     * 如果不清除，
     * left / top transition 會影響後續拖曳。
     */

    resultElement.classList.remove(
        "generated",
        "generated-visible"
    );


    resultElement.style.pointerEvents =
        "";


    zone?.classList.remove(
        "combining"
    );


    /*
     * 每次成功合成後，
     * 檢查是否已取得兩個最終真相。
     */

    const puzzleCompleted =
        await checkProloguePuzzleComplete();


    if (puzzleCompleted) {

        return;

    }


    /*
     * Puzzle 尚未完成，
     * 恢復玩家操作。
     */

    memoryPuzzleInteractionLocked =
        false;


    /*
     * 中央區可能還留有其他碎片，
     * 重新檢查目前的組合。
     */

    await evaluatePuzzleCombination();

}

/* ==================================================
   取得目前仍存在的所有 Puzzle 碎片
   ================================================== */

function getCurrentPuzzleFragmentIds() {

    const elements =
        document.querySelectorAll(
            ".puzzle-fragment[data-fragment-id]"
        );


    return [
        ...elements
    ].map(
        element =>
            element.dataset.fragmentId
    );

}

/* ==================================================
   檢查序章 Puzzle 是否完成
   ================================================== */

async function checkProloguePuzzleComplete() {

    const currentFragmentIds =
        getCurrentPuzzleFragmentIds();


    const completed =
        isProloguePuzzleComplete(
            currentFragmentIds
        );


    if (!completed) {

        return false;

    }


    await completeProloguePuzzle();


    return true;

}

/* ==================================================
   序章第一次記憶重組完成
   ================================================== */

async function completeProloguePuzzle() {

    fadeOutAudio(
        memoryPuzzleBgm,
        1200
    );

    /*
     * Puzzle 完成後立刻鎖定操作。
     */

    memoryPuzzleInteractionLocked =
        true;


    const puzzle =
        document.querySelector(
            "#memory-puzzle"
        );


    const fragmentContainer =
        document.querySelector(
            "#puzzle-fragments"
        );


    const zone =
        document.querySelector(
            "#puzzle-reconstruction-zone"
        );


    const header =
        document.querySelector(
            ".memory-puzzle-header"
        );


    if (!puzzle) {

        console.error(
            "找不到 #memory-puzzle。"
        );

        return;

    }


    /* ==================================================
       更新 Puzzle 標題
       ================================================== */

    if (header) {

        header.innerHTML = `
            <h2 class="memory-puzzle-title">
                記憶重組完成
            </h2>

            <p class="memory-puzzle-hint">
                真相逐漸清晰……
            </p>
        `;

    }


    /* ==================================================
       中央區進入完成狀態
       ================================================== */

    zone?.classList.add(
        "final-complete"
    );


    /*
     * 禁止剩餘碎片拖曳。
     */

    if (fragmentContainer) {

        fragmentContainer
            .querySelectorAll(
                ".puzzle-fragment"
            )
            .forEach(
                element => {

                    element.style.pointerEvents =
                        "none";

                }
            );

    }


    /* ==================================================
       讓玩家看最後兩個真相
       ================================================== */

    await prologueWait(
        1500
    );


    /* ==================================================
       Puzzle 開始退場
       ================================================== */

    memoryPuzzleActive =
        false;


    puzzle.classList.add(
        "puzzle-exit"
    );


    /*
     * 配合 CSS：
     *
     * opacity 1.15s
     * filter 1.15s
     */

    await prologueWait(
        1200
    );


    /* ==================================================
       正式關閉 Puzzle
       ================================================== */

    puzzle.classList.add(
        "hidden"
    );


    /*
     * 清除退場狀態。
     *
     * 下一次如果還要使用 Puzzle，
     * 不會一打開就是透明的。
     */

    puzzle.classList.remove(
        "puzzle-exit"
    );


    /* ==================================================
       恢復記憶房間
       ================================================== */

    const headerElement =
        document.querySelector(
            ".memory-space-header"
        );


    const objects =
        document.querySelector(
            "#memory-objects"
        );


    headerElement?.classList.remove(
        "hidden"
    );


    objects?.classList.remove(
        "hidden"
    );


    /*
     * 先讓玩家重新看見房間，
     * 不要一切回來就立刻跳對話。
     */

    await prologueWait(
        500
    );


    /* ==================================================
       露米理解目前拼出的真相
       ================================================== */

    await showMemoryDialogue({

        type: "thought",

        lines: [
            "襲擊我的人……是麻麻。",
            "而且，她早就知道我的身分……",
            "可是……為什麼？"
        ]

    });


    /*
     * 「為什麼？」之後留一段安靜。
     */

    await prologueWait(
        850
    );


    /* ==================================================
       清空 Puzzle 投入狀態
       ================================================== */

    puzzlePlacedFragments = [];

    draggingPuzzleFragment =
        null;

    draggingFragmentWasPlaced =
        false;


    /* ==================================================
       舊鍋甦醒
       ================================================== */

    triggerPotAwakening();


    /*
     * 舊鍋演出開始後，
     * 恢復記憶空間互動。
     */

    memoryInteractionLocked =
        false;

}


/* ==================================================
   建立大型記憶碎片
   ================================================== */

function createGeneratedPuzzleFragment(
    fragment,
    container
) {

    const element =
        createPuzzleFragmentElement(
            fragment
        );


    element.classList.add(
        "generated"
    );


    /*
     * 先從重組區中央生成。
     */

    const zone =
        document.querySelector(
            "#puzzle-reconstruction-zone"
        );


    const containerRect =
        container.getBoundingClientRect();

    const zoneRect =
        zone.getBoundingClientRect();


    const startX =
        zoneRect.left -
        containerRect.left +
        zoneRect.width / 2;


    const startY =
        zoneRect.top -
        containerRect.top +
        zoneRect.height / 2;


    element.style.left =
        `${startX}px`;

    element.style.top =
        `${startY}px`;

    element.style.transform =
        "translate(-50%, -50%) scale(0.3)";


    container.appendChild(
        element
    );


    /*
     * 下一幀飛向外圍。
     */

    const target =
        getGeneratedFragmentPosition(
            generatedPuzzleFragmentCount
        );


    generatedPuzzleFragmentCount++;


    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    element.style.left =
                        `${target.x}%`;

                    element.style.top =
                        `${target.y}%`;

                    element.style.transform =
                        "translate(-50%, -50%) scale(1)";

                }
            );

        }
    );


    return element;

}

/* ==================================================
   返回標題畫面
   ================================================== */

async function returnToTitleScreen(
    scene
) {

    const titleScreen =
        document.querySelector(
            "#title-screen"
        );


    const prologueScreen =
        document.querySelector(
            "#prologue-screen"
        );


    const memorySpace =
        document.querySelector(
            "#memory-space"
        );


    if (
        !titleScreen
        ||
        !prologueScreen
    ) {

        console.error(
            "找不到標題畫面或序章畫面。"
        );

        return;

    }


    /* ==================================================
       確保所有 BGM 停止
       ================================================== */

    const bgms = [

        memoryPuzzleBgm,
        warmMemoryBgm,
        sadMemoryBgm

    ];


    bgms.forEach(audio => {

        if (!audio) {
            return;
        }

        audio.pause();

        audio.currentTime =
            0;

    });


    /*
     * 探索 BGM 定義在 memory-space.js，
     * 如果存在就一起停止。
     */

    if (
        typeof memorySpaceExplorationBgm
        !== "undefined"
    ) {

        memorySpaceExplorationBgm.pause();

        memorySpaceExplorationBgm.currentTime =
            0;

    }


    /* ==================================================
       清掉最終動畫
       ================================================== */

    scene?.remove();


    memorySpace?.classList.remove(
        "complete-memory-playing"
    );


    /* ==================================================
       關閉序章
       ================================================== */

    prologueScreen.classList.add(
        "hidden"
    );

    prologueScreen.setAttribute(
        "aria-hidden",
        "true"
    );


    /* ==================================================
       回標題畫面
       ================================================== */

    titleScreen.classList.remove(
        "hidden"
    );

    titleScreen.setAttribute(
        "aria-hidden",
        "false"
    );

    /*
    * 恢復標題畫面按鈕。
    */

    const startGameButton =
        document.querySelector(
            "#start-game"
        );


    const settingsButton =
        document.querySelector(
            "#open-settings"
        );


    if (startGameButton) {

        startGameButton.disabled =
            false;

    }


    if (settingsButton) {

        settingsButton.disabled =
            false;

    }


    if (
        typeof window.startTitleScreenBgm
        === "function"
    ) {

        window.startTitleScreenBgm();

    }


    console.log(
        "已返回標題畫面。"
    );

}


/* ==================================================
   完整死亡記憶
   ================================================== */

async function startCompleteDeathMemory() {

    /*
     * 最終動畫開始後，
     * 不再接受 Puzzle 操作。
     */

    memoryPuzzleActive =
        false;

    const puzzle =
        document.querySelector(
            "#memory-puzzle"
        );


    const flash =
        document.querySelector(
            ".memory-final-flash"
        );


    memoryPuzzleInteractionLocked =
        true;


    /* ==================================================
       建立最終記憶場景
       ================================================== */

    const scene =
        document.createElement(
            "div"
        );


    scene.className =
        "complete-death-memory";


    scene.innerHTML = `
        <div class="death-memory-background"></div>

        <div class="death-memory-overlay"></div>

        <div class="death-memory-transition"></div>
    `;


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


    memorySpace.classList.add(
        "complete-memory-playing"
    );


    memorySpace.appendChild(
        scene
    );


    /*
     * Puzzle 關閉。
     */

    puzzle.classList.add(
        "hidden"
    );


    /*
     * Puzzle 原本的白光退出。
     */

    flash?.classList.remove(
        "visible"
    );


    await prologueWait(
        900
    );


    /* ==================================================
       第一幕
       「那天你發現了我」
       ================================================== */

    /*
    * 溫馨回憶 BGM 開始。
    */

    warmMemoryBgm.pause();

    warmMemoryBgm.currentTime =
        0;

    warmMemoryBgm.volume =
        0.45;

    warmMemoryBgm
        .play()
        .catch(error => {

            console.warn(
                "溫馨回憶 BGM 播放失敗：",
                error
            );

        });


    await prologueWait(
        500
    );
    
       
    await showDeathMemoryBlackText(
        scene,
        "那天你發現了我",
        1900
    );


    setDeathMemoryBackground(
        scene,
        "maoya-found-lumi.webp"
    );


    await prologueWait(
        200
    );


    await hideDeathMemoryFlash(
        scene
    );


    /*
     * 讓玩家先看畫面。
     */

    await prologueWait(
        1000
    );


    /*
     * 貓燁第一次對露米說話。
     */

    await showMemoryDialogue({

        mode: "cinematic",

        character: "maoya",

        lines: [
            "咦？你怎麼自己一個人在這裡？迷路了嗎？",
            "那……要不要先跟我回家？"
        ]

    });


    /*
     * 對話結束後保留畫面。
     */

    await prologueWait(
        1700
    );


    /* ==================================================
       第二幕
       「後來我們一起生活」
       ================================================== */

    await showDeathMemoryBlackText(
        scene,
        "後來我們一起生活",
        1800
    );


    setDeathMemoryBackground(
        scene,
        "memory-life-story.webp"
    );


    await prologueWait(
        200
    );


    await hideDeathMemoryFlash(
        scene
    );


    /*
     * 無對話。
     */

    await prologueWait(
        3500
    );


    /* ==================================================
       第三幕
       「一起出去玩」
       ================================================== */

    await showDeathMemoryBlackText(
        scene,
        "一起出去玩",
        1800
    );


    setDeathMemoryBackground(
        scene,
        "memory-butterfly-day.webp"
    );


    await prologueWait(
        200
    );


    await hideDeathMemoryFlash(
        scene
    );


    /*
     * 無對話。
     */

    await prologueWait(
        3500
    );


    /* ==================================================
       第四幕
       「你也送了我禮物」
       ================================================== */

    await showDeathMemoryBlackText(
        scene,
        "你也送了我禮物",
        1800
    );


    setDeathMemoryBackground(
        scene,
        "hairpin-memory.webp"
    );


    await prologueWait(
        200
    );


    await hideDeathMemoryFlash(
        scene
    );


    await prologueWait(
        1000
    );


    /*
     * 沿用原本髮飾回憶對話。
     */

    await showMemoryDialogue({

        mode: "cinematic",

        character: "maoya",

        lines: [
            "這個送給妳。",
            "很適合妳吧？"
        ]

    });


    await prologueWait(
        1500
    );


    /* ==================================================
       第五幕
       「我一直很喜歡，也很珍惜。」
       ================================================== */

    await showDeathMemoryBlackText(
        scene,
        "我一直很喜歡，也很珍惜。",
        2200
    );


    /*
     * 黑畫面繼續停留。
     */

    await prologueWait(
        800
    );


    /* ==================================================
       轉折
       ================================================== */

    fadeOutAudio(
        warmMemoryBgm,
        1400
    );

    await showDeathMemoryBlackText(
        scene,
        "但……",
        1200
    );


    await prologueWait(
        300
    );


    await showDeathMemoryBlackText(
        scene,
        "直到那天……",
        1600
    );


    await prologueWait(
    450
    );


    /*
    * 刀刃聲。
    */

    deathMemoryKnifeSlashSound.pause();

    deathMemoryKnifeSlashSound.currentTime =
        0;


    await deathMemoryKnifeSlashSound
        .play()
        .catch(error => {

            console.warn(
                "刀刃音效播放失敗：",
                error
            );

    });


    /*
    * 聲音先出現，
    * 再讓死亡畫面突然恢復。
    */

    await prologueWait(
        180
    );


    /* ==================================================
       第六幕
       死亡現場
       ================================================== */

    setDeathMemoryBackground(
        scene,
        "death-scene.webp"
    );


    /*
     * 不慢慢淡入。
     *
     * 從黑幕直接讓死亡畫面出現，
     * 製造突然恢復記憶的感覺。
     */

    await hideDeathMemoryFlash(
        scene
    );

        

    /*
     * 完全不講話。
     */

    await prologueWait(
        3000
    );

    /*
    * 死亡畫面出現後稍微留白，
    * 再讓悲傷 BGM 進來。
    */

    await prologueWait(
        350
    );


    sadMemoryBgm.pause();

    sadMemoryBgm.currentTime =
        0;

    sadMemoryBgm.volume =
        0.42;


    sadMemoryBgm
        .play()
        .catch(error => {

            console.warn(
                "悲傷回憶 BGM 播放失敗：",
                error
            );

        });


    /* ==================================================
       「為……為什麼……？」
       ================================================== */

    await showDeathMemoryBlackText(
        scene,
        "為……為什麼……？",
        1800
    );


    /* ==================================================
    幸福記憶快速閃回
    ================================================== */

    const flashbackScenes = [

        "maoya-found-lumi.webp",

        "memory-life-story.webp",

        "memory-butterfly-day.webp"

    ];


    const background =
        scene.querySelector(
            ".death-memory-background"
        );


    for (
        let index = 0;
        index < flashbackScenes.length;
        index++
    ) {

        const imageName =
            flashbackScenes[index];


        /*
        * 先換圖片。
        */

        setDeathMemoryBackground(
            scene,
            imageName
        );


        /*
        * 每一張重新觸發閃回動畫。
        */

        background?.classList.remove(
            "memory-flashback"
        );


        void background?.offsetWidth;


        background?.classList.add(
            "memory-flashback"
        );


        /*
        * 黑幕快速退去。
        */

        await hideDeathMemoryFlash(
            scene
        );


        /*
        * 第一張稍久，
        * 後兩張稍快。
        */

        await prologueWait(
            index === 0
                ? 900
                : 720
        );


        /*
        * 最後一張不用白閃後再顯示其他畫面，
        * 直接進黑幕即可。
        */

        await flashDeathMemoryScene(
            scene
        );


        await prologueWait(
            120
        );

    }


    /*
    * 清除效果。
    */

    background?.classList.remove(
        "memory-flashback"
    );

    /* ==================================================
    悲傷回憶結束
    ================================================== */

    /*
    * 跑馬燈結束後開始淡出。
    *
    * 不 await，
    * 讓音樂淡出的同時進入「因為……」。
    */

    fadeOutAudio(
        sadMemoryBgm,
        1400
    );

    /* ==================================================
       最後答案前
       ================================================== */

    await showDeathMemoryBlackText(
        scene,
        "因為……",
        1500,
        "maoya-text"
    );


    /*
     * 讓「因為……」後面留真正的空白。
     */

    await prologueWait(
        650
    );


    /* ==================================================
       最後 CG
       ================================================== */

    setDeathMemoryBackground(
        scene,
        "memory_hairpin_fall.webp"
    );


    await prologueWait(
        200
    );


    await hideDeathMemoryFlash(
        scene
    );


    /*
     * 先讓玩家看到：
     *
     * 倒地的露米
     * 星形髮飾
     * 半蹲的貓燁
     * 只看得到嘴巴
     */

    await prologueWait(
        1200
    );


    /* ==================================================
       真相
       ================================================== */

    await showMemoryDialogue({

        mode: "cinematic",

        character: "maoya",

        lines: [
            "吃了妳……才能獲得拾光者的力量呢！"
        ]

    });


    /*
    * 真相說完後，
    * 不立刻離開畫面。
    */

    await prologueWait(
        3000
    );


    /*
    * 緩慢沉入黑畫面。
    */

    await flashDeathMemoryScene(
        scene
    );


    await prologueWait(
        1400
    );


    const endingText =
        document.createElement(
            "div"
        );


    endingText.className =
        "prologue-ending-text";


    endingText.textContent =
        "序章結束";


    scene.appendChild(
        endingText
    );


    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    endingText.classList.add(
                        "visible"
                    );

                }
            );

        }
    );


    await prologueWait(
        3500
    );


    /*
    * 「序章結束」淡出。
    */

    endingText.classList.remove(
        "visible"
    );


    await prologueWait(
        800
    );


    console.log(
        "序章完成"
    );


    /*
    * 返回標題畫面。
    */

    await returnToTitleScreen(
        scene
    );

}


/* ==================================================
   最終記憶：黑畫面文字
   ================================================== */

async function showDeathMemoryBlackText(
    scene,
    text,
    duration = 1800,
    extraClass = ""
) {

    /*
     * 先進入黑幕。
     */

    await flashDeathMemoryScene(
        scene
    );


    await prologueWait(
        350
    );


    /*
     * 建立文字。
     */

    const textElement =
        document.createElement(
            "div"
        );


    textElement.className =
        `death-memory-chapter-text ${extraClass}`;


    textElement.textContent =
        text;


    scene.appendChild(
        textElement
    );


    /*
     * 淡入文字。
     */

    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    textElement.classList.add(
                        "visible"
                    );

                }
            );

        }
    );


    await prologueWait(
        duration
    );


    /*
     * 淡出文字。
     */

    textElement.classList.remove(
        "visible"
    );


    await prologueWait(
        500
    );


    textElement.remove();

}




/* ==================================================
   等待玩家結束死亡記憶
   ================================================== */

function waitForDeathMemoryEndClick() {

    return new Promise(
        (resolve) => {

            function cleanup() {

                document.removeEventListener(
                    "click",
                    handleClick
                );

                document.removeEventListener(
                    "keydown",
                    handleKeydown
                );

            }


            function handleClick() {

                cleanup();

                resolve();

            }


            function handleKeydown(event) {

                if (
                    event.key === "Enter"
                    ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    cleanup();

                    resolve();

                }

            }


            document.addEventListener(
                "click",
                handleClick
            );


            document.addEventListener(
                "keydown",
                handleKeydown
            );

        }
    );

}


/* ==================================================
   從死亡記憶結束序章
   ================================================== */

async function finishPrologueFromDeathMemory(
    scene
) {

    /*
     * 最後畫面慢慢轉黑。
     */

    await flashDeathMemoryScene(
        scene
    );


    /*
     * 沸水聲同步淡出。
     */

    await fadeOutDeathMemorySound(
        deathMemorySounds.boiling,
        1600
    );


    /*
     * 完全黑畫面停一下。
     */

    await prologueWait(1000);


    /*
     * 確保沸水聲完全停止。
     */

    deathMemorySounds.boiling.pause();

    deathMemorySounds.boiling.currentTime = 0;


    /* ==================================================
       顯示「下集待續」
       ================================================== */

    const endingText =
        document.createElement(
            "div"
        );


    endingText.className =
        "prologue-ending-text";


    endingText.textContent =
        "下集待續";


    scene.appendChild(
        endingText
    );


    /*
     * 下一個 frame 再加入 visible，
     * 才能觸發 CSS transition。
     */

    requestAnimationFrame(
        () => {

            endingText.classList.add(
                "visible"
            );

        }
    );


    /*
     * 顯示一段時間。
     */

    await prologueWait(
        3500
    );


    /*
    * 「序章結束」淡出。
    */

    endingText.classList.remove(
        "visible"
    );


    await prologueWait(
        800
    );


    console.log(
        "序章完成"
    );


    /*
    * 返回標題畫面。
    */

    await returnToTitleScreen(
        scene
    );

}

/* ==================================================
   Audio 淡出
   ================================================== */

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
                    (currentTime - startTime)
                    / duration,
                    1
                );


            audio.volume =
                startVolume
                * (1 - progress);


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

/* ==================================================
   音效淡出
   ================================================== */

function fadeOutDeathMemorySound(
    audio,
    duration = 1500
) {

    return new Promise(
        (resolve) => {

            if (
                !audio
                ||
                audio.paused
            ) {

                resolve();

                return;

            }


            const startVolume =
                audio.volume;


            const startTime =
                performance.now();


            function update(currentTime) {

                const elapsed =
                    currentTime - startTime;


                const progress =
                    Math.min(
                        elapsed / duration,
                        1
                    );


                audio.volume =
                    startVolume *
                    (1 - progress);


                if (progress < 1) {

                    requestAnimationFrame(
                        update
                    );

                    return;

                }


                audio.pause();

                audio.currentTime = 0;

                /*
                 * 恢復原始音量，
                 * 下次播放才不會完全沒聲音。
                 */

                audio.volume =
                    startVolume;


                resolve();

            }


            requestAnimationFrame(
                update
            );

        }
    );

}

/* ==================================================
   切換死亡記憶背景
   ================================================== */

function setDeathMemoryBackground(
    scene,
    imageName
) {

    const background =
        scene.querySelector(
            ".death-memory-background"
        );


    if (!background) {

        console.error(
            "找不到死亡記憶背景。"
        );

        return;

    }


    /*
     * 注意：
     *
     * 如果你的圖片實際不是放在
     * assets/images/memories/
     *
     * 只需要改這裡。
     */

    background.style.backgroundImage =
        `url("./assets/images/memories/scenes/${imageName}")`;

}




/* ==================================================
   記憶泛白
   ================================================== */

async function flashDeathMemoryScene(
    scene
) {

    const transition =
        scene.querySelector(
            ".death-memory-transition"
        );


    if (!transition) {
        return;
    }


    transition.classList.add(
        "visible"
    );


    await prologueWait(
        900
    );

}


/* ==================================================
   記憶白光退去
   ================================================== */

async function hideDeathMemoryFlash(
    scene
) {

    const transition =
        scene.querySelector(
            ".death-memory-transition"
        );


    if (!transition) {
        return;
    }


    transition.classList.remove(
        "visible"
    );


    await prologueWait(
        900
    );

}


/* ==================================================
   進入記憶重組
   ================================================== */

function startMemoryPuzzle() {

    if (memoryPuzzleActive) {
        return;
    }


    const header =
        document.querySelector(
            ".memory-space-header"
        );


    const objects =
        document.querySelector(
            "#memory-objects"
        );


    const completion =
        document.querySelector(
            "#memory-completion"
        );


    const puzzle =
        document.querySelector(
            "#memory-puzzle"
        );


    if (!puzzle) {

        console.error(
            "找不到 #memory-puzzle。"
        );

        return;

    }


    /*
     * 進入 Puzzle 後，
     * 暫時禁止場景物件互動。
     */

    memoryInteractionLocked =
        true;


    /*
     * 隱藏探索畫面。
     */

    header?.classList.add(
        "hidden"
    );


    objects?.classList.add(
        "hidden"
    );


    completion?.classList.add(
        "hidden"
    );


    /*
     * 建立 Puzzle。
     */

    initializeMemoryPuzzle();


    /*
     * 顯示 Puzzle。
     */

    puzzle.classList.remove(
        "hidden"
    );

    startMemoryPuzzleBgm();

}


function startMemoryPuzzleBgm() {

    memoryPuzzleBgm.pause();

    memoryPuzzleBgm.currentTime =
        0;

    memoryPuzzleBgm.volume =
        0.35 * getMusicVolumeScale();


    memoryPuzzleBgm
        .play()
        .catch(error => {

            console.warn(
                "記憶拼圖 BGM 播放失敗：",
                error
            );

        });

}


/* ==================================================
   DEBUG：直接完成記憶拼圖
   ================================================== */

async function debugSkipMemoryPuzzle() {

    console.warn(
        "[DEBUG] 直接完成記憶重組。"
    );


    /*
     * Puzzle 尚未開啟的話，
     * 先開啟。
     */

    if (!memoryPuzzleActive) {

        startMemoryPuzzle();

        await prologueWait(
            200
        );

    }


    const fragmentContainer =
        document.querySelector(
            "#puzzle-fragments"
        );


    if (!fragmentContainer) {

        console.error(
            "找不到 #puzzle-fragments。"
        );

        return;

    }


    /*
     * 清除目前所有碎片。
     */

    fragmentContainer.innerHTML = "";

    puzzlePlacedFragments = [];


    /*
     * 直接建立兩個最終真相。
     */

    const finalTruthIds = [
        "maoya-attacked-lumi",
        "maoya-knows-lumi-identity"
    ];


    finalTruthIds.forEach(
        (fragmentId, index) => {

            const fragment =
                getPuzzleFragment(
                    fragmentId
                );


            if (!fragment) {

                console.error(
                    `找不到最終真相：${fragmentId}`
                );

                return;

            }


            const element =
                createPuzzleFragment(
                    fragment,
                    index
                );


            fragmentContainer.appendChild(
                element
            );

        }
    );


    /*
     * 執行正式完成流程。
     */

    await completeProloguePuzzle();

}

/* ==================================================
   DEBUG：直接進入最終記憶
   ================================================== */

async function debugStartFinalMemory() {

    console.warn(
        "[DEBUG] 直接進入最終記憶。"
    );


    /*
     * 關閉 Puzzle 狀態。
     */

    memoryPuzzleActive =
        false;

    memoryPuzzleInteractionLocked =
        true;


    /*
     * 如果 Puzzle 畫面還存在，
     * 直接隱藏。
     */

    const puzzle =
        document.querySelector(
            "#memory-puzzle"
        );


    puzzle?.classList.add(
        "hidden"
    );


    /*
     * 隱藏探索 UI，
     * 避免最終動畫底下還露出物件。
     */

    const header =
        document.querySelector(
            ".memory-space-header"
        );


    const objects =
        document.querySelector(
            "#memory-objects"
        );


    header?.classList.add(
        "hidden"
    );


    objects?.classList.add(
        "hidden"
    );


    /*
    * 停止目前可能正在播放的 BGM。
    */

    memorySpaceExplorationBgm.pause();

    memorySpaceExplorationBgm.currentTime =
        0;


    memoryPuzzleBgm.pause();

    memoryPuzzleBgm.currentTime =
        0;


    warmMemoryBgm.pause();

    warmMemoryBgm.currentTime =
        0;


    sadMemoryBgm.pause();

    sadMemoryBgm.currentTime =
        0;

    /*
     * 直接播放最終記憶。
     */

    await startCompleteDeathMemory();

}