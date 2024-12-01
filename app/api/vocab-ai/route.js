import openai from "@/services/openai";
import db from "@/services/db";

// GET 通常用於讓前端取得（撈）資料
export async function GET() {
    const vocabList = [] // 將 vocabList 變成串列

    // 取得 vocab-ai 集合的所有資料 透過時間戳記由大到小排（新 -> 舊）
    const querySnapshot = await db.collection('vocab-ai').orderBy('createdAt', 'desc').get();
    // console.log(querySnapshot)

    // 將快照內的文件取出
    querySnapshot.forEach(doc => {
        // doc.data() 才是當初存入的資料
        // 陣列.push(資料) 把資料加到陣列中
        vocabList.push(doc.data())
    });

    // 將 vocabList 傳給前端 -> res.data
    return Response.json(vocabList)
}

// POST 通常用於讓前端產生新資料
export async function POST(req) {
    const body = await req.json();
    console.log("body:", body);

    const { userInput, language } = body
    // 透過gpt-4o-mini模型讓AI回傳相關單字
    // 文件連結：https://platform.openai.com/docs/guides/text-generation/chat-completions-api?lang=node.js
    // JSON Mode: https://platform.openai.com/docs/guides/text-generation/json-mode?lang=node.js
    const systemPrompt = `
    請作為一個單字聯想AI根據所提供的單字聯想5個相關單字以及對應的中文意思
    例如：
    主題：水果
    語言：English
    回應JSON範例：
    { wordList: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
      zhWordList: ["蘋果", "香蕉", "櫻桃", "棗子", "接骨木"]
    }
    `;
    const propmpt = `
    主題： ${userInput}
    語言： ${language}
    `;

    const openAIReqBody = {
        messages: [
            { "role": "system", "content": systemPrompt },
            { "role": "user", "content": propmpt }
        ],
        model: "gpt-4o-mini",
        response_format: { "type": "json_object" }  // 開啟JSON模式
    };
    // 對接語言模型
    const completion = await openai.chat.completions.create(openAIReqBody);
    // 取得模型回應的內容
    const payload = completion.choices[0].message.content;
    console.log("payload:", payload);
    // 準備要回應給前端的資料
    const result = {
        title: userInput,
        payload: JSON.parse(payload),
        language,
        createdAt: new Date().getTime(),
    }

    //將result存入vocab-ai的集合中 使用隨機ID命名
    await db.collection("vocab-ai").add(result); //.add 隨機

    // 回應前端資料
    return Response.json(result);
}