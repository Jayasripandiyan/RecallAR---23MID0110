/* ============================================================
   recognition.js — browser-only face + object recognition
   Uses face-api.js (faces) and coco-ssd (objects).
   No server. No Python. Runs entirely in the browser.
   ============================================================ */

const Recog = (() => {
  let faceModelsReady = false;
  let objectModel = null;
  let objectModelReady = false;

  const FACE_MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";

  /* ---------- Load models once ---------- */
  async function loadFaceModels() {
    if (faceModelsReady) return;
    if (typeof faceapi === "undefined") {
      throw new Error("face-api.js not loaded. Check your internet connection.");
    }
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODEL_URL),
    ]);
    faceModelsReady = true;
  }

  async function loadObjectModel() {
    if (objectModelReady) return;
    if (typeof cocoSsd === "undefined") {
      throw new Error("coco-ssd not loaded. Check your internet connection.");
    }
    objectModel = await cocoSsd.load({ base: "lite_mobilenet_v2" });
    objectModelReady = true;
  }

  async function loadAll() {
    await Promise.all([loadFaceModels(), loadObjectModel()]);
  }

  /* ---------- Face detection + embedding ---------- */
  async function detectFaces(videoEl) {
    if (!faceModelsReady) await loadFaceModels();
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
    const results = await faceapi
      .detectAllFaces(videoEl, options)
      .withFaceLandmarks()
      .withFaceDescriptors();
    return results.map((r) => ({
      box: [
        Math.round(r.detection.box.x),
        Math.round(r.detection.box.y),
        Math.round(r.detection.box.x + r.detection.box.width),
        Math.round(r.detection.box.y + r.detection.box.height),
      ],
      embedding: Array.from(r.descriptor),   // 128-dim
    }));
  }

  /* ---------- Object detection ---------- */
  async function detectObjects(videoEl) {
    if (!objectModelReady) await loadObjectModel();
    const predictions = await objectModel.detect(videoEl);
    return predictions
      .filter((p) => p.score >= 0.5)
      .filter((p) => p.class !== "person")   // people are handled by face module
      .map((p) => ({
        box: [
          Math.round(p.bbox[0]),
          Math.round(p.bbox[1]),
          Math.round(p.bbox[0] + p.bbox[2]),
          Math.round(p.bbox[1] + p.bbox[3]),
        ],
        label: p.class,
        score: p.score,
        embedding: null,   // no embedding for objects — we match by class name
      }));
  }

  /* ---------- Cosine similarity ---------- */
  function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
  }

  function findBestMatch(embedding, registry, threshold = 0.55) {
    let bestName = null;
    let bestScore = -1;
    for (const [name, data] of Object.entries(registry)) {
      const stored = data.embedding;
      if (!stored) continue;
      const score = cosine(embedding, stored);
      if (score > bestScore) {
        bestScore = score;
        bestName = name;
      }
    }
    if (bestScore >= threshold) return { name: bestName, score: bestScore };
    return { name: null, score: bestScore };
  }

  /* ---------- Camera ---------- */
  let stream = null;
  async function startCamera(videoEl) {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
      audio: false,
    });
    videoEl.srcObject = stream;
    await videoEl.play();
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  return {
    loadAll,
    detectFaces,
    detectObjects,
    findBestMatch,
    startCamera,
    stopCamera,
  };
})();