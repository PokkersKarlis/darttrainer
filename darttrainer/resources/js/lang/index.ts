/**
 * Apvieno visus pa moduļiem sadalītos tulkojumu failus vienā ziņojumu kokā
 * katrai valodai. Katra faila augšējā līmeņa atslēgas ir savstarpēji unikālas
 * (auth/guest/seo/features/closing/header/nav/usercard/menu/cards/panel/
 * stat/live/side/friend/mobile/lang/pwd), tāpēc plakans spread apvienojums
 * ir droši lietojams.
 */
import lvCommon from './lv/common.json';
import lvAuth from './lv/auth.json';
import lvGuest from './lv/guest.json';
import lvDashboard from './lv/dashboard.json';

import enCommon from './en/common.json';
import enAuth from './en/auth.json';
import enGuest from './en/guest.json';
import enDashboard from './en/dashboard.json';

export const messages = {
    lv: { ...lvCommon, ...lvAuth, ...lvGuest, ...lvDashboard },
    en: { ...enCommon, ...enAuth, ...enGuest, ...enDashboard },
};
