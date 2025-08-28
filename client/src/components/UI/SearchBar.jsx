import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLang } from "@/context/LangProvider";

const SearchBar = ({ wide=false }) => {
  const { t } = useLang();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');

  const onSubmit = (e) => {
    e.preventDefault();
    const term = (q || '').trim();
    if (!term) return;
    nav(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <form className={wide ? "w-full max-w-3xl" : "w-full max-w-md"} role="search" onSubmit={onSubmit}>
      <label className="input input-bordered flex items-center gap-2">
        <input className="grow" type="search" placeholder={t("search") || "Search..."} value={q} onChange={(e)=>setQ(e.target.value)} />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" d="m21 21-4.3-4.3M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
        </svg>
      </label>
    </form>
  );
}

export default SearchBar
