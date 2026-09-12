import sharp from "sharp";
import fs from "fs";
import path from "path";


const inputDir =
    "./assets/source/memories";

const outputDir =
    "./assets/images/memories";


/* ==================================================
   遞迴處理資料夾
   ================================================== */

async function processDirectory(
    currentInputDir,
    currentOutputDir
) {

    /*
     * 如果輸出資料夾不存在，
     * 自動建立。
     */

    fs.mkdirSync(
        currentOutputDir,
        {
            recursive: true
        }
    );


    /*
     * 讀取目前資料夾內容。
     */

    const entries =
        fs.readdirSync(
            currentInputDir,
            {
                withFileTypes: true
            }
        );


    for (const entry of entries) {

        const inputPath =
            path.join(
                currentInputDir,
                entry.name
            );


        /* ==================================================
           子資料夾
           ================================================== */

        if (entry.isDirectory()) {

            const nextOutputDir =
                path.join(
                    currentOutputDir,
                    entry.name
                );


            await processDirectory(
                inputPath,
                nextOutputDir
            );


            continue;

        }


        /* ==================================================
           只處理 PNG
           ================================================== */

        if (
            !entry.name
                .toLowerCase()
                .endsWith(".png")
        ) {

            continue;

        }


        /* ==================================================
           建立輸出檔名
           ================================================== */

        const outputName =
            path.parse(entry.name).name
            + ".webp";


        const outputPath =
            path.join(
                currentOutputDir,
                outputName
            );


        /* ==================================================
           Sharp 壓縮
           ================================================== */

        await sharp(inputPath)
            .resize({
                width: 1920,
                height: 1080,
                fit: "inside",
                withoutEnlargement: true
            })
            .webp({
                quality: 82
            })
            .toFile(outputPath);


        console.log(
            `完成：${inputPath} -> ${outputPath}`
        );

    }

}


/* ==================================================
   開始處理
   ================================================== */

await processDirectory(
    inputDir,
    outputDir
);


console.log(
    "所有記憶圖片壓縮完成。"
);