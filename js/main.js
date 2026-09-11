"use strict";


/* ==================================================
   DOM
   ================================================== */

const settingsButton =
    document.querySelector("#open-settings");

const settingsModal =
    document.querySelector("#settings-modal");

const closeSettingsButton =
    document.querySelector("#close-settings");


const musicVolume =
    document.querySelector("#music-volume");

const sfxVolume =
    document.querySelector("#sfx-volume");

const textSpeed =
    document.querySelector("#text-speed");


const musicVolumeValue =
    document.querySelector("#music-volume-value");

const sfxVolumeValue =
    document.querySelector("#sfx-volume-value");

const textSpeedValue =
    document.querySelector("#text-speed-value");


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
   開啟設定
   ================================================== */

function openSettings() {

    settingsModal.classList.remove("hidden");

}


/* ==================================================
   關閉設定
   ================================================== */

function closeSettings() {

    settingsModal.classList.add("hidden");

}


/* ==================================================
   更新顯示數值
   ================================================== */

function updateSettingValues() {

    musicVolumeValue.textContent =
        musicVolume.value;

    sfxVolumeValue.textContent =
        sfxVolume.value;

    textSpeedValue.textContent =
        textSpeedLabels[textSpeed.value];

}


/* ==================================================
   事件
   ================================================== */

settingsButton.addEventListener(
    "click",
    openSettings
);


closeSettingsButton.addEventListener(
    "click",
    closeSettings
);


/*
 * 點擊設定視窗外部關閉。
 */

settingsModal.addEventListener(
    "click",
    (event) => {

        if (event.target === settingsModal) {
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
            !settingsModal.classList.contains("hidden")
        ) {
            closeSettings();
        }

    }
);


/*
 * 音樂音量。
 */

musicVolume.addEventListener(
    "input",
    updateSettingValues
);


/*
 * 音效音量。
 */

sfxVolume.addEventListener(
    "input",
    updateSettingValues
);


/*
 * 文字速度。
 */

textSpeed.addEventListener(
    "input",
    updateSettingValues
);


/* ==================================================
   初始化
   ================================================== */

updateSettingValues();