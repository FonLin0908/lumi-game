"use strict";


// ============================================================
// 《拾光者露米》
// 序章 - 記憶碎片重組資料
// puzzle.js
// ============================================================


// ============================================================
// 碎片類型
//
// clue  ：探索階段取得的原始線索
// memory：由原始線索重組出的中間推論
// truth ：序章 Puzzle 最後需要得到的重要真相
// ============================================================

const PUZZLE_FRAGMENT_TYPES = {

    CLUE: "clue",

    MEMORY: "memory",

    TRUTH: "truth"

};


// ============================================================
// 所有記憶碎片
// ============================================================

const PROLOGUE_PUZZLE_FRAGMENTS = [

    // ========================================================
    // ★ 星形髮飾
    // ========================================================

    {
        id: "maoya-gift",

        type: "clue",

        name: "貓燁送的禮物",

        symbol: "♡",

        source: "star-hairpin"
    },


    {
        id: "star-hairpin-clue",

        type: "clue",

        name: "星形髮飾",

        symbol: "★",

        source: "star-hairpin"
    },


    {
        id: "hairpin-paw",

        type: "clue",

        name: "髮飾上的貓爪",

        symbol: "🐾",

        source: "star-hairpin"
    },


    // ========================================================
    // ☁ 染血羊毛
    // ========================================================

    {
        id: "wool",

        type: "clue",

        name: "羊毛",

        symbol: "☁",

        source: "bloody-wool"
    },


    {
        id: "blood",

        type: "clue",

        name: "血跡",

        symbol: "●",

        source: "bloody-wool"
    },


    // ========================================================
    // † 染血的刀
    // ========================================================

    {
        id: "knife-paw",

        type: "clue",

        name: "刀上的貓爪",

        symbol: "🐾",

        source: "knife"
    },


    // ========================================================
    // 🔔 破裂的引星鈴
    // ========================================================

    {
        id: "light-picker",

        type: "clue",

        name: "拾光者",

        symbol: "✦",

        source: "bell"
    },


    {
        id: "memory-stars",

        type: "clue",

        name: "回憶裡的星星",

        symbol: "★",

        source: "bell"
    },


    // ========================================================
    // 第一條推理線：貓燁與襲擊
    // ========================================================

    {
        id: "paw-related-maoya",

        type: "memory",

        name: "貓爪與貓燁有關",

        symbol: "🐾"
    },


    {
        id: "attacker-related-maoya",

        type: "memory",

        name: "襲擊者與貓燁有關",

        symbol: "?"
    },


    {
        id: "lumi-attacked",

        type: "memory",

        name: "露米遭到襲擊",

        symbol: "†"
    },


    {
        id: "maoya-attacked-lumi",

        type: "truth",

        name: "貓燁襲擊了露米",

        symbol: "†"
    },


    // ========================================================
    // 第二條推理線：拾光者身分
    // ========================================================

    {
        id: "stars-related-light-picker",

        type: "memory",

        name: "星星與拾光者有關",

        symbol: "✦"
    },


    {
        id: "maoya-knows-lumi-identity",

        type: "truth",

        name: "貓燁知道露米的特殊身分",

        symbol: "★"
    }

];


// ============================================================
// 記憶重組規則
//
// requires：需要投入的碎片
// result  ：成功後產生的新碎片
//
// 採消耗制。
// 成功重組後，requires 中的碎片會被消耗。
// ============================================================

const PROLOGUE_PUZZLE_RECIPES = [

    // ========================================================
    // 第一條推理線
    // 貓燁 → 貓爪 → 刀 → 襲擊
    // ========================================================


    // --------------------------------------------------------
    // ① 確認貓爪圖樣與貓燁有關
    //
    // 貓燁送給露米的髮飾
    // +
    // 髮飾上的貓爪
    //
    // ↓
    //
    // 貓爪與貓燁有關
    // --------------------------------------------------------

    {
        id: "recipe-paw-related-maoya",

        requires: [
            "maoya-gift",
            "hairpin-paw"
        ],

        result: "paw-related-maoya"
    },


    // --------------------------------------------------------
    // ② 將刀上的貓爪與貓燁建立關聯
    //
    // 貓爪與貓燁有關
    // +
    // 刀上的貓爪
    //
    // ↓
    //
    // 襲擊者與貓燁有關
    // --------------------------------------------------------

    {
        id: "recipe-attacker-related-maoya",

        requires: [
            "paw-related-maoya",
            "knife-paw"
        ],

        result: "attacker-related-maoya"
    },


    // --------------------------------------------------------
    // ③ 確認遭到襲擊的是露米
    //
    // 羊毛
    // +
    // 血跡
    //
    // ↓
    //
    // 露米遭到襲擊
    // --------------------------------------------------------

    {
        id: "recipe-lumi-attacked",

        requires: [
            "wool",
            "blood"
        ],

        result: "lumi-attacked"
    },


    // --------------------------------------------------------
    // ④ 確認襲擊露米的人與貓燁有關
    //
    // 襲擊者與貓燁有關
    // +
    // 露米遭到襲擊
    //
    // ↓
    //
    // 貓燁襲擊了露米
    // --------------------------------------------------------

    {
        id: "recipe-maoya-attacked-lumi",

        requires: [
            "attacker-related-maoya",
            "lumi-attacked"
        ],

        result: "maoya-attacked-lumi"
    },


    // ========================================================
    // 第二條推理線
    // 拾光者 → 星星 → 髮飾 → 貓燁知道身分
    // ========================================================


    // --------------------------------------------------------
    // ⑤ 星星與拾光者存在關聯
    //
    // 拾光者
    // +
    // 回憶裡的星星
    //
    // ↓
    //
    // 星星與拾光者有關
    //
    // 注意：
    // 星星並不是「拾光者的象徵」，
    // 這裡只建立兩者之間的關聯。
    // --------------------------------------------------------

    {
        id: "recipe-stars-related-light-picker",

        requires: [
            "light-picker",
            "memory-stars"
        ],

        result: "stars-related-light-picker"
    },


    // --------------------------------------------------------
    // ⑥ 貓燁知道露米的特殊身分
    //
    // 星星與拾光者有關
    // +
    // 貓燁送給露米的星形髮飾
    //
    // ↓
    //
    // 貓燁知道露米的特殊身分
    //
    // 「星形髮飾是貓燁送的」這件事，
    // 已由前面的髮飾回憶建立。
    // --------------------------------------------------------

    {
        id: "recipe-maoya-knows-lumi-identity",

        requires: [
            "stars-related-light-picker",
            "star-hairpin-clue"
        ],

        result: "maoya-knows-lumi-identity"
    }

];


// ============================================================
// 探索階段最終可取得的 8 個基礎碎片
//
// 目前先保留這個陣列，
// 讓現有 memory-puzzle.js 還能正常建立 Puzzle。
//
// 後續修改探索流程後，會改成依照玩家實際取得的線索加入。
// ============================================================

const PROLOGUE_INITIAL_PUZZLE_FRAGMENTS = [

    // 星形髮飾
    "maoya-gift",
    "star-hairpin-clue",
    "hairpin-paw",

    // 染血羊毛
    "wool",
    "blood",

    // 染血的刀
    "knife-paw",

    // 引星鈴
    "light-picker",
    "memory-stars"

];


// ============================================================
// Puzzle 完成所需的最終真相
//
// 不再使用：
// A + B → complete-memory
//
// 而是兩個真相都存在時，
// 視為第一次記憶重組完成。
// ============================================================

const PROLOGUE_PUZZLE_FINAL_TRUTHS = [

    "maoya-attacked-lumi",

    "maoya-knows-lumi-identity"

];


// ============================================================
// 輔助函式
// ============================================================


/**
 * 根據 ID 取得碎片資料。
 */
function getPuzzleFragment(
    id
) {

    return (
        PROLOGUE_PUZZLE_FRAGMENTS.find(
            fragment =>
                fragment.id === id
        )
        ??
        null
    );

}


/**
 * 判斷玩家目前放入重組區的碎片，
 * 是否剛好完整符合某個重組規則。
 *
 * 投入順序不影響判定。
 */
function findPuzzleRecipe(
    fragmentIds
) {

    const input =
        [...fragmentIds].sort();


    return (
        PROLOGUE_PUZZLE_RECIPES.find(
            recipe => {

                const required =
                    [...recipe.requires].sort();


                if (
                    input.length !==
                    required.length
                ) {

                    return false;

                }


                return input.every(
                    (id, index) =>
                        id ===
                        required[index]
                );

            }
        )
        ??
        null
    );

}


/**
 * 取得指定來源物件提供的所有原始線索。
 *
 * 例如：
 *
 * getPuzzleFragmentsBySource(
 *     "star-hairpin"
 * )
 *
 * 會取得：
 *
 * ・貓燁送的禮物
 * ・星形髮飾
 * ・髮飾上的貓爪
 */
function getPuzzleFragmentsBySource(
    source
) {

    return PROLOGUE_PUZZLE_FRAGMENTS.filter(
        fragment => {

            return (
                fragment.type ===
                    PUZZLE_FRAGMENT_TYPES.CLUE
                &&
                fragment.source ===
                    source
            );

        }
    );

}


// ============================================================
// Puzzle 組合狀態
// ============================================================

const PUZZLE_MATCH_STATES = {

    /*
     * 目前投入的碎片，
     * 是某個正確配方的一部分。
     */
    PARTIAL: "partial",


    /*
     * 目前投入的碎片，
     * 完整符合某個配方。
     */
    COMPLETE: "complete",


    /*
     * 目前投入的碎片，
     * 已經不可能形成任何配方。
     */
    INVALID: "invalid"

};


// ============================================================
// 判斷目前投入碎片的組合狀態
// ============================================================

function getPuzzleMatchState(
    fragmentIds
) {

    /*
     * 沒有投入任何碎片。
     *
     * 不視為錯誤。
     */

    if (
        !fragmentIds
        ||
        fragmentIds.length === 0
    ) {

        return {

            state:
                PUZZLE_MATCH_STATES.PARTIAL,

            recipe:
                null

        };

    }


    /*
     * 防止重複 ID。
     */

    const input =
        [
            ...new Set(
                fragmentIds
            )
        ];


    // ========================================================
    // COMPLETE
    // ========================================================

    const completeRecipe =
        findPuzzleRecipe(
            input
        );


    if (completeRecipe) {

        return {

            state:
                PUZZLE_MATCH_STATES.COMPLETE,

            recipe:
                completeRecipe

        };

    }


    // ========================================================
    // PARTIAL
    // ========================================================

    /*
     * 只要目前投入的所有碎片，
     * 同時存在於至少一個配方中，
     * 就代表這組碎片仍然可能完成。
     */

    const possibleRecipe =
        PROLOGUE_PUZZLE_RECIPES.find(
            recipe => {

                return input.every(
                    fragmentId => {

                        return recipe.requires.includes(
                            fragmentId
                        );

                    }
                );

            }
        );


    if (possibleRecipe) {

        return {

            state:
                PUZZLE_MATCH_STATES.PARTIAL,

            /*
             * 不提供 recipe，
             * 避免 UI 提前洩漏正確答案。
             */

            recipe:
                null

        };

    }


    // ========================================================
    // INVALID
    // ========================================================

    return {

        state:
            PUZZLE_MATCH_STATES.INVALID,

        recipe:
            null

    };

}


// ============================================================
// 判斷 Puzzle 是否已經完成
//
// memory-puzzle.js 下一階段會使用這個函式。
// ============================================================

function isProloguePuzzleComplete(
    fragmentIds
) {

    if (!fragmentIds) {
        return false;
    }


    const ownedFragments =
        new Set(
            fragmentIds
        );


    return PROLOGUE_PUZZLE_FINAL_TRUTHS.every(
        truthId =>
            ownedFragments.has(
                truthId
            )
    );

}