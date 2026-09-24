import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
    getAuthors,
    getDailyQuote,
    getQuoteCount,
    getRandomQuote,
    getSupportedLanguages,
    getTags,
    getQuotesByAuthor,
    searchQuotes,
} from "quotiva";
import type { Language, LanguageCode, Quote } from "quotiva";
import "./styles.css";

const languages = getSupportedLanguages();
const apiNames = ["getRandomQuote", "getDailyQuote", "getQuotes", "getQuotesByAuthor", "getQuotesByTag", "searchQuotes", "getAuthors", "getTags", "getSupportedLanguages", "getQuoteCount"];

function QuoteText({ quote, className = "" }: { quote?: Quote; className?: string }) {
    if (!quote) return <p className="empty-copy">No quote found for this selection.</p>;
    const language = languages.find((item) => item.code === quote.language);
    return (
        <div className={className} dir={language?.direction ?? "ltr"}>
            <p className="quote-text">“{quote.quote}”</p>
            <p className="quote-author">{quote.author}</p>
        </div>
    );
}

function TagList({ tags }: { tags: readonly string[] }) {
    return <div className="tag-list">{tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>;
}

function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard?.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };
    return <button className="copy-button" onClick={copy} type="button" aria-label="Copy code">{copied ? "Copied" : "Copy"}</button>;
}

function App() {
    const [language, setLanguage] = useState<LanguageCode>("en");
    const [tag, setTag] = useState<string | undefined>();
    const [quote, setQuote] = useState<Quote | undefined>(() => getRandomQuote({ language: "en" }));
    const [daily, setDaily] = useState<Quote | undefined>(() => getDailyQuote({ language: "en" }));
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<Quote[]>([]);
    const [author, setAuthor] = useState("");
    const [authorQuotes, setAuthorQuotes] = useState<Quote[]>([]);
    const [dark, setDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
    const currentLanguage = languages.find((item) => item.code === language) ?? languages[0];
    const tags = getTags({ language });
    const authors = getAuthors({ language });

    useEffect(() => {
        document.documentElement.dataset.theme = dark ? "dark" : "light";
    }, [dark]);

    useEffect(() => {
        setQuote(getRandomQuote({ language, tag }));
        setDaily(getDailyQuote({ language }));
        setSearch("");
        setResults([]);
        setAuthor("");
        setAuthorQuotes([]);
    }, [language, tag]);

    const nextQuote = () => setQuote(getRandomQuote({ language, tag }));
    const runSearch = () => setResults(search.trim() ? searchQuotes(search, { language }) : []);
    const chooseAuthor = (value: string) => {
        setAuthor(value);
        setAuthorQuotes(value ? getQuotesByAuthor(value, { language }) : []);
    };
    const direction = currentLanguage?.direction ?? "ltr";

    return (
        <div className="app-shell">
            <header className="site-header">
                <a className="wordmark" href="#top" aria-label="Quotiva home"><span className="wordmark-mark">Q</span>quotiva</a>
                <nav className="nav-links" aria-label="Main navigation"><a href="#explore">Explore</a><a href="#developers">Developers</a><a href="https://github.com/essasannat/quotiva" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a></nav>
                <div className="header-actions">
                    <label className="language-select"><span className="sr-only">Language</span><select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>{languages.map((item) => <option key={item.code} value={item.code}>{item.nativeName}</option>)}</select></label>
                    <button className="theme-toggle" type="button" onClick={() => setDark((value) => !value)} aria-label={`Switch to ${dark ? "light" : "dark"} theme`}><span>{dark ? "☼" : "◐"}</span></button>
                </div>
            </header>

            <main id="top">
                <section className="hero section-wrap">
                    <div className="hero-copy"><p className="eyebrow">A small library for big thoughts</p><h1>Words worth<br /><em>remembering.</em></h1><p className="hero-intro">A lightweight, multilingual collection of inspiration for JavaScript and TypeScript.</p><div className="badge-row"><span>TypeScript</span><span>Zero dependencies</span><span>Multilingual</span><span>RTL ready</span><span>ESM</span></div><div className="install-line"><code><b>$</b> npm install quotiva</code><CopyButton value="npm install quotiva" /></div></div>
                    <div className="hero-orbit" aria-hidden="true"><span className="orbit-ring ring-one" /><span className="orbit-ring ring-two" /><span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /><span className="orbit-word">q.</span><span className="orbit-caption">language<br />without limits</span></div>
                </section>

                <section className="feature-grid section-wrap" id="explore">
                    <div className="section-label"><span>01</span><span>THE DAILY PRACTICE</span></div>
                    <article className="quote-feature panel"><div className="panel-top"><span className="kicker">Random quote · {currentLanguage?.name}</span><span className="live-dot">Live from Quotiva</span></div><QuoteText quote={quote} className="main-quote" /><TagList tags={quote?.tags ?? []} /><button className="primary-button" type="button" onClick={nextQuote}>New quote <span>↗</span></button></article>
                    <article className="daily-feature panel"><div className="panel-top"><span className="kicker">Quote of the day</span><span className="date-stamp">UTC / {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span></div><QuoteText quote={daily} className="daily-quote" /><p className="subtle-note">Deterministic for the current UTC date.</p></article>
                </section>

                <section className="filter-section section-wrap"><div className="section-label"><span>02</span><span>FIND YOUR THREAD</span></div><div className="filter-heading"><h2>Follow a feeling.</h2><p>Filter the collection by language and discover the idea that meets you where you are.</p></div><div className="tag-filter" role="group" aria-label="Filter by tag"><button className={!tag ? "active" : ""} onClick={() => setTag(undefined)} type="button">All <small>{getQuoteCount({ language })}</small></button>{tags.map((item) => <button className={tag === item ? "active" : ""} onClick={() => setTag(item)} key={item} type="button">{item}</button>)}</div></section>

                <section className="split-section section-wrap"><article className="search-panel panel"><div className="section-label"><span>03</span><span>SEARCH THE COLLECTION</span></div><h2>Say what you mean.</h2><div className="search-box"><label htmlFor="quote-search" className="sr-only">Search quotes or authors</label><input id="quote-search" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && runSearch()} placeholder="Search quotes or authors..." /><button onClick={runSearch} type="button" aria-label="Search">↗</button></div><div className="result-list">{results.length ? results.map((item) => <div className="result-item" dir={languages.find((itemLanguage) => itemLanguage.code === item.language)?.direction}><p>“{item.quote}”</p><span>{item.author}</span><TagList tags={item.tags} /></div>) : <p className="empty-state">{search ? "No matching thoughts found." : "Search text, authors, or tags to begin."}</p>}</div></article><article className="author-panel panel"><div className="section-label"><span>04</span><span>AUTHOR EXPLORER</span></div><h2>In good company.</h2><label className="select-label" htmlFor="author-select">Browse authors</label><select id="author-select" value={author} onChange={(event) => chooseAuthor(event.target.value)}><option value="">Choose an author</option>{authors.map((item) => <option key={item} value={item}>{item}</option>)}</select><div className="result-list author-results">{authorQuotes.length ? authorQuotes.map((item) => <div className="result-item" key={item.quote}><p>“{item.quote}”</p><span>{item.author}</span></div>) : <p className="empty-state">Select a name to see their collection.</p>}</div></article></section>

                <section className="language-section section-wrap"><div className="section-label"><span>05</span><span>ONE LIBRARY, MANY VOICES</span></div><div className="language-heading"><h2>Meaning travels well.</h2><p>Same API. Different scripts. Every language carries its own direction metadata.</p></div><div className="language-cards">{languages.slice(0, 2).map((item) => { const sample = getRandomQuote({ language: item.code }); return <article className={`language-card ${item.direction}`} dir={item.direction} key={item.code}><div className="language-card-top"><span>{item.name}</span><span>{item.direction.toUpperCase()}</span></div><QuoteText quote={sample} /><div className="language-native">{item.nativeName}</div></article>; })}</div></section>

                <section className="developer-section section-wrap" id="developers"><div className="section-label"><span>06</span><span>BUILT FOR DEVELOPERS</span></div><div className="developer-heading"><h2>Simple to start.<br /><em>Easy to keep.</em></h2><p>Small, composable functions with strict TypeScript declarations and no runtime dependencies.</p></div><div className="code-grid"><div className="code-block"><div className="code-header"><span>random.ts</span><CopyButton value={'import { getRandomQuote } from "quotiva";\n\nconst quote = getRandomQuote({\n  language: "ar",\n  tag: "wisdom"\n});'} /></div><pre><code><span className="code-keyword">import</span> &#123; getRandomQuote &#125; <span className="code-keyword">from</span> <span className="code-string">"quotiva"</span>;

                    <span className="code-keyword">const</span> quote = getRandomQuote(&#123;
                    language: <span className="code-string">"ar"</span>,
                    tag: <span className="code-string">"wisdom"</span>
                    &#125;);</code></pre></div><div className="code-block"><div className="code-header"><span>today.ts</span><CopyButton value={'import { getDailyQuote } from "quotiva";\n\nconst quote = getDailyQuote({\n  language: "en"\n});'} /></div><pre><code><span className="code-keyword">import</span> &#123; getDailyQuote &#125; <span className="code-keyword">from</span> <span className="code-string">"quotiva"</span>;

                        <span className="code-keyword">const</span> quote = getDailyQuote(&#123;
                        language: <span className="code-string">"en"</span>
                        &#125;);</code></pre></div></div><div className="api-list"><span>PUBLIC API</span>{apiNames.map((name) => <code key={name}>{name}()</code>)}</div></section>

                <section className="stats-section section-wrap"><div className="section-label"><span>07</span><span>THE COLLECTION, AT A GLANCE</span></div><div className="stats-grid">{[[getQuoteCount({ language }), "Quotes"], [languages.length, "Languages"], [authors.length, "Authors"], [tags.length, "Tags"]].map(([value, label]) => <div className="stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>
            </main>
            <footer className="site-footer section-wrap"><a className="wordmark" href="#top"><span className="wordmark-mark">Q</span>quotiva</a><p>Words worth remembering.</p><span>Open source · MIT</span><a href="https://github.com/essasannat/quotiva" target="_blank" rel="noreferrer">GitHub ↗</a></footer>
        </div>
    );
}

export default App;

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);