import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


export default async function (req, res) {
    const emojis = req.body.emojis;
    console.log(emojis);
    const prompt = `Use the following emojis to write a story:
    ${emojis}`;

    try {
        const completion = await openai.createCompletion("text-davinci-002", {
            prompt: prompt,
            temperature: .2,
            max_tokens: 200,
            // stream: true
        });
        res.status(200).json({ result: completion.data.choices[0].text });
    } catch (e) {
        console.log(e);
    }
}