"use strict";


/* ==================================================
   儲存設定
   ================================================== */

const SETTINGS_STORAGE_KEY =
    "lumiGameSettings";

const defaultSettings = {
    musicVolume: 70,
    sfxVolume: 70,
    textSpeed: 3
};


/* ==================================================
   DOM：遊戲畫面
   ================================================== */

const titleScreen =
    document.querySelector(
        "#title-screen"
    );

const prologueScreen =
    document.querySelector(
        "#prologue-screen"
    );

const screenTransition =
    document.querySelector(
        "#screen-transition"
    );

/* ==================================================
   標題畫面 BGM
   ================================================== */

const titleScreenBgm =
    new Audio(
        "./assets/audio/bgm/title-screen.mp3"
    );

titleScreenBgm.preload =
    "auto";

titleScreenBgm.loop =
    true;

titleScreenBgm.volume =
    0.35;
    

/* ==================================================
   DOM：主選單
   ================================================== */

const startGameButton =
    document.querySelector(
        "#start-game"
    );

const continueGameButton =
    document.querySelector(
        "#continue-game"
    );

const settingsButton =
    document.querySelector(
        "#open-settings"
    );


/* ==================================================
   DOM：設定
   ================================================== */

const settingsModal =
    document.querySelector(
        "#settings-modal"
    );

const closeSettingsButton =
    document.querySelector(
        "#close-settings"
    );


const musicVolume =
    document.querySelector(
        "#music-volume"
    );

const sfxVolume =
    document.querySelector(
        "#sfx-volume"
    );

const textSpeed =
    document.querySelector(
        "#text-speed"
    );


const musicVolumeValue =
    document.querySelector(
        "#music-volume-value"
    );

const sfxVolumeValue =
    document.querySelector(
        "#sfx-volume-value"
    );

const textSpeedValue =
    document.querySelector(
        "#text-speed-value"
    );


/* ==================================================
   文字速度名稱
   ================================================== */

const textSpeedLabels = {
    1: "很慢",
    2: "慢",
    3: "普通",
    4: "快",
    5: "很快"
};


/* ==================================================
   工具：等待
   ================================================== */

function wait(milliseconds) {

    return new Promise(
        (resolve) => {

            window.setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}

/* ==================================================
   音量設定工具
   ================================================== */

function getMusicVolumeScale() {

    return Number(
        musicVolume.value
    ) / 100;

}


function getSfxVolumeScale() {

    return Number(
        sfxVolume.value
    ) / 100;

}

/* ==================================================
   套用遊戲音量
   ================================================== */

function applyAudioVolumes() {

    const musicScale =
        getMusicVolumeScale();


    const sfxScale =
        getSfxVolumeScale();


    /* ==================================================
    BGM
    ================================================== */

    titleScreenBgm.volume =
        0.35 * musicScale;


    memorySpaceExplorationBgm.volume =
        0.35 * musicScale;


    memoryPuzzleBgm.volume =
        0.35 * musicScale;


    warmMemoryBgm.volume =
        0.45 * musicScale;


    sadMemoryBgm.volume =
        0.42 * musicScale;


    /* ==================================================
       SFX
       ================================================== */

    memoryBellRevealSound.volume =
        0.45 * sfxScale;


    deathMemorySounds.hairpinFall.volume =
        0.65 * sfxScale;


    deathMemorySounds.starBell.volume =
        0.75 * sfxScale;


    deathMemorySounds.boiling.volume =
        0.45 * sfxScale;


    deathMemoryKnifeSlashSound.volume =
        0.8 * sfxScale;

}


/* ==================================================
   播放標題畫面 BGM
   ================================================== */

function startTitleScreenBgm() {

    /*
     * 已經正在播放就不要重播。
     */

    if (!titleScreenBgm.paused) {
        return;
    }


    /*
     * 套用目前設定的音量。
     */

    titleScreenBgm.volume =
        0.35 * getMusicVolumeScale();


    titleScreenBgm
        .play()
        .catch(error => {

            console.warn(
                "標題 BGM 播放失敗：",
                error
            );

        });

}


/*
 * 提供 memory-puzzle.js 使用。
 */

window.startTitleScreenBgm =
    startTitleScreenBgm;


/* ==================================================
   播放標題畫面 BGM
   ================================================== */

function startTitleScreenBgm() {

    if (!titleScreenBgm.paused) {
        return;
    }


    titleScreenBgm.volume =
        0.35 * getMusicVolumeScale();


    titleScreenBgm
        .play()
        .catch(error => {

            console.warn(
                "標題 BGM 播放失敗：",
                error
            );

        });

}


/*
 * 提供其他 JS 呼叫。
 */

window.startTitleScreenBgm =
    startTitleScreenBgm;



/* ==================================================
   讀取設定
   ================================================== */

function loadSettings() {

    const savedSettings =
        localStorage.getItem(
            SETTINGS_STORAGE_KEY
        );


    if (!savedSettings) {

        applySettings(
            defaultSettings
        );

        return;
    }


    try {

        const parsedSettings =
            JSON.parse(
                savedSettings
            );

        const settings = {
            ...defaultSettings,
            ...parsedSettings
        };

        applySettings(
            settings
        );

    }
    catch (error) {

        console.error(
            "設定資料讀取失敗，已恢復預設設定。",
            error
        );

        applySettings(
            defaultSettings
        );

        saveSettings();

    }

}


/* ==================================================
   套用設定
   ================================================== */

function applySettings(settings) {

    musicVolume.value =
        settings.musicVolume;

    sfxVolume.value =
        settings.sfxVolume;

    textSpeed.value =
        settings.textSpeed;


    updateSettingValues();


    /*
     * 真正套用音量。
     */

    applyAudioVolumes();

}


/* ==================================================
   儲存設定
   ================================================== */

function saveSettings() {

    const settings = {

        musicVolume:
            Number(
                musicVolume.value
            ),

        sfxVolume:
            Number(
                sfxVolume.value
            ),

        textSpeed:
            Number(
                textSpeed.value
            )

    };


    localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(
            settings
        )
    );

}


/* ==================================================
   更新設定顯示
   ================================================== */

function updateSettingValues() {

    musicVolumeValue.textContent =
        musicVolume.value;

    sfxVolumeValue.textContent =
        sfxVolume.value;

    textSpeedValue.textContent =
        textSpeedLabels[
            textSpeed.value
        ];

}


/* ==================================================
   設定變更
   ================================================== */

function handleSettingChange() {

    updateSettingValues();


    /*
     * Slider 改變時，
     * 立即更新目前播放中的聲音。
     */

    applyAudioVolumes();


    saveSettings();

}


/* ==================================================
   開啟設定
   ================================================== */

function openSettings() {

    settingsModal.classList.remove(
        "hidden"
    );

}


/* ==================================================
   關閉設定
   ================================================== */

function closeSettings() {

    settingsModal.classList.add(
        "hidden"
    );

}


/* ==================================================
   開始新遊戲
   ================================================== */

async function startNewGame() {

    /*
     * 防止玩家在轉場期間連續點擊。
     */

    startGameButton.disabled = true;
    settingsButton.disabled = true;


    /*
     * 讓黑色轉場覆蓋標題畫面。
     */

    screenTransition.classList.add(
        "transition-active"
    );


    /*
    * 畫面淡黑的同時，
    * 標題 BGM 開始淡出。
    */

    const titleBgmFadePromise =
        fadeOutAudio(
            titleScreenBgm,
            1000
        );


    /*
     * 等待淡黑動畫完成。
     */

    await wait(1200);


    /*
     * 切換畫面。
     */

    titleScreen.classList.add(
        "hidden"
    );

    titleScreen.setAttribute(
        "aria-hidden",
        "true"
    );


    prologueScreen.classList.remove(
        "hidden"
    );

    prologueScreen.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
     * 啟動序章內容。
     *
     * 此函式位於：
     * js/prologue/prologue.js
     */

    startPrologue();


    /*
     * 黑色遮罩淡出。
     *
     * 因為序章本身也是黑色背景，
     * 玩家不會看到突兀的畫面切換。
     */

    screenTransition.classList.remove(
        "transition-active"
    );

}


/* ==================================================
   主選單事件
   ================================================== */

startGameButton.addEventListener(
    "click",
    startNewGame
);


settingsButton.addEventListener(
    "click",
    openSettings
);


/* ==================================================
   設定事件
   ================================================== */

closeSettingsButton.addEventListener(
    "click",
    closeSettings
);


settingsModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            settingsModal
        ) {

            closeSettings();

        }

    }
);


/*
 * ESC 關閉設定。
 */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
            &&
            !settingsModal
                .classList
                .contains("hidden")
        ) {

            closeSettings();

        }

    }
);


musicVolume.addEventListener(
    "input",
    handleSettingChange
);


sfxVolume.addEventListener(
    "input",
    handleSettingChange
);


textSpeed.addEventListener(
    "input",
    handleSettingChange
);


/* ==================================================
   遊戲初始化
   ================================================== */

function initializeGame() {

    loadSettings();

}

/* ==================================================
   第一次互動後播放標題 BGM
   ================================================== */

function handleFirstTitleInteraction() {

    startTitleScreenBgm();


    document.removeEventListener(
        "pointerdown",
        handleFirstTitleInteraction
    );


    document.removeEventListener(
        "keydown",
        handleFirstTitleInteraction
    );

}


document.addEventListener(
    "pointerdown",
    handleFirstTitleInteraction
);


document.addEventListener(
    "keydown",
    handleFirstTitleInteraction
);


/* ==================================================
   啟動
   ================================================== */

initializeGame();