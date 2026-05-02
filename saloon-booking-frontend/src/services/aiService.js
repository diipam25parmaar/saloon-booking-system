import axios from "axios";

export const sendToOpenAI = async (messages) => {
    const res = await axios.post("http://localhost:5001/chat", {
        messages
    });

    return res.data.message;
};