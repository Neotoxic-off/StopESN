// ==UserScript==
// @name         StopSN
// @namespace    https://linkedin.com
// @version      1.0
// @description  Stop ESN job offers on linkedin
// @author       Neotoxic
// @match        https://www.linkedin.com/jobs/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const ESN_LIST_URL = 'https://raw.githubusercontent.com/Neotoxic-off/StopESN/master/list.txt';

    function normalize(text) {
        return text?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
    }

    function getCompanyName(card) {
        const subtitle = card.querySelector('.artdeco-entity-lockup__subtitle span');
        if (!subtitle) return '';
        return normalize(subtitle.innerText || subtitle.textContent);
    }

    function removeESNCards(esnList) {
        const cards = document.querySelectorAll('[data-job-id]:not([data-esn-checked])');

        cards.forEach(card => {
            card.setAttribute('data-esn-checked', 'true');
            const companyName = getCompanyName(card);
            if (!companyName) return;

            const isESN = esnList.some(esn => companyName.includes(esn));
            if (isESN) {
                console.log(`[ESN Supprimée] ${companyName}`);
                card.remove();
            }
        });
    }

    function init(esnList) {
        removeESNCards(esnList);

        const observer = new MutationObserver(() => removeESNCards(esnList));
        observer.observe(document.body, { childList: true, subtree: true });

        setInterval(() => removeESNCards(esnList), 2000);
    }

    fetch(ESN_LIST_URL)
        .then(response => response.text())
        .then(text => {
            const esnList = text
                .split('\n')
                .map(line => normalize(line))
                .filter(line => line.length > 0);
            init(esnList);
        })
        .catch(err => console.error('Erreur de chargement de la liste ESN :', err));
})();
