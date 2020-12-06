/*
 * Copyright (c) 2020 Martin Denham, Tuomas Airaksinen and the And Bible contributors.
 *
 * This file is part of And Bible (http://github.com/AndBible/and-bible).
 *
 * And Bible is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * And Bible is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with And Bible.
 * If not, see http://www.gnu.org/licenses/.
 */

export function getVerseInfo(props) {
    if(!props.verseOrdinal) return null;
    const [book, chapter, verse] = props.osisID.split(".")
    return {ordinal: parseInt(props.verseOrdinal), osisID: props.osisID, book, chapter: parseInt(chapter), verse: parseInt(verse)}
}

export function setFrom(...args) {
    const set = new Set();
    args.forEach(v => set.add(v))
    return set;
}

export function addAll(set, ...args) {
    for(const a of args) {
        set.add(a);
    }
}

export function mapFrom(arr, keyFn, valueFn) {
    const map = new Map();
    arr.forEach(v => map.set(keyFn(v), valueFn(v)));
    return map;
}

export function arrayLeq([v11, v12], [v21, v22]) {
    if(v11 < v21) return true
    if(v11 === v21) return v12 <= v22;
    return false;
}

export function arrayGeq([v11, v12], [v21, v22]) {
    if(v11 > v21) return true
    if(v11 === v21) return v12 >= v22;
    return false;
}

export function arrayLe([v11, v12], [v21, v22]) {
    if(v11 < v21) return true
    if(v11 === v21) return v12 < v22;
    return false;
}

export function arrayGe([v11, v12], [v21, v22]) {
    if(v11 > v21) return true
    if(v11 === v21) return v12 > v22;
    return false;
}

export function arrayEq([v11, v12], [v21, v22]) {
    return (v11 === v21) && (v12 === v22)
}

export function findElemWithOsisID(elem) {
    if(elem === null) return;
    // This needs to be done unique for each OsisFragment (as there can be many).
    if(elem.dataset && elem.dataset.osisID) {
        return elem;
    }
    else if (elem.parentElement) {
        return elem.parentElement.closest('.osis') //findElemWithOsisID(elem.parentElement);
        //return findElemWithOsisID(elem.parentElement);
    }
}

export function findNodeAtOffset(elem, startOffset) {
    let offset = startOffset;
    for(const c of elem.childNodes) {
        if(c.nodeType === 1) { // element
            const textLength = c.textContent.length;
            if(textLength >= offset) {
                return findNodeAtOffset(c, offset);
            } else {
                offset -= textLength;
            }
        } else if(c.nodeType === 3) { // text
            if(c.length >= offset) {
                return [c, offset];
            } else {
                offset -= c.length;
            }
        }
    }
}

function contentLength(elem) {
    return elem.innerText.length;
}

function hasOsisContent(element) {
    // something with content that should be counted in offset
    return element.classList.contains("osis")
}

export function findLegalPosition(node, offset) {
    let e = node;

    let offsetNow = offset;

    while (e.previousSibling !== null) {
        e = e.previousSibling
        if (e.nodeType === 3) {
            offsetNow += e.length;
        } else if (e.nodeType === 1) {
            offsetNow += contentLength(e);
        }
    }

    if(!hasOsisContent(e.parentElement)) {
        return findLegalPosition(e.parentElement, offsetNow-1);
    }

    const elementCount = parseInt(e.parentElement.dataset.elementCount)
    const ordinal = parseInt(e.parentElement.dataset.ordinal)
    return [ordinal, elementCount, offsetNow];
}

export function rangesOverlap(bookmarkRange, testRange, addRange = false) {
    let rs, re, bs, be;
    if(addRange) {
        rs = [testRange[0], 0];
        re = [testRange[1], 0];
        bs = [bookmarkRange[0], 0];
        be = [bookmarkRange[1], 0];
    } else {
        [rs, re] = testRange;
        [bs, be] = bookmarkRange;
    }

    // Same condition as in kotlin side BookmarksDao.bookmarksForVerseRange
    const ex1 = arrayLeq(rs, bs) && arrayLe(bs, re);
    const ex2 = arrayLe(rs, be) && arrayLeq(be, re);
    const ex3 = false; //arrayLe(bs, re) && arrayGe(rs, be);
    const ex4 = arrayLeq(bs, rs) && arrayLe(rs, be) && arrayLe(bs, re) && arrayLeq(re, be);

    return (ex1 || ex2 || ex3 || ex4)
}

