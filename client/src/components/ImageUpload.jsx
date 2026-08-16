import { useRef, useState } from "react";

export default function ImageUpload({ onImageChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      onImageChange(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function clear() {
    setPreview(null);
    onImageChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div
        className="upload-drop"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <p style={{ margin: 0 }}>
          📷 Click or drag a photo of the lab report here
        </p>
        <p className="small-muted" style={{ margin: "0.25rem 0 0" }}>
          JPG, PNG, or HEIC — taken with your phone camera works fine
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {preview && (
        <div>
          <img src={preview} alt="Lab report preview" className="upload-preview" />
          <div className="btn-row" style={{ marginTop: "0.5rem" }}>
            <button type="button" className="btn btn-outline" onClick={clear}>
              Remove image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
