// ✅ App.js (프리셋 저장/불러오기 + Bold 기능 포함)
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
const TITLE_POSITIONS = ['1','2','3','4','5','6','7','8','9','10'];
const EDGE_KR_VOICES = [
  { label: "SunHi (여성)", value: "ko-KR-SunHiNeural" },
  { label: "InJoon (남성)", value: "ko-KR-InJoonNeural" }
];

function App() {
  const [blocks, setBlocks] = useState([createBlock()]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [views, setViews] = useState("");
  const [titleSize, setTitleSize] = useState("40");
  const [titleColor, setTitleColor] = useState("white");
  const [titlePosition, setTitlePosition] = useState("1");
  const [background, setBackground] = useState(null);
  const [ttsEngine, setTtsEngine] = useState("gtts");
  const [edgeVoice, setEdgeVoice] = useState("ko-KR-SunHiNeural");
  const [exampleAudio, setExampleAudio] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  function createBlock() {
    return {
      id: uuidv4(), text: '', start: '0', duration: '2',
      position: '중', fontSize: '40', fontColor: 'white',
      bgColor: 'black', bold: 'false', image: null
    };
  }

  const handleBlockChange = (index, key, value) => {
    setBlocks(prev => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
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
    } catch {
      alert("미리듣기 실패");
    }
  };

  const savePreset = () => {
    const preset = {
      title, author, views, titleSize, titleColor, titlePosition,
      blocks
    };
    localStorage.setItem("shorts_preset", JSON.stringify(preset));
    alert("🎉 프리셋이 저장되었습니다!");
  };

  const loadPreset = () => {
    const saved = localStorage.getItem("shorts_preset");
    if (!saved) return alert("저장된 프리셋이 없습니다.");
    const preset = JSON.parse(saved);
    setTitle(preset.title || "");
    setAuthor(preset.author || "");
    setViews(preset.views || "");
    setTitleSize(preset.titleSize || "40");
    setTitleColor(preset.titleColor || "white");
    setTitlePosition(preset.titlePosition || "1");
    setBlocks(preset.blocks || [createBlock()]);
    alert("📂 프리셋이 불러와졌습니다!");
  };

  const handleSubmit = async () => {
    if (!background || blocks.some(b => !b.text)) {
      alert("배경 이미지 및 자막 내용을 모두 입력하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("background", background);
    formData.append("voiceEngine", ttsEngine);
    formData.append("edgeVoice", edgeVoice);
    formData.append("title", title);
    formData.append("author", author);
    formData.append("views", views);
    formData.append("titleSize", titleSize);
    formData.append("titleColor", titleColor);
    formData.append("titlePosition", titlePosition);

    blocks.forEach(b => {
      formData.append("texts", b.text);
      formData.append("starts", b.start);
      formData.append("durations", b.duration);
      formData.append("positions", b.position);
      formData.append("fontSizes", b.fontSize);
      formData.append("fontColors", b.fontColor);
      formData.append("bgColors", b.bgColor);
      formData.append("bolds", b.bold);
      if (b.image) formData.append("images", b.image);
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🎬 쇼츠메이커 고급버전</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <input className="p-2 border" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} />
        <input className="p-2 border" placeholder="작성자" value={author} onChange={e => setAuthor(e.target.value)} />
        <input className="p-2 border" placeholder="조회수" value={views} onChange={e => setViews(e.target.value)} />
        <select className="p-2 border" value={titleSize} onChange={e => setTitleSize(e.target.value)}>{FONT_SIZES.map(f => <option key={f} value={f}>{f}px</option>)}</select>
        <select className="p-2 border" value={titleColor} onChange={e => setTitleColor(e.target.value)}>{COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}</select>
        <select className="p-2 border" value={titlePosition} onChange={e => setTitlePosition(e.target.value)}>{TITLE_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}</select>
        <input type="file" accept="image/*" onChange={e => setBackground(e.target.files[0])} />
      </div>

      <div className="flex gap-4">
        <button onClick={savePreset} className="px-4 py-2 bg-green-100 rounded">💾 프리셋 저장</button>
        <button onClick={loadPreset} className="px-4 py-2 bg-blue-100 rounded">📂 프리셋 불러오기</button>
      </div>

      {blocks.map((b, i) => (
        <div key={b.id} className="border p-4 mb-6 bg-white rounded shadow">
          <div className="font-bold mb-2">줄 {i + 1}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <input className="p-2 border" placeholder="자막 텍스트" value={b.text} onChange={e => handleBlockChange(i, "text", e.target.value)} />
            <input className="p-2 border" placeholder="시작시간(초)" value={b.start} onChange={e => handleBlockChange(i, "start", e.target.value)} />
            <input className="p-2 border" placeholder="지속시간(초)" value={b.duration} onChange={e => handleBlockChange(i, "duration", e.target.value)} />
            <select className="p-2 border" value={b.position} onChange={e => handleBlockChange(i, "position", e.target.value)}>{POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}</select>
            <select className="p-2 border" value={b.fontSize} onChange={e => handleBlockChange(i, "fontSize", e.target.value)}>{FONT_SIZES.map(f => <option key={f} value={f}>{f}px</option>)}</select>
            <select className="p-2 border" value={b.fontColor} onChange={e => handleBlockChange(i, "fontColor", e.target.value)}>{COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}</select>
            <select className="p-2 border" value={b.bgColor} onChange={e => handleBlockChange(i, "bgColor", e.target.value)}>{COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}</select>
            <input type="file" accept="image/*" onChange={e => handleBlockChange(i, "image", e.target.files[0])} />
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
          <a href={resultUrl} download="shorts.mp4" className="text-blue-600 underline block mt-2">🎞 결과 영상 다운로드</a>
        </div>
      )}
    </div>
  );
}

export default App;