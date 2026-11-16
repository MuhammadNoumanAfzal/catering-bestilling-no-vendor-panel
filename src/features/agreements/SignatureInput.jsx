import { ag, useAgreementLanguage } from "./agreementTranslations.js";
import { useRef, useState } from "react";
import { inputClass } from "./AgreementUi";
export default function SignatureInput({ onChange, disabled }) {
  useAgreementLanguage();
  const canvas = useRef(null),
    drawing = useRef(false),
    last = useRef(null);
  const [mode, setMode] = useState("TYPED");
  const [typed, setTyped] = useState("");
  function clear() {
    const c = canvas.current;
    if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
    setTyped("");
    onChange(null);
  }
  function point(e) {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * 600) / r.width,
      y: ((e.clientY - r.top) * 160) / r.height,
    };
  }
  function start(e) {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  }
  function move(e) {
    if (!drawing.current || disabled) return;
    const p = point(e),
      ctx = canvas.current.getContext("2d");
    ctx.strokeStyle = "#302923";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    onChange({ kind: "DRAWN", value: canvas.current.toDataURL("image/png") });
  }
  function end() {
    drawing.current = false;
    last.current = null;
  }
  return (
    <fieldset className="agreement-signature-input" disabled={disabled}>
      <legend className="text-sm font-medium">{ag("Signature")}</legend>
      <div className="signature-mode-tabs my-2 flex gap-3 text-xs">
        {["TYPED", "DRAWN"].map((k) => (
          <button
            type="button"
            key={k}
            aria-pressed={mode === k}
            onClick={() => {
              if (mode === k) return;
              clear();
              setMode(k);
            }}
            className={
              mode === k
                ? "font-bold text-[#bd6034] underline"
                : "text-[#857467]"
            }
          >
            {k === "TYPED" ? ag("Type signature") : ag("Draw signature")}
          </button>
        ))}
        <button type="button" onClick={clear} className="ml-auto underline">{ag("Clear")}</button>
      </div>
      {mode === "TYPED" ? (
        <>
        <p className="mb-2 text-sm text-[#514438]">{ag("No touch screen needed. Type your full name, or draw with a mouse, touchpad or finger.")}</p>
        <input
          aria-label={ag("Typed signature")}
          spellCheck={false}
          autoComplete="off"
          maxLength={160}
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            onChange(
              e.target.value.trim()
                ? { kind: "TYPED", value: e.target.value.trim() }
                : null,
            );
          }}
          className={inputClass}
          placeholder={ag("Type your full name")}
        />
        <div className="mt-3 rounded-xl border border-[#e8ddd3] bg-[#fffdf9] px-4 py-5" aria-label={ag("Signature preview")}>
          <p className="text-xs font-semibold text-[#6b5a4d]">{ag("Signature preview")}</p>
          <p className="mt-3 break-words text-3xl text-[#211d19]" style={{fontFamily: "Segoe Script, Brush Script MT, cursive", fontStyle: "italic"}}>{typed.trim() || ag("Your signature")}</p>
        </div>
        </>
      ) : (
        <>
          <canvas
            ref={canvas}
            width={600}
            height={160}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            className="h-28 w-full touch-none rounded-xl border border-[#dfd5cc] bg-white"
            aria-label={ag("Draw your signature. Use Type signature for keyboard entry.")}
          />
          <p className="mt-1 text-xs text-[#7d7066]">{ag("Use your mouse, touchpad or finger. You can also choose Type signature.")}</p>
        </>
      )}
    </fieldset>
  );
}
