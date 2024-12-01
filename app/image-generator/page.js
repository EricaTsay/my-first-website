"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { faImage } from "@fortawesome/free-solid-svg-icons"
import CurrentFileIndicator from "@/components/CurrentFileIndicator";
import PageHeader from "@/components/PageHeader";
import GeneratorButton from "@/components/GenerateButton";
import ImageGenCard from "@/components/ImageGenCard"
import ImageGenPlaceholder from "@/components/ImageGenPlaceholder";


export default function ImgGen() {
    const [userInput, setUserInput] = useState("");
    // 是否在等待回應
    const [isWaiting, setIsWaiting] = useState(false);
    const [imageList, setImageList] = useState([]);

    // 第一次渲染時，取得資料應顯示在畫面上
    useEffect(() => {
        axios
            .get("/api/image-ai")
            .then(res => {
                setImageList(res.data)
            })
            .catch(err => {
                console.log("err", err)
            })
    }, [])

    function submitHandler(e) {
        e.preventDefault();
        console.log("User Input: ", userInput);
        const body = { userInput };
        console.log("body:", body);

        setUserInput("")
        setIsWaiting(true)

        // 將body POST到 /api/image-ai { userInput: "" }
        axios.post("/api/image-ai", body)
            .then(res => {
                console.log(res)
                const image = res.data
                setImageList([image, ...imageList])
                setIsWaiting(false)
            })
            .catch(err => {
                console.log("err", err)
                alert("繪圖失敗，請重新嘗試")
                setIsWaiting(false)
            })

    }

    return (
        <>
            <CurrentFileIndicator filePath="/app/image-generator/page.js" />
            <PageHeader title="AI Image Generator" icon={faImage} />
            <section>
                <div className="container mx-auto">
                    <form onSubmit={submitHandler}>
                        <div className="flex">
                            <div className="w-4/5 px-2">
                                <input
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    type="text"
                                    className="border-2 focus:border-pink-500 w-full block p-3 rounded-lg"
                                    placeholder="Enter a word or phrase"
                                    required
                                />
                            </div>
                            <div className="w-1/5 px-2">
                                <GeneratorButton />
                            </div>
                        </div>
                    </form>
                </div>
            </section>
            <section>
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    {/* 當正在等待後端回應時，顯示載入中動畫元件 */}
                    {isWaiting && <ImageGenPlaceholder />}

                    {
                        imageList.map(image => <ImageGenCard
                            imageURL={image.imageURL}
                            prompt={image.prompt}
                            key={image.createdAt}
                        />)
                    }
                </div>
            </section>
        </>
    )
}