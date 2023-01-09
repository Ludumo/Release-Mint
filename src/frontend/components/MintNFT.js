import { useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import { InputBox } from "./InputBox";
import { create } from 'ipfs-http-client';

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_API_KEY,
});
const openai = new OpenAIApi(configuration);
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
});

function App() {
  const [userPrompt, setUserPrompt] = useState("");
  const [number, setNumber] = useState(1);
  const [size, setSize] = useState("256x256");
  const [imageUrl, setImageUrl] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [imageHash, setImageHash] = useState(null);
  const [audioHash, setAudioHash] = useState(null);

  const handleAudioFileChange = (event) => {
    setAudioFile(event.target.files[0]);
  };

  const generateImage = async () => {
    const imageParameters = {
      prompt: userPrompt,
      n: parseInt(number),
      size: size,
    };
    const response = await openai.createImage(imageParameters);
    const urlData = response.data.data[0].url;
    setImageUrl(urlData);
  };

  const storeInIPFS = async (file) => {
    if (typeof file === 'object' && file instanceof File) {
      try {
        const fileBuffer = await file.arrayBuffer();
        const fileHash = await ipfs.add(fileBuffer);
        return fileHash[0].hash;
      } catch (error) {
        console.error(error);
        // you can also display the error to the user here
      }
    } else {
      console.error('file is not a File object');
    }
  };
  
  const handleUpload = async () => {
    try {
      if (imageUrl) {
        // fetch the image from the URL
        const response = await fetch(imageUrl);
        // convert the response to a Blob
        const blob = await response.blob();
        // create a File object from the Blob
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        setImageHash(await storeInIPFS(file));
      }
      if (audioFile) {
        setAudioHash(await storeInIPFS(audioFile));
      }
    } catch (error) {
      console.error(error);
      // you can also display the error to the user here
    }
  };
  

  return (
    <main className="App">
      {imageUrl && <img src={imageUrl} className="image" alt="ai thing" />}
      <InputBox label={"Description"} setAttribute={setUserPrompt} />
      <InputBox label={"Amount"} setAttribute={setNumber} />
      <InputBox label={"Size"} setAttribute={setSize} />
      <input type="file" accept="audio/*" onChange={handleAudioFileChange} />
      <button className="main-button" onClick={() => generateImage()}>
        Generate
      </button>
      <button className="main-button" onClick={() => handleUpload()}>
        Upload to IPFS
      </button>
    </main>
  );
}

export default App;
