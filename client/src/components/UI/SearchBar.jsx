import React from 'react'
import { useLang } from "@/context/LangProvider";

const SearchBar = ({ wide=false }) => {
  const { t } = useLang();
  return (
    <form className={wide ? "w-full max-w-3xl" : "w-full max-w-md"} role="search" onSubmit={(e)=>e.preventDefault()}>
      <label className="input input-bordered flex items-center gap-2">
        <input className="grow" type="search" placeholder={t("search") || "Search..."} />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" d="m21 21-4.3-4.3M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
        </svg>
      </label>
    </form>
  );
}

export default SearchBar
