"use client";
import { useEffect, useState } from "react";
type Suggestion = { code: string; communes: string[] };
export function PostalAutocomplete({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [options, setOptions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    if (value.trim().length < 2) return () => controller.abort();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/codes-postaux?q=${encodeURIComponent(value)}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const result: Suggestion[] = await response.json();
        if (!controller.signal.aborted) { setOptions(result); setMessage(result.length ? "" : "Aucun code trouvé. Vérifiez votre saisie."); }
      } catch { if (!controller.signal.aborted) setMessage("Suggestions indisponibles. Vous pouvez saisir un code postal complet."); }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [value]);
  function select(option: Suggestion) { onChange(option.code); setOpen(false); setActive(-1); }
  return <div className="postal-autocomplete">
    <input id="postal" role="combobox" aria-label="Code postal (facultatif)" aria-autocomplete="list" aria-expanded={open && options.length > 0} aria-controls="postal-options" aria-activedescendant={open && active >= 0 && options[active] ? `postal-option-${active}` : undefined} aria-describedby="postal-help" autoComplete="off" maxLength={80} value={value} placeholder="Ex. 690 ou Lyon"
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      onChange={e => { onChange(e.target.value); setOptions([]); setMessage(""); setActive(-1); setOpen(true); }}
      onKeyDown={e => {
        if (e.key === "Escape") { setOpen(false); setActive(-1); }
        if ((e.key === "ArrowDown" || e.key === "ArrowUp") && options.length) { e.preventDefault(); setOpen(true); setActive(i => (i + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length); }
        if (e.key === "Enter" && open && active >= 0 && options[active]) { e.preventDefault(); select(options[active]); }
      }} />
    {open && options.length > 0 && <ul id="postal-options" role="listbox" aria-label="Codes postaux proposés">{options.map((option, i) => <li id={`postal-option-${i}`} role="option" aria-selected={active === i} key={option.code} onMouseDown={e => e.preventDefault()} onClick={() => select(option)}><strong>{option.code}</strong> · {option.communes.slice(0, 3).join(", ")}{option.communes.length > 3 ? "…" : ""}</li>)}</ul>}
    <small id="postal-help">Saisissez un code ou une commune, puis choisissez une proposition.</small>
    {open && message && <small role="status">{message}</small>}
  </div>;
}
