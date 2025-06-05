import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const COLOR_OPTIONS = [
  { name: '검정', value: 'black' }, { name: '하양', value: 'white' },
  { name: '빨강', value: 'red' }, { name: '노랑', value: 'yellow' },
  { name: '파랑', value: 'blue' }, { name: '초록', value: 'green' },
  { name: '회색', value: 'gray' }, { name: '투명', value: 'transparent' }
];
const POSITIONS = ['상', '중', '하'];
const FONT_SIZES = ['30', '40', '50', '60', '70'];
const EDGE_KR_VOICES = [
  { label: "SunHi (여성)", value: "ko-KR-SunHiNeural" },
  { label: "InJoon (남성)", value: "ko-KR-InJoonNeural" }
];

function App() {
  const [blocks, setBlocks] = useState([createBlock()]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [views, setViews] = useState("");
  const [image, setImage] = useState(null);
  const [ttsEngine, setTtsEngine] = useState("gtts");
  const [edgeVoice, setEdgeVoice] = useState("ko-KR-SunHiNeural");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [exampleAudio, setExampleAudio] = useState(null);

  function createBlock() {
    return {
      id: uuidv4(),
      text: '',
      start: '0',
      duration: '2',
      position: '중',
      fontSize: '40',
      fontColor: 'white',
      bgColor: 'black',
      bold: 'false'
    };
  }

  const handleBlockChange = (index, key, value) => {
    setBlocks(prev => {
      const copy = [...prev];
      copy[index][key] = value;
      return copy;
    });
  };

  const addBlock = () => {
    if (blocks.length >= 10) return;
    setBlocks(prev => [...prev, createBlock()]);
  };

  const handlePreviewTTS = async (text) => {
    try {
      const res = await axios.post("https://auto-shorts-32b7.onrender.com/preview-voice", {
        voiceEngine: ttsEngine,
        edgeVoice: edgeVoice,
        text
      }, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      setExampleAudio(url);
    } catch (err) {
      alert("미리듣기 실패");
    }
  };

  const handleSubmit = async () => {
    if (!image || blocks.some(b => !b.text)) {
      alert("이미지와 자막을 입력하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("voiceEngine", ttsEngine);
    formData.append("edgeVoice", edgeVoice);
    formData.append("title", title);
    formData.append("author", author);
    formData.append("views", views);
    formData.append("titleSize", "40");
    formData.append("titleColor", "white");
    formData.append("titlePosition", "1");

    blocks.forEach(b => {
      formData.append("texts", b.text);
      formData.append("starts", b.start);
      formData.append("durations", b.duration);
      formData.append("positions", b.position);
      formData.append("fontSizes", b.fontSize);
      formData.append("fontColors", b.fontColor);
      formData.append("bgColors", b.bgColor);
      formData.append("bolds", b.bold);
    });

    setLoading(true);
    try {
      const res = await axios.post("https://auto-shorts-32b7.onrender.com/generate", formData, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      alert("영상 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">🧠 AI 썰메이커 고급</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input className="p-2 border rounded" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} />
        <input className="p-2 border rounded" placeholder="작성자" value={author} onChange={e => setAuthor(e.target.value)} />
        <input className="p-2 border rounded" placeholder="조회수" value={views} onChange={e => setViews(e.target.value)} />
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
      </div>

      <div className="p-4 bg-gray-50 border rounded">
        <h2 className="font-semibold mb-2">🎙 음성 설정</h2>
        <select value={ttsEngine} onChange={e => setTtsEngine(e.target.value)} className="border p-2 mr-2">
          <option value="gtts">gTTS</option>
          <option value="edge">Edge TTS</option>
        </select>
        {ttsEngine === 'edge' && (
          <select value={edgeVoice} onChange={e => setEdgeVoice(e.target.value)} className="border p-2">
            {EDGE_KR_VOICES.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        )}
      </div>

      {blocks.map((b, i) => (
        <div key={b.id} className="border rounded p-4 mb-4 bg-white shadow">
          <div className="font-bold mb-2">🟪 줄 {i + 1}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <input className="p-2 border" placeholder="자막 텍스트" value={b.text} onChange={e => handleBlockChange(i, "text", e.target.value)} />
            <input className="p-2 border" placeholder="시작시간" value={b.start} onChange={e => handleBlockChange(i, "start", e.target.value)} />
            <input className="p-2 border" placeholder="지속시간" value={b.duration} onChange={e => handleBlockChange(i, "duration", e.target.value)} />
            <select className="p-2 border" value={b.position} onChange={e => handleBlockChange(i, "position", e.target.value)}>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="p-2 border" value={b.fontSize} onChange={e => handleBlockChange(i, "fontSize", e.target.value)}>
              {FONT_SIZES.map(f => <option key={f} value={f}>{f}px</option>)}
            </select>
            <select className="p-2 border" value={b.fontColor} onChange={e => handleBlockChange(i, "fontColor", e.target.value)}>
              {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
            </select>
            <select className="p-2 border" value={b.bgColor} onChange={e => handleBlockChange(i, "bgColor", e.target.value)}>
              {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
            </select>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={b.bold === "true"} onChange={e => handleBlockChange(i, "bold", e.target.checked ? "true" : "false")} />
              굵게
            </label>
            <button onClick={() => handlePreviewTTS(b.text)} className="px-3 py-1 bg-blue-100 text-sm text-blue-800 rounded">🔉 미리듣기</button>
          </div>
        </div>
      ))}

      <button onClick={addBlock} className="px-4 py-2 bg-gray-300 rounded">+ 줄 추가</button>

      <div className="flex gap-4 mt-6">
        <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? "🎥 생성 중..." : "🎬 영상 만들기"}
        </button>
      </div>

      {exampleAudio && (
        <div className="mt-4">
          <audio controls src={exampleAudio} className="w-full max-w-md" />
        </div>
      )}

      {resultUrl && (
        <div className="mt-6">
          <video src={resultUrl} controls className="w-full" />
          <a href={resultUrl} download="shorts.mp4" className="text-blue-600 underline block mt-2">🎞 결과 다운로드</a>
        </div>
      )}
    </div>
  );
}

export default App;