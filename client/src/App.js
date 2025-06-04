
// ✅ App.jsx (Edge TTS 한국어 음성 3종 선택 포함, 전체 UI 완성)
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const COLOR_OPTIONS = [
  { name: '검정', value: 'black' }, { name: '빨강', value: 'red' },
  { name: '초록', value: 'green' }, { name: '파랑', value: 'blue' },
  { name: '노랑', value: 'yellow' }, { name: '하양', value: 'white' },
  { name: '회색', value: 'gray' }, { name: '주황', value: 'orange' },
  { name: '보라', value: 'purple' }, { name: '배경 없음', value: 'transparent' }
];
const FONT_SIZES = ['30', '40', '50', '60', '70'];
const EDGE_KR_VOICES = [
  { label: "SunHi (여성)", value: "ko-KR-SunHiNeural" },
  { label: "InJoon (남성)", value: "ko-KR-InJoonNeural" },
];

function App() {
  const [blocks, setBlocks] = useState([{
    id: uuidv4(), text: '', image: null, position: '5',
    bgColor: 'black', fontColor: 'white', fontSize: '40', bold: 'false',
    title: '', titlePosition: '1', titleColor: 'white',
    titleBgColor: 'black', titleSize: '40', titleBold: 'false'
  }]);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ttsEngine, setTtsEngine] = useState("gtts");
  const [edgeVoice, setEdgeVoice] = useState("ko-KR-SunHiNeural");
  const [exampleAudio, setExampleAudio] = useState(null);

  const handleBlockChange = (index, key, value) => {
    setBlocks(prev => {
      const copy = [...prev];
      copy[index][key] = value;
      return copy;
    });
  };

  const addBlock = () => {
    setBlocks(prev => [...prev, {
      id: uuidv4(), text: '', image: null, position: '5',
      bgColor: 'black', fontColor: 'white', fontSize: '40', bold: 'false',
      title: '', titlePosition: '1', titleColor: 'white',
      titleBgColor: 'black', titleSize: '40', titleBold: 'false'
    }]);
  };

  const handlePreview = async () => {
    try {
      const res = await axios.post("https://auto-shorts-32b7.onrender.com/preview-voice", {
        voiceEngine: ttsEngine,
        edgeVoice: edgeVoice
      }, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      setExampleAudio(url);
    } catch (err) {
      alert("미리듣기 실패");
    }
  };

  const handleSubmit = async () => {
    if (blocks.some(b => !b.text || !b.image)) {
      alert("모든 자막과 배경 이미지를 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("voiceEngine", ttsEngine);
    formData.append("edgeVoice", edgeVoice);
    blocks.forEach(b => {
      formData.append("texts", b.text);
      formData.append("images", b.image);
      formData.append("positions", b.position);
      formData.append("bgColors", b.bgColor);
      formData.append("fontColors", b.fontColor);
      formData.append("fontSizes", b.fontSize);
      formData.append("bolds", b.bold);
      formData.append("titles", b.title);
      formData.append("titlePositions", b.titlePosition);
      formData.append("titleColors", b.titleColor);
      formData.append("titleBgColors", b.titleBgColor);
      formData.append("titleSizes", b.titleSize);
      formData.append("titleBolds", b.titleBold);
    });

    setLoading(true);
    try {
      const res = await axios.post("https://auto-shorts-32b7.onrender.com/generate",", formData, { responseType: 'blob' });
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
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🎬 쇼츠 영상 생성기</h1>

      <div className="p-4 bg-gray-50 border rounded space-y-2">
        <h2 className="font-bold text-lg">🎙 TTS 음성 선택</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <select
            value={ttsEngine}
            onChange={e => setTtsEngine(e.target.value)}
            className="border p-2 rounded w-full sm:w-48"
          >
            <option value="gtts">gTTS (Google 기본)</option>
            <option value="edge">Edge TTS (자연스러움)</option>
          </select>

          {ttsEngine === 'edge' && (
            <select
              value={edgeVoice}
              onChange={e => setEdgeVoice(e.target.value)}
              className="border p-2 rounded w-full sm:w-64"
            >
              {EDGE_KR_VOICES.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          )}

          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            🔉 미리듣기
          </button>
        </div>
        {exampleAudio && (
          <div className="mt-2">
            <audio controls src={exampleAudio} className="w-full max-w-md" />
          </div>
        )}
      </div>

      {blocks.map((b, i) => (
        <div key={b.id} className="border p-4 rounded shadow bg-white mb-10">
          <h2 className="font-semibold text-lg mb-4">🎞 자막 #{i + 1}</h2>
          <div className="space-y-2">
            <label className="block font-medium">🖼️ 배경 이미지</label>
            <input type="file" accept="image/*" onChange={e => handleBlockChange(i, "image", e.target.files[0])} />

            <h3 className="font-semibold text-sm mt-4">📝 상단 제목 설정</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="flex flex-col text-xs"><label>상단 제목</label><input className="p-2 border" value={b.title} onChange={e => handleBlockChange(i, "title", e.target.value)} /></div>
              <div className="flex flex-col text-xs"><label>위치 (1~10)</label><input className="p-2 border" value={b.titlePosition} onChange={e => handleBlockChange(i, "titlePosition", e.target.value)} /></div>
              <div className="flex flex-col text-xs"><label>글자색</label><select className="p-2 border" value={b.titleColor} onChange={e => handleBlockChange(i, "titleColor", e.target.value)}>{COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}</select></div>
              <div className="flex flex-col text-xs"><label>배경색</label><select className="p-2 border" value={b.titleBgColor} onChange={e => handleBlockChange(i, "titleBgColor", e.target.value)}>{COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}</select></div>
              <div className="flex flex-col text-xs"><label>글자 크기</label><select className="p-2 border" value={b.titleSize} onChange={e => handleBlockChange(i, "titleSize", e.target.value)}>{FONT_SIZES.map(size => <option key={size} value={size}>{size}px</option>)}</select></div>
              <label className="flex items-center gap-2 mt-6 text-xs"><input type="checkbox" checked={b.titleBold === "true"} onChange={e => handleBlockChange(i, "titleBold", e.target.checked ? "true" : "false")} />제목 굵게</label>
            </div>

            <h3 className="font-semibold text-sm mt-6">🎯 자막 스타일 설정</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="flex flex-col text-xs"><label>자막 내용</label><input className="p-2 border" value={b.text} onChange={e => handleBlockChange(i, "text", e.target.value)} /></div>
              <div className="flex flex-col text-xs"><label>자막 위치</label><input className="p-2 border" value={b.position} onChange={e => handleBlockChange(i, "position", e.target.value)} /></div>
              <div className="flex flex-col text-xs"><label>글자색</label><select className="p-2 border" value={b.fontColor} onChange={e => handleBlockChange(i, "fontColor", e.target.value)}>{COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}</select></div>
              <div className="flex flex-col text-xs"><label>배경색</label><select className="p-2 border" value={b.bgColor} onChange={e => handleBlockChange(i, "bgColor", e.target.value)}>{COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}</select></div>
              <div className="flex flex-col text-xs"><label>글자 크기</label><select className="p-2 border" value={b.fontSize} onChange={e => handleBlockChange(i, "fontSize", e.target.value)}>{FONT_SIZES.map(size => <option key={size} value={size}>{size}px</option>)}</select></div>
              <label className="flex items-center gap-2 mt-6 text-xs"><input type="checkbox" checked={b.bold === "true"} onChange={e => handleBlockChange(i, "bold", e.target.checked ? "true" : "false")} />자막 굵게</label>
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-4">
        <button onClick={addBlock} className="bg-gray-200 px-4 py-2 rounded">+ 자막 줄 추가</button>
        <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? "🎥 생성 중..." : "🎬 영상 만들기"}</button>
      </div>

      {resultUrl && (
        <div className="mt-6">
          <h2 className="font-bold mb-2">✅ 결과 영상 다운로드</h2>
          <video src={resultUrl} controls className="w-full" />
          <a href={resultUrl} download="shorts.mp4" className="text-blue-500 underline block mt-2">shorts.mp4 다운로드</a>
        </div>
      )}
    </div>
  );
}

export default App;
