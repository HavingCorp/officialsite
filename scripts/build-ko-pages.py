#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build-ko-pages.py

Generates Korean static pages (index-ko.html, ingredients-ko.html, ...) from
the English source pages by baking lang/ko.json values into every data-i18n
element. This makes the Korean content crawlable, since search engines read
the served HTML and never trigger the JS language switch.

Mirrors the site's own i18n engine (js/common.js):
  - data-i18n       -> element text content
  - data-i18n-ph    -> placeholder attribute
  - data-i18n-html  -> element inner HTML

Also:
  - sets <html lang="ko"> and a havingLang=ko bootstrap so the switcher stays consistent
  - rewrites the SEO block canonical/og:url to the -ko URL
  - inserts hreflang alternate links (en <-> ko)
  - points internal nav/footer links at their -ko counterparts where a ko page exists

Standard approach: parse with lxml, edit the tree, serialize.
"""

import json
import os
import re
import sys
import lxml.html
from lxml import etree

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Pages to build Korean versions for (English source -> Korean output)
KO_PAGES = {
    "index.html": "index-ko.html",
    "ingredients.html": "ingredients-ko.html",
    "finished.html": "finished-ko.html",
    "about.html": "about-ko.html",
    "fragrance.html": "fragrance-ko.html",
    "inquiry.html": "inquiry-ko.html",
}

# Korean SEO copy (hand-written for Naver/Google Korean search, not machine translation)
KO_SEO = {
    "index-ko.html": {
        "title": "K-뷰티 무역 전문기업 · 해빙 주식회사",
        "description": "해빙은 한국 화장품 원료·향료·완제품과 OEM/ODM 역량을 전 세계 뷰티 파트너와 연결하는 무역 전문기업입니다.",
    },
    "ingredients-ko.html": {
        "title": "화장품 원료 소싱·수출 · 해빙 주식회사",
        "description": "기능성 화장품 원료와 바이오 액티브, 포뮬레이션용 소재를 글로벌 뷰티 개발에 연결합니다. 기능·제형·인증별로 원료를 확인하세요.",
    },
    "finished-ko.html": {
        "title": "완제품·브랜드 유통 · 해빙 주식회사",
        "description": "해외 유통이 가능한 한국 뷰티 브랜드와 완제품을 소개하고, 자체 라인을 준비하는 바이어를 위한 OEM/ODM을 지원합니다.",
    },
    "about-ko.html": {
        "title": "회사소개 · 해빙 주식회사",
        "description": "해빙 주식회사는 원료·향료·완제품 전반에서 소싱, 공급사 조율, 해외 시장 개척을 지원하는 뷰티 무역 파트너입니다.",
    },
    "fragrance-ko.html": {
        "title": "향료 솔루션 · 해빙 주식회사",
        "description": "글로벌 향료 전문성을 한국 브랜드·제조사와 연결합니다. 화장품, 퍼퓸, 홈 프래그런스, 향 마케팅을 아우릅니다.",
    },
    "inquiry-ko.html": {
        "title": "문의하기 · 해빙 주식회사",
        "description": "제품, 원료, OEM/ODM, 향료 관련 문의를 남겨 주세요. 해빙이 알맞은 한국 파트너를 연결해 드립니다.",
    },
}

ORIGIN = "https://having.co.kr"


def load_ko():
    with open(os.path.join(ROOT, "lang", "ko.json"), encoding="utf-8") as f:
        return json.load(f)


def bake_i18n(tree, ko):
    """Replace data-i18n / -ph / -html contents with Korean values."""
    stats = {"text": 0, "ph": 0, "html": 0, "missing": []}

    for el in tree.xpath('//*[@data-i18n]'):
        key = el.get('data-i18n')
        if key in ko:
            # clear children + set text (textContent semantics)
            for c in list(el):
                el.remove(c)
            el.text = ko[key]
            stats["text"] += 1
        else:
            stats["missing"].append(key)

    for el in tree.xpath('//*[@data-i18n-ph]'):
        key = el.get('data-i18n-ph')
        if key in ko:
            el.set('placeholder', ko[key])
            stats["ph"] += 1
        else:
            stats["missing"].append(key)

    for el in tree.xpath('//*[@data-i18n-html]'):
        key = el.get('data-i18n-html')
        if key in ko:
            # parse the HTML fragment and replace inner content
            for c in list(el):
                el.remove(c)
            frag = lxml.html.fragment_fromstring(ko[key], create_parent='span')
            el.text = frag.text
            for c in frag:
                el.append(c)
            stats["html"] += 1
        else:
            stats["missing"].append(key)

    return stats


def rewrite_links(tree, page_map):
    """Point internal links at their -ko counterparts where one exists."""
    n = 0
    for a in tree.xpath('//a[@href]'):
        href = a.get('href')
        base = href.split('#')[0].split('?')[0]
        if base in page_map:
            new = page_map[base]
            a.set('href', href.replace(base, new))
            n += 1
    return n


def set_lang_and_bootstrap(tree):
    html_el = tree if tree.tag == 'html' else tree.getroottree().getroot()
    html_el.set('lang', 'ko')
    html_el.set('data-lang', 'ko')
    # bootstrap cookie so the switcher shows KO immediately
    for s in tree.xpath('//head/script'):
        if s.text and 'havingLang' in s.text:
            # force default to ko when no cookie present on the -ko pages
            s.text = s.text.replace("m?m[1]:'en'", "m?m[1]:'ko'")
            break


def rewrite_seo_block(html_text, en_file, ko_file, seo):
    """Rewrite the managed SEO block: title/desc/canonical/og for the KO page, add hreflang."""
    ko_url = ORIGIN + "/" + ko_file
    en_url = ORIGIN + "/" + (en_file if en_file != "index.html" else "")
    if en_file == "index.html":
        ko_url = ORIGIN + "/index-ko.html"

    # title
    html_text = re.sub(r'<title>.*?</title>',
                       '<title>' + seo["title"] + '</title>', html_text, count=1)
    # description
    html_text = re.sub(r'(<meta name="description" content=")[^"]*(">)',
                       r'\g<1>' + seo["description"] + r'\g<2>', html_text, count=1)
    # canonical
    html_text = re.sub(r'(<link rel="canonical" href=")[^"]*(">)',
                       r'\g<1>' + ko_url + r'\g<2>', html_text, count=1)
    # og:url
    html_text = re.sub(r'(<meta property="og:url" content=")[^"]*(">)',
                       r'\g<1>' + ko_url + r'\g<2>', html_text, count=1)
    # og:title / twitter:title / og:description / twitter:description
    html_text = re.sub(r'(<meta property="og:title" content=")[^"]*(">)',
                       r'\g<1>' + seo["title"] + r'\g<2>', html_text, count=1)
    html_text = re.sub(r'(<meta name="twitter:title" content=")[^"]*(">)',
                       r'\g<1>' + seo["title"] + r'\g<2>', html_text, count=1)
    html_text = re.sub(r'(<meta property="og:description" content=")[^"]*(">)',
                       r'\g<1>' + seo["description"] + r'\g<2>', html_text, count=1)
    html_text = re.sub(r'(<meta name="twitter:description" content=")[^"]*(">)',
                       r'\g<1>' + seo["description"] + r'\g<2>', html_text, count=1)
    # og:locale en_US -> ko_KR
    html_text = re.sub(r'(<meta property="og:locale" content=")[^"]*(">)',
                       r'\g<1>ko_KR\g<2>', html_text, count=1)

    # hreflang alternates: insert before seo:end
    hreflang = (
        '  <link rel="alternate" hreflang="en" href="' + en_url + '">\n'
        '  <link rel="alternate" hreflang="ko" href="' + ko_url + '">\n'
        '  <link rel="alternate" hreflang="x-default" href="' + en_url + '">\n'
    )
    html_text = html_text.replace('  <!-- seo:end -->', hreflang + '  <!-- seo:end -->', 1)
    return html_text


def add_hreflang_to_en(html_text, en_file, ko_file):
    """Add reciprocal hreflang links to the English source page."""
    ko_url = ORIGIN + "/" + ko_file
    en_url = ORIGIN + "/" + (en_file if en_file != "index.html" else "")
    if 'hreflang="ko"' in html_text:
        # strip existing to stay idempotent
        html_text = re.sub(r'\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">', '', html_text)
    hreflang = (
        '  <link rel="alternate" hreflang="en" href="' + en_url + '">\n'
        '  <link rel="alternate" hreflang="ko" href="' + ko_url + '">\n'
        '  <link rel="alternate" hreflang="x-default" href="' + en_url + '">\n'
    )
    html_text = html_text.replace('  <!-- seo:end -->', hreflang + '  <!-- seo:end -->', 1)
    return html_text


def main():
    ko = load_ko()

    # map english filename -> ko filename for link rewriting
    page_map = dict(KO_PAGES)

    all_missing = {}
    for en_file, ko_file in KO_PAGES.items():
        src = os.path.join(ROOT, en_file)
        if not os.path.exists(src):
            print("  MISSING SOURCE:", en_file); continue

        raw = open(src, encoding="utf-8").read()

        # 1) rewrite SEO block on raw text (regex on the managed block)
        raw = rewrite_seo_block(raw, en_file, ko_file, KO_SEO[ko_file])

        # 2) parse and bake i18n
        tree = lxml.html.fromstring(raw)
        stats = bake_i18n(tree, ko)
        set_lang_and_bootstrap(tree)
        nlinks = rewrite_links(tree, page_map)

        out = lxml.html.tostring(tree, encoding="unicode", doctype="<!DOCTYPE html>")
        with open(os.path.join(ROOT, ko_file), "w", encoding="utf-8") as f:
            f.write(out)

        miss = sorted(set(stats["missing"]))
        if miss:
            all_missing[ko_file] = miss
        print(f"  {ko_file:26s} text {stats['text']:3d} / ph {stats['ph']:2d} / html {stats['html']:2d} / links {nlinks:3d} / missing {len(miss)}")

    # 3) add reciprocal hreflang to the English pages
    print("\n  reciprocal hreflang on EN pages:")
    for en_file, ko_file in KO_PAGES.items():
        src = os.path.join(ROOT, en_file)
        if not os.path.exists(src):
            continue
        raw = open(src, encoding="utf-8").read()
        raw = add_hreflang_to_en(raw, en_file, ko_file)
        open(src, "w", encoding="utf-8").write(raw)
        print(f"    {en_file}")

    if all_missing:
        print("\n  ⚠ Missing ko.json keys (kept English fallback):")
        for f, keys in all_missing.items():
            print(f"    {f}: {', '.join(keys[:8])}{' ...' if len(keys) > 8 else ''}")


if __name__ == "__main__":
    main()
