// ╔══════════════════════════════════════════════════════════════╗
//  ΚΓΗ  —  KGE DIVINE CRYSTAL
//  Dues payment object for the KGE sisterhood
//
//  Features:
//    · Glows, bobs, syncs location to portal every 5 min
//    · Touch auto-fetches balance — no menus for single period
//    · Pay button pre-set to exact remaining amount on touch
//    · Deadline warning if due within 7 days
//    · Balance refreshes automatically after partial payment
//    · Portal notification fired server-side on every payment
//    · Bobs from new position when moved
// ╚══════════════════════════════════════════════════════════════╝

// ── Configuration ─────────────────────────────────────────────
string  BASE_URL       = "https://kappagammaeta.org";
string  WEBHOOK_SECRET = "KGE-DUES-2026";
integer LISTEN_CH      = -74829301;
integer CHANGED_POSITION = 512;   // not available in all sim versions — define manually

// ── Visuals ───────────────────────────────────────────────────
vector GLOW_COLOR  = <0.486, 0.012, 0.137>;   // deep wine
float  GLOW_AMOUNT = 0.12;
vector TEXT_COLOR  = <1.0, 0.42, 0.667>;       // soft pink
float  BOB_RATE    = 0.08;                      // timer tick (s)
float  BOB_HEIGHT  = 0.18;                      // bob amplitude
float  BOB_SPEED   = 0.05;                      // angle step/tick
float  SYNC_EVERY  = 300.0;                     // location sync interval (s)

// ── Global state ──────────────────────────────────────────────
vector  gBasePos  = ZERO_VECTOR;
float   gBobAngle = 0.0;
integer gLastSync = 0;
key     gSyncReq  = NULL_KEY;
integer gListen   = 0;

// ══════════════════════════════════════════════════════════════
//  SESSION TABLE  [av, username, uuid, remaining, period]
//  Stores one active payment session per avatar
// ══════════════════════════════════════════════════════════════
list    gSessions  = [];
integer SES_STRIDE = 5;

integer _sesIdx(key av) { return llListFindList(gSessions, [av]); }

sesSet(key av, string user, string uuid, integer rem, string period) {
    integer i = _sesIdx(av);
    if (i != -1) gSessions = llDeleteSubList(gSessions, i, i + SES_STRIDE - 1);
    gSessions += [av, user, uuid, rem, period];
}
sesClear(key av) {
    integer i = _sesIdx(av);
    if (i != -1) gSessions = llDeleteSubList(gSessions, i, i + SES_STRIDE - 1);
}
string  sesUser(key av)   { integer i=_sesIdx(av); if(i<0)return""; return llList2String(gSessions,i+1); }
string  sesPeriod(key av) { integer i=_sesIdx(av); if(i<0)return""; return llList2String(gSessions,i+4); }

// ══════════════════════════════════════════════════════════════
//  HTTP REQUEST TABLE  [reqKey, type, avatar, extra]
//  Tracks in-flight HTTP calls
// ══════════════════════════════════════════════════════════════
list    gReqs      = [];
integer REQ_STRIDE = 4;

reqAdd(key rk, string t, key av, string ex) { gReqs += [rk, t, av, ex]; }
reqClear(key rk) {
    integer i = llListFindList(gReqs, [rk]);
    if (i != -1) gReqs = llDeleteSubList(gReqs, i, i + REQ_STRIDE - 1);
}
string reqType(key rk) { integer i=llListFindList(gReqs,[rk]); if(i<0)return""; return llList2String(gReqs,i+1); }
key    reqAv(key rk)   { integer i=llListFindList(gReqs,[rk]); if(i<0)return NULL_KEY; return llList2Key(gReqs,i+2); }
string reqEx(key rk)   { integer i=llListFindList(gReqs,[rk]); if(i<0)return""; return llList2String(gReqs,i+3); }

// ══════════════════════════════════════════════════════════════
//  DIALOG TABLE  [av, username]
//  Remembers which username goes with which open dialog
// ══════════════════════════════════════════════════════════════
list    gDialogs   = [];
integer DLG_STRIDE = 2;

dlgSet(key av, string user) {
    integer i;
    for (i = 0; i < llGetListLength(gDialogs); i += DLG_STRIDE)
        if (llList2Key(gDialogs, i) == av) {
            gDialogs = llListReplaceList(gDialogs, [av, user], i, i + 1);
            return;
        }
    gDialogs += [av, user];
}
dlgClear(key av) {
    integer i;
    for (i = 0; i < llGetListLength(gDialogs); i += DLG_STRIDE)
        if (llList2Key(gDialogs, i) == av) {
            gDialogs = llDeleteSubList(gDialogs, i, i + DLG_STRIDE - 1);
            return;
        }
}
string dlgUser(key av) {
    integer i;
    for (i = 0; i < llGetListLength(gDialogs); i += DLG_STRIDE)
        if (llList2Key(gDialogs, i) == av) return llList2String(gDialogs, i + 1);
    return "";
}

// ══════════════════════════════════════════════════════════════
//  DATASERVER TABLE  [dsKey, avatar]
//  Maps pending DATA_NAME requests to avatars
// ══════════════════════════════════════════════════════════════
list gDS = [];

dsAdd(key dk, key av)   { gDS += [dk, av]; }
dsClear(integer i)      { gDS = llDeleteSubList(gDS, i, i + 1); }
integer dsIdx(key dk)   { return llListFindList(gDS, [dk]); }
key     dsAv(integer i) { return llList2Key(gDS, i + 1); }

// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════

// Sync crystal location to portal (shown as teleport link)
syncLocation() {
    if (gSyncReq != NULL_KEY) return;
    vector pos    = gBasePos;
    string region = llGetRegionName();
    string parcel = llList2String(llGetParcelDetails(pos, [PARCEL_DETAILS_NAME]), 0);
    gSyncReq = llHTTPRequest(
        BASE_URL + "/api/dues/terminal-sync",
        [HTTP_METHOD, "POST", HTTP_MIMETYPE, "application/json", HTTP_BODY_MAXLENGTH, 16384],
        llList2Json(JSON_OBJECT, [
            "secret",     WEBHOOK_SECRET,
            "region",     region,
            "parcel",     parcel,
            "x",          (string)pos.x,
            "y",          (string)pos.y,
            "z",          (string)pos.z,
            "object_key", (string)llGetKey()
        ])
    );
    gLastSync = llGetUnixTime();
}

// Update floating hover text
setHoverText(string line) {
    llSetText(
        "\n\n\n\n\n\n\n\n" +
        "  * KGE Divine Crystal *  \n" +
        line + "\n" +
        llGetRegionName() +
        " (" + (string)llRound(gBasePos.x) +
        ", " + (string)llRound(gBasePos.y) +
        ", " + (string)llRound(gBasePos.z) + ")",
        TEXT_COLOR, 1.0
    );
}

// Fetch dues balance — leave period empty to auto-select
fetchBalance(key av, string username, string period) {
    string url = BASE_URL + "/api/dues/status"
               + "?sl_username=" + llEscapeURL(username)
               + "&secret="      + llEscapeURL(WEBHOOK_SECRET);
    if (period != "") url += "&period=" + llEscapeURL(period);
    key rk = llHTTPRequest(url, [HTTP_METHOD, "GET"], "");
    reqAdd(rk, "balance", av, username);
}

// Build a deadline warning line (empty if > 7 days away)
string deadlineWarning(integer days) {
    if (days < 0)  return "\n  !! OVERDUE by " + (string)(-days) + " day(s) !!";
    if (days == 0) return "\n  !! DUE TODAY !!";
    if (days <= 3) return "\n  !! Due in " + (string)days + " day(s) — urgent !!";
    if (days <= 7) return "\n  * Due in " + (string)days + " days";
    return "";
}

// ══════════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════════
default {

    // ── Startup ───────────────────────────────────────────────
    state_entry() {
        gBasePos  = llGetPos();
        gBobAngle = 0.0;
        gLastSync = 0;
        gSyncReq  = NULL_KEY;

        llSetPrimitiveParams([
            PRIM_GLOW,        ALL_SIDES, GLOW_AMOUNT,
            PRIM_POINT_LIGHT, TRUE, GLOW_COLOR, 1.0, 5.0, 0.75
        ]);

        setHoverText("Initialising...");
        llRequestPermissions(llGetOwner(), PERMISSION_DEBIT);
        llSetPayPrice(PAY_DEFAULT, [PAY_DEFAULT, PAY_HIDE, PAY_HIDE, PAY_HIDE]);

        gListen = llListen(LISTEN_CH, "", NULL_KEY, "");
        syncLocation();
        llSetTimerEvent(BOB_RATE);

        llSay(0, "* KGE Divine Crystal is online. Touch me to check your dues, Sister. *");
    }

    on_rez(integer param) { llResetScript(); }

    // ── Region change → full reset; position change → update bob base ─
    changed(integer change) {
        if (change & (CHANGED_REGION | CHANGED_REGION_START)) {
            gBasePos = llGetPos();
            llResetScript();
        }
    }

    // ── Debit permission ──────────────────────────────────────
    run_time_permissions(integer perm) {
        if (perm & PERMISSION_DEBIT) {
            llOwnerSay("Debit permission granted.");
            setHoverText("Online");
        } else {
            llOwnerSay("WARNING: Debit permission denied — refunds unavailable.");
            setHoverText("No debit permission");
        }
    }

    // ── Touch: resolve username then auto-fetch balance ───────
    touch_start(integer n) {
        key av = llDetectedKey(0);
        sesClear(av);
        dlgClear(av);
        llRegionSayTo(av, 0, "* KGE Divine Crystal * Checking your dues, Sister...");
        key dk = llRequestAgentData(av, DATA_NAME);
        dsAdd(dk, av);
    }

    // ── Username resolved → immediately fetch balance ─────────
    dataserver(key dk, string data) {
        integer i = dsIdx(dk);
        if (i < 0) return;
        key av = dsAv(i);
        dsClear(i);

        // DATA_NAME returns "username Resident" or "First Last" — take first word
        string username = llToLower(llList2String(llParseString2List(data, [" "], []), 0));
        dlgSet(av, username);
        fetchBalance(av, username, "");
    }

    // ── Dialog responses ──────────────────────────────────────
    listen(integer ch, string name, key av, string msg) {
        if (ch != LISTEN_CH) return;

        if (msg == "Cancel" || msg == "Close") {
            if (msg == "Cancel") {
                sesClear(av);
                llSetPayPrice(PAY_DEFAULT, [PAY_DEFAULT, PAY_HIDE, PAY_HIDE, PAY_HIDE]);
                llRegionSayTo(av, 0, "Have a blessed day, Sister. *");
            }
            dlgClear(av);
            return;
        }

        if (msg == "Re-check") {
            string user   = dlgUser(av);
            string period = sesPeriod(av);
            dlgClear(av);
            if (user == "") {
                llRegionSayTo(av, 0, "Session expired — please touch the Crystal again.");
                return;
            }
            llRegionSayTo(av, 0, "Refreshing your balance...");
            fetchBalance(av, user, period);
            return;
        }

        // Sister selected a period from the multi-period dialog
        string user = dlgUser(av);
        if (user != "") {
            dlgClear(av);
            llRegionSayTo(av, 0, "Fetching balance for " + msg + "...");
            fetchBalance(av, user, msg);
        }
    }

    // ── HTTP responses ────────────────────────────────────────
    http_response(key rk, integer status, list meta, string body) {

        // Location sync response
        if (rk == gSyncReq) {
            gSyncReq = NULL_KEY;
            if (status >= 200 && status < 300) setHoverText("Online");
            else setHoverText("Sync error");
            return;
        }

        string t  = reqType(rk);
        key    av = reqAv(rk);
        string ex = reqEx(rk);   // always the sl username
        reqClear(rk);
        if (av == NULL_KEY) return;

        // ── Balance ───────────────────────────────────────────
        if (t == "balance") {
            if (status != 200) {
                llRegionSayTo(av, 0, "Could not reach the portal right now. Try again later.");
                return;
            }

            string found = llJsonGetValue(body, ["found"]);
            if (found == "no") {
                llRegionSayTo(av, 0, "You are not found in KGE records. Please contact a Founder.");
                return;
            }

            string duesStatus = llJsonGetValue(body, ["status"]);

            // Multiple active periods — ask sister to pick one
            if (duesStatus == "multiple_periods") {
                list periods = llJson2List(llJsonGetValue(body, ["periods"]));
                integer cnt  = llGetListLength(periods);
                list buttons = [];
                integer p;
                for (p = 0; p < cnt && p < 9; p++)
                    buttons += [llList2String(periods, p)];
                buttons += ["Cancel"];
                dlgSet(av, ex);
                llDialog(av,
                    "\n * KGE Divine Crystal *\n" +
                    "Select the period you are paying:\n" +
                    "────────────────────────",
                    buttons, LISTEN_CH);
                return;
            }

            if (duesStatus == "no_period") {
                llRegionSayTo(av, 0, "There is no active dues period right now. Check back soon, Sister.");
                return;
            }

            // Parse balance fields
            string  name      = llJsonGetValue(body, ["frat_name"]);
            string  period    = llJsonGetValue(body, ["period"]);
            integer due       = (integer)llJsonGetValue(body, ["amount_due"]);
            integer paid      = (integer)llJsonGetValue(body, ["total_paid"]);
            integer remaining = (integer)llJsonGetValue(body, ["remaining"]);
            integer daysLeft  = (integer)llJsonGetValue(body, ["days_until_due"]);
            string  sep       = "────────────────────────";
            string  warn      = deadlineWarning(daysLeft);

            // Already paid in full
            if (duesStatus == "paid") {
                llRegionSayTo(av, 0,
                    "* KGE Divine Crystal — " + period + " *\n" + sep +
                    "\nSister:      " + name +
                    "\nAmount Due:  L$" + (string)due +
                    "\nTotal Paid:  L$" + (string)paid +
                    "\nStatus:      PAID IN FULL\n" + sep +
                    "\nShe is strong like whiskey, but soft like wine. *");
                llSetPayPrice(PAY_HIDE, [PAY_HIDE, PAY_HIDE, PAY_HIDE, PAY_HIDE]);
                return;
            }

            // Outstanding balance — set pay price immediately
            sesSet(av, ex, (string)av, remaining, period);
            llSetPayPrice(PAY_DEFAULT, [remaining, PAY_HIDE, PAY_HIDE, PAY_HIDE]);

            llRegionSayTo(av, 0,
                "* KGE Divine Crystal — " + period + " *\n" + sep +
                "\nSister:     " + name +
                "\nDue:        L$" + (string)due +
                "\nPaid:       L$" + (string)paid +
                "\nRemaining:  L$" + (string)remaining +
                warn + "\n" + sep +
                "\nThe pay button is set to L$" + (string)remaining + "." +
                "\nOverpayments carry forward as credit.");

            // Compact dialog with re-check option
            dlgSet(av, ex);
            llDialog(av,
                "\n* KGE Divine Crystal — " + period + " *" +
                "\n\nRemaining: L$" + (string)remaining + warn +
                "\n\nPress PAY on the Crystal to pay L$" + (string)remaining + "." +
                "\nTap Re-check after paying to confirm.",
                ["Re-check", "Close"], LISTEN_CH);
            return;
        }

        // ── Payment confirmed ─────────────────────────────────
        if (t == "payment") {
            if (status != 200) {
                llRegionSayTo(av, 0, "Payment processed but receipt failed. Contact a Founder if unsure.");
                return;
            }

            string  name      = llJsonGetValue(body, ["frat_name"]);
            string  period    = llJsonGetValue(body, ["period"]);
            string  newStatus = llJsonGetValue(body, ["new_status"]);
            integer amount    = (integer)llJsonGetValue(body, ["amount_paid"]);
            integer credit    = (integer)llJsonGetValue(body, ["credit"]);
            string  sep       = "────────────────────────";

            string receipt =
                "* Payment Received — " + period + " *\n" + sep +
                "\nSister:  " + name +
                "\nPaid:    L$" + (string)amount;

            if (newStatus == "paid" && credit > 0)
                receipt += "\nStatus:  PAID IN FULL\nCredit:  L$" + (string)credit + " carried to next period";
            else if (newStatus == "paid")
                receipt += "\nStatus:  PAID IN FULL";
            else
                receipt += "\nStatus:  Partial payment — keep going, Sister!";

            receipt += "\n" + sep + "\nShe is strong like whiskey, but soft like wine. *";
            llRegionSayTo(av, 0, receipt);

            // Save username/period before clearing session
            string username   = sesUser(av);
            string paidPeriod = sesPeriod(av);

            sesClear(av);
            llSetPayPrice(PAY_DEFAULT, [PAY_DEFAULT, PAY_HIDE, PAY_HIDE, PAY_HIDE]);

            // Auto-refresh balance if payment was partial
            if (newStatus != "paid" && username != "") {
                llRegionSayTo(av, 0, "Updating your balance...");
                fetchBalance(av, username, paidPeriod);
            }
        }
    }

    // ── Payment received ──────────────────────────────────────
    money(key payer, integer amount) {
        string username = sesUser(payer);
        string period   = sesPeriod(payer);

        if (username == "") {
            llGiveMoney(payer, amount);
            llRegionSayTo(payer, 0,
                "Please touch the Crystal first to load your balance before paying, Sister.");
            return;
        }

        llRegionSayTo(payer, 0, "Processing L$" + (string)amount + "...");

        key rk = llHTTPRequest(
            BASE_URL + "/api/dues/terminal-payment",
            [HTTP_METHOD, "POST", HTTP_MIMETYPE, "application/json"],
            llList2Json(JSON_OBJECT, [
                "sl_username", username,
                "sl_uuid",     (string)payer,
                "amount_ls",   amount,
                "secret",      WEBHOOK_SECRET,
                "period",      period
            ])
        );
        reqAdd(rk, "payment", payer, period);
    }

    // ── Timer: bob animation + periodic location sync ─────────
    timer() {
        // Detect if object was manually moved in edit mode
        // Compare actual position to where the bob math expects it to be
        vector expected = gBasePos + <0.0, 0.0, llSin(gBobAngle) * BOB_HEIGHT>;
        if (llVecDist(llGetPos(), expected) > 0.5) {
            gBasePos = llGetPos();
            syncLocation();
        }

        gBobAngle += BOB_SPEED;
        if (gBobAngle > TWO_PI) gBobAngle -= TWO_PI;
        llSetPos(gBasePos + <0.0, 0.0, llSin(gBobAngle) * BOB_HEIGHT>);

        if ((llGetUnixTime() - gLastSync) >= (integer)SYNC_EVERY)
            syncLocation();
    }
}
