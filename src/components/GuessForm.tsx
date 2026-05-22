import { useEffect, useMemo, useRef, useState } from "react";
import type { ModelCatalog } from "../lib/models";
import { makesFromCatalog } from "../lib/models";
import { FieldShell, inputStyle } from "./atoms";
import type { Guess } from "../types/game";

export type LockedFields = {
  make?: string;
  model?: string;
  year?: string;
};

const norm = (s: string) => (s || "").trim().toLowerCase();

function Combobox({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  emptyHint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  emptyHint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value || "");
  const [highlight, setHighlight] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

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
    if (!n) return options;
    return options.filter((o) => norm(o).includes(n));
  }, [q, options]);

  useEffect(() => {
    setHighlight(-1);
  }, [q, options]);

  useEffect(() => {
    if (highlight < 0) return;
    const el = itemRefs.current[highlight];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  function pick(o: string) {
    onChange(o);
    setQ(o);
    setOpen(false);
    setHighlight(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      if (matches.length === 0) return;
      setOpen(true);
      setHighlight((i) => (i < 0 ? 0 : Math.min(i + 1, matches.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      if (matches.length === 0) return;
      setHighlight((i) => (i <= 0 ? 0 : i - 1));
    } else if (e.key === "Enter") {
      if (open && highlight >= 0 && highlight < matches.length) {
        e.preventDefault();
        e.stopPropagation();
        pick(matches[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <FieldShell label={label}>
        <input
          value={q}
          disabled={disabled}
          onChange={(e) => {
            setQ(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
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
          {options.length === 0 && (
            <div
              style={{
                padding: "12px 14px",
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              {emptyHint ?? "No options"}
            </div>
          )}
          {options.length > 0 && matches.length === 0 && (
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
          {matches.map((o, i) => (
            <div
              key={o}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onClick={() => pick(o)}
              onMouseEnter={() => setHighlight(i)}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--line-soft)",
                background: i === highlight ? "var(--hover)" : "transparent",
              }}
            >
              <span>{o}</span>
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
  locked,
  models,
}: {
  multiplier: number;
  disabled: boolean;
  onSubmit: (g: Guess) => void;
  locked?: LockedFields;
  models: ModelCatalog;
}) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (locked?.make) setMake(locked.make);
  }, [locked?.make]);
  useEffect(() => {
    if (locked?.model) setModel(locked.model);
  }, [locked?.model]);
  useEffect(() => {
    if (locked?.year) setYear(locked.year);
  }, [locked?.year]);

  const makeLocked = Boolean(locked?.make);
  const modelLocked = Boolean(locked?.model);
  const yearLocked = Boolean(locked?.year);

  const makeOptions = useMemo(() => makesFromCatalog(models), [models]);
  const matchedMakeKey = useMemo(() => {
    const n = norm(make);
    return makeOptions.find((m) => norm(m) === n) ?? "";
  }, [make, makeOptions]);
  const modelOptions = useMemo(
    () => (matchedMakeKey ? (models[matchedMakeKey] ?? []) : []),
    [matchedMakeKey, models],
  );

  function handleMakeChange(v: string) {
    setMake(v);
    if (!modelLocked) {
      const next = matchedMakeKeyFor(v, makeOptions);
      const nextModels = next ? (models[next] ?? []) : [];
      if (model && !nextModels.some((m) => norm(m) === norm(model))) {
        setModel("");
      }
    }
  }

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
    if (!modelLocked) setModel("");
    if (!yearLocked) setYear("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") submit();
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
      onKeyDown={onKeyDown}
    >
      <Combobox
        label="Make"
        value={make}
        onChange={handleMakeChange}
        options={makeOptions}
        placeholder="Search brand…"
        disabled={disabled || makeLocked}
      />
      <Combobox
        label="Model"
        value={model}
        onChange={setModel}
        options={modelOptions}
        placeholder={matchedMakeKey ? "Search model…" : "Pick a make first"}
        disabled={disabled || modelLocked || !matchedMakeKey}
        emptyHint={
          matchedMakeKey ? "No models listed" : "Pick a make first"
        }
      />
      <FieldShell label="Year">
        <input
          value={year}
          disabled={disabled || yearLocked}
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

function matchedMakeKeyFor(v: string, options: string[]): string {
  const n = norm(v);
  return options.find((m) => norm(m) === n) ?? "";
}
