import openai from "@/services/openai";
import db from "@/services/db";

// GET 通常用於讓前端取得（撈）資料
export async function GET() {
    const vocabList = [] // 將 vocabList 變成串列

    // 取得 vocab-ai 集合的所有資料 透過時間戳記由大到小排（新 -> 舊）
    const querySnapshot = await db.collection('image-ai').orderBy('createdAt', 'desc').get();
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

export async function POST(req) {
    const body = await req.json();
    console.log("body:", body);
    // 透過dall-e-3模型讓AI產生圖片
    // 文件連結: https://platform.openai.com/docs/guides/images/usage
    const { userInput } = body

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: userInput,
        n: 1,
        size: "1024x1024",
    });
    // 取得AI模型畫的圖片網址
    const imageURL = response.data[0].url;
    console.log("imageURL:", imageURL)

    const image = {
        imageURL,
        prompt: userInput,
        createdAt: new Date().getTime()
    }
    console.log(image)

    await db.collection("image-ai").add(image)
    return Response.json(image);
}