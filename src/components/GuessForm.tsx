import { useEffect, useMemo, useRef, useState } from "react";
import { BRANDS } from "../data/brands";
import { FieldShell, inputStyle } from "./atoms";
import type { Guess } from "../types/game";

const norm = (s: string) => (s || "").trim().toLowerCase();

function BrandCombobox({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value || "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQ(value || "");
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const matches = useMemo(() => {
    const n = norm(q);
    if (!n) return BRANDS;
    return BRANDS.filter((b) => norm(b).includes(n));
  }, [q]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <FieldShell label="Make">
        <input
          value={q}
          disabled={disabled}
          onChange={(e) => {
            setQ(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search brand…"
          style={inputStyle}
        />
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--muted)",
          }}
        >
          {open ? "▴" : "▾"}
        </span>
      </FieldShell>
      {open && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 20,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            maxHeight: 240,
            overflowY: "auto",
            boxShadow: "var(--shadow-pop)",
          }}
        >
          {matches.length === 0 && (
            <div
              style={{
                padding: "12px 14px",
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              No matches
            </div>
          )}
          {matches.map((b) => (
            <div
              key={b}
              onClick={() => {
                onChange(b);
                setQ(b);
                setOpen(false);
              }}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--line-soft)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span>{b}</span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  color: "var(--muted)",
                }}
              >
                ↵
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GuessForm({
  multiplier,
  disabled,
  onSubmit,
}: {
  multiplier: number;
  disabled: boolean;
  onSubmit: (g: Guess) => void;
}) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const canSubmit =
    !disabled &&
    make.trim().length > 0 &&
    model.trim().length > 0 &&
    /^\d{4}$/.test(year.trim());

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year.trim(), 10),
    });
    setModel("");
    setYear("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") submit();
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
      onKeyDown={onKeyDown}
    >
      <BrandCombobox value={make} onChange={setMake} disabled={disabled} />
      <FieldShell label="Model">
        <input
          value={model}
          disabled={disabled}
          onChange={(e) => setModel(e.target.value)}
          placeholder="e.g. M3, Civic, F-150"
          style={inputStyle}
        />
      </FieldShell>
      <FieldShell label="Year">
        <input
          value={year}
          disabled={disabled}
          onChange={(e) =>
            setYear(e.target.value.replace(/[^\d]/g, "").slice(0, 4))
          }
          placeholder="YYYY"
          inputMode="numeric"
          style={{
            ...inputStyle,
            fontFamily: "var(--mono)",
            letterSpacing: ".1em",
          }}
        />
        <span
          style={{
            fontFamily: "var(--ui)",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--muted)",
            letterSpacing: "-.005em",
          }}
        >
          ±2 yrs
        </span>
      </FieldShell>

      <button
        onClick={submit}
        disabled={!canSubmit}
        style={{
          marginTop: 10,
          padding: "17px 22px",
          borderRadius: 14,
          border: "none",
          cursor: canSubmit ? "pointer" : "not-allowed",
          background: canSubmit
            ? "linear-gradient(180deg, color-mix(in srgb, var(--accent) 88%, white 12%) 0%, var(--accent) 100%)"
            : "var(--chip)",
          color: canSubmit ? "#FFFFFF" : "var(--muted)",
          fontFamily: "var(--ui)",
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: "-.01em",
          boxShadow: canSubmit
            ? "0 1px 0 rgba(255,255,255,.35) inset, 0 -1px 0 rgba(0,0,0,.10) inset, 0 8px 18px -4px color-mix(in srgb, var(--accent) 50%, transparent), 0 2px 4px rgba(0,0,0,.08)"
            : "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "transform .15s, opacity .15s",
        }}
      >
        <span>{disabled ? "Game over" : "Submit guess"}</span>
        <span
          style={{
            fontFamily: "var(--ui)",
            fontSize: 14,
            fontWeight: 600,
            opacity: 0.75,
            fontVariantNumeric: "tabular-nums",
            padding: "3px 9px",
            borderRadius: 999,
            background: "rgba(255,255,255,.18)",
          }}
        >
          {disabled ? "—" : `×${multiplier}`}
        </span>
      </button>
    </div>
  );
}
