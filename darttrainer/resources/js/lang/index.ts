/**
 * Apvieno visus pa moduļiem sadalītos tulkojumu failus vienā ziņojumu kokā
 * katrai valodai. Katra faila augšējā līmeņa atslēgas ir savstarpēji unikālas
 * (auth/guest/seo/features/closing/tournamentBlock/reportsBlock/header/nav/...)
 */
import lvAuth from './lv/auth.json';
import lvCommon from './lv/common.json';
import lvCookies from './lv/cookies.json';
import lvDashboard from './lv/dashboard.json';
import lvGames from './lv/games.json';
import lvGuest from './lv/guest.json';
import lvHeader from './lv/header.json';
import lvIndex from './lv/index.json';
import lvLegal from './lv/legal.json';
import lvSettings from './lv/settings.json';

import enAuth from './en/auth.json';
import enCommon from './en/common.json';
import enCookies from './en/cookies.json';
import enDashboard from './en/dashboard.json';
import enGames from './en/games.json';
import enGuest from './en/guest.json';
import enHeader from './en/header.json';
import enIndex from './en/index.json';
import enLegal from './en/legal.json';
import enSettings from './en/settings.json';

export const messages = {
    lv: { ...lvCommon, ...lvAuth, ...lvGuest, ...lvDashboard, ...lvSettings, ...lvLegal, ...lvCookies, ...lvHeader, ...lvIndex, ...lvGames },
    en: { ...enCommon, ...enAuth, ...enGuest, ...enDashboard, ...enSettings, ...enLegal, ...enCookies, ...enHeader, ...enIndex, ...enGames },
};
