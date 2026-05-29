// ═══════════════════════════════════════════════════════════════
//  ΚΓΗ DUES TERMINAL — v7
//  Improvements over v6:
//  1. Auto-fetch balance on touch — no menu needed (single period)
//  2. Pay price set automatically the moment balance loads
//  3. Portal notification sent on payment (handled server-side)
//  4. Deadline warning shown if due within 7 days
//  5. Balance re-shown after partial payment with updated amount
// ═══════════════════════════════════════════════════════════════

string BASE_URL       = "https://kappagammaeta.org";
string WEBHOOK_SECRET = "KGE-DUES-2026";

// ── Visuals ───────────────────────────────────────────────────
vector GLOW_COLOR  = <0.486, 0.012, 0.137>;
float  GLOW_AMOUNT = 0.12;
vector TEXT_COLOR  = <1.0, 0.42, 0.667>;
float  BOB_RATE    = 0.08;
float  BOB_HEIGHT  = 0.18;

// ── Location sync ─────────────────────────────────────────────
float SYNC_INTERVAL = 300.0;

// ── Runtime state ─────────────────────────────────────────────
vector  gBasePos  = ZERO_VECTOR;
float   gBobAngle = 0.0;
integer gLastSync = 0;
key     gSyncReq  = NULL_KEY;

// ── Sessions [avatar, username, uuid, remaining, period] ──────
list    sessions   = [];
integer SES_STRIDE = 5;

integer sesFind(key av)   { return llListFindList(sessions, [av]); }
string  sesUser(key av)   { integer i=sesFind(av); if(i==-1)return""; return llList2String(sessions,i+1); }
integer sesRemain(key av) { integer i=sesFind(av); if(i==-1)return 0; return llList2Integer(sessions,i+3); }
string  sesPeriod(key av) { integer i=sesFind(av); if(i==-1)return""; return llList2String(sessions,i+4); }
sesClear(key av)          { integer i=sesFind(av); if(i!=-1) sessions=llDeleteSubList(sessions,i,i+SES_STRIDE-1); }
sesSet(key av, string u, string id, integer r, string p) {
    sesClear(av);
    sessions += [av, u, id, r, p];
}

// ── HTTP tracking [req_key, type, avatar, extra] ──────────────
list    reqs       = [];
integer REQ_STRIDE = 4;

reqAdd(key rk, string t, key av, string ex) { reqs += [rk, t, av, ex]; }
integer reqFind(key rk) { return llListFindList(reqs, [rk]); }
string  reqType(key rk) { integer i=reqFind(rk); if(i==-1)return""; return llList2String(reqs,i+1); }
key     reqAv(key rk)   { integer i=reqFind(rk); if(i==-1)return NULL_KEY; return llList2Key(reqs,i+2); }
string  reqEx(key rk)   { integer i=reqFind(rk); if(i==-1)return""; return llList2String(reqs,i+3); }
reqClear(key rk)        { integer i=reqFind(rk); if(i!=-1) reqs=llDeleteSubList(reqs,i,i+REQ_STRIDE-1); }

// ── Dialog tracking [avatar, username] ────────────────────────
list    dialogs    = [];
integer DLG_STRIDE = 2;

dlgSet(key av, string u) {
    integer i;
    for (i = 0; i < llGetListLength(dialogs); i += DLG_STRIDE)
        if (llList2Key(dialogs, i) == av) {
            dialogs = llListReplaceList(dialogs, [av, u], i, i+1);
            return;
        }
    dialogs += [av, u];
}
integer dlgFind(key av) {
    integer i;
    for (i = 0; i < llGetListLength(dialogs); i += DLG_STRIDE)
        if (llList2Key(dialogs, i) == av) return i;
    return -1;
}
string dlgUser(key av) {
    integer i = dlgFind(av);
    if (i == -1) return "";
    return llList2String(dialogs, i+1);
}
dlgClear(key av) {
    integer i = dlgFind(av);
    if (i != -1) dialogs = llDeleteSubList(dialogs, i, i+DLG_STRIDE-1);
}

// ── DS tracking [ds_key, avatar] ─────────────────────────────
list    dsReqs = [];
dsAdd(key dk, key av) { dsReqs += [dk, av]; }
integer dsFind(key dk) { return llListFindList(dsReqs, [dk]); }
key     dsAv(integer i) { return llList2Key(dsReqs, i+1); }
dsClear(integer i)      { dsReqs = llDeleteSubList(dsReqs, i, i+1); }

integer LISTEN_CH = -74829301;
integer listenH   = 0;

// ── Location sync ─────────────────────────────────────────────
syncLocation() {
    if (gSyncReq != NULL_KEY) return;
    vector pos    = gBasePos;
    string region = llGetRegionName();
    string parcel = llList2String(llGetParcelDetails(pos, [PARCEL_DETAILS_NAME]), 0);
    gSyncReq = llHTTPRequest(
        BASE_URL + "/api/dues/terminal-sync",
        [HTTP_METHOD, "POST", HTTP_MIMETYPE, "application/json", HTTP_BODY_MAXLENGTH, 16384],
        llList2Json(JSON_OBJECT, [
            "secret", WEBHOOK_SECRET, "region", region, "parcel", parcel,
            "x", (string)pos.x, "y", (string)pos.y, "z", (string)pos.z,
            "object_key", (string)llGetKey()
        ]));
    gLastSync = llGetUnixTime();
}

// ── Floating text ─────────────────────────────────────────────
setStatusText(string status) {
    vector pos = gBasePos;
    llSetText(
        "\n\n\n\n\n\n\n\n🌸 KGE Divine Crystal\n" + status + "\n" +
        llGetRegionName() + " (" + (string)llRound(pos.x) + ", " +
        (string)llRound(pos.y) + ", " + (string)llRound(pos.z) + ")",
        TEXT_COLOR, 1.0);
}

// ── Fetch balance (empty period = auto-select active period) ──
fetchBalance(key av, string username, string periodName) {
    string url = BASE_URL + "/api/dues/status?sl_username=" + llEscapeURL(username)
               + "&secret=" + llEscapeURL(WEBHOOK_SECRET);
    if (periodName != "")
        url += "&period=" + llEscapeURL(periodName);
    key rk = llHTTPRequest(url, [HTTP_METHOD, "GET"], "");
    reqAdd(rk, "balance", av, username);
}

// ── Build deadline warning string ────────────────────────────
string deadlineStr(integer daysLeft) {
    if (daysLeft < 0)  return "\n** DUES OVERDUE by " + (string)(-daysLeft) + " day(s)!";
    if (daysLeft == 0) return "\n** DUES DUE TODAY!";
    if (daysLeft <= 7) {
        string s = "s";
        if (daysLeft == 1) s = "";
        return "\n** Due in " + (string)daysLeft + " day" + s + " — don't miss it!";
    }
    return "";
}

// ════════════════════════════════════════════════════════════
default {

    state_entry() {
        gBasePos  = llGetPos();
        gBobAngle = 0.0;
        gLastSync = 0;
        gSyncReq  = NULL_KEY;
        llSetPrimitiveParams([
            PRIM_GLOW,        ALL_SIDES,  GLOW_AMOUNT,
            PRIM_POINT_LIGHT, TRUE,       GLOW_COLOR,  1.0, 5.0, 0.75
        ]);
        setStatusText("Initialising...");
        llRequestPermissions(llGetOwner(), PERMISSION_DEBIT);
        llSetPayPrice(PAY_DEFAULT, [PAY_DEFAULT, PAY_HIDE, PAY_HIDE, PAY_HIDE]);
        llSay(0, "KGE Divine Crystal Online. Touch to check your balance, Sister.");
        listenH = llListen(LISTEN_CH, "", NULL_KEY, "");
        syncLocation();
        llSetTimerEvent(BOB_RATE);
    }

    on_rez(integer param) { llResetScript(); }

    changed(integer change) {
        if (change & (CHANGED_REGION | CHANGED_REGION_START)) {
            gBasePos = llGetPos();
            llResetScript();
        }
    }

    run_time_permissions(integer perm) {
        if (perm & PERMISSION_DEBIT) {
            llOwnerSay("Debit permission granted.");
            setStatusText("Online");
        } else {
            llOwnerSay("WARNING: Debit permission denied. Refunds disabled.");
            setStatusText("No debit permission");
        }
    }

    touch_start(integer n) {
        key av = llDetectedKey(0);
        sesClear(av);
        dlgClear(av);
        // IMPROVEMENT 1 & 2: Resolve username then auto-fetch balance immediately
        llRegionSayTo(av, 0, "Welcome, Sister. Checking your dues...");
        key dk = llRequestAgentData(av, DATA_NAME);
        dsAdd(dk, av);
    }

    dataserver(key dk, string data) {
        integer i = dsFind(dk);
        if (i == -1) return;
        key av = dsAv(i);
        dsClear(i);

        // Parse SL username from DATA_NAME
        string username = llToLower(llList2String(llParseString2List(data, [" "], []), 0));
        dlgSet(av, username);

        // IMPROVEMENT 1: Auto-fetch immediately — no menu for single period
        fetchBalance(av, username, "");
    }

    listen(integer ch, string name, key av, string msg) {
        if (ch != LISTEN_CH) return;

        if (msg == "Cancel") {
            llRegionSayTo(av, 0, "Cancelled. Have a blessed day, Sister.");
            dlgClear(av);
            sesClear(av);
            llSetPayPrice(PAY_DEFAULT, [PAY_DEFAULT, PAY_HIDE, PAY_HIDE, PAY_HIDE]);
            return;
        }

        if (msg == "Close") {
            dlgClear(av);
            return;
        }

        if (msg == "Re-check") {
            string username = dlgUser(av);
            string period   = sesPeriod(av);
            dlgClear(av);
            if (username == "") {
                llRegionSayTo(av, 0, "Session expired. Please touch the terminal again.");
                return;
            }
            llRegionSayTo(av, 0, "Refreshing your balance...");
            fetchBalance(av, username, period);
            return;
        }

        // Sister picked a period from the period-select dialog
        string username = dlgUser(av);
        if (username != "") {
            dlgClear(av);
            llRegionSayTo(av, 0, "Fetching balance for " + msg + "...");
            fetchBalance(av, username, msg);
        }
    }

    http_response(key rk, integer status, list meta, string body) {

        // ── Location sync ─────────────────────────────────────
        if (rk == gSyncReq) {
            gSyncReq = NULL_KEY;
            if (status >= 200 && status < 300) setStatusText("Online");
            else setStatusText("Sync error");
            return;
        }

        string t  = reqType(rk);
        key    av = reqAv(rk);
        string ex = reqEx(rk); // username stored here
        reqClear(rk);

        if (av == NULL_KEY) return;

        // ── Balance response ──────────────────────────────────
        if (t == "balance") {
            if (status != 200) {
                llRegionSayTo(av, 0, "Could not fetch dues info. Try again later.");
                return;
            }

            string found = llJsonGetValue(body, ["found"]);
            if (found == "no") {
                llRegionSayTo(av, 0, "Sister not found in KGE records. Contact a Founder.");
                return;
            }

            string duesStatus = llJsonGetValue(body, ["status"]);

            // IMPROVEMENT 1: Multiple periods — show selection dialog
            if (duesStatus == "multiple_periods") {
                string periodsJson = llJsonGetValue(body, ["periods"]);
                list   periods     = llJson2List(periodsJson);
                integer cnt        = llGetListLength(periods);
                list buttons = [];
                integer p;
                for (p = 0; p < cnt && p < 9; p++)
                    buttons += [llList2String(periods, p)];
                buttons += ["Cancel"];
                dlgSet(av, ex);
                llDialog(av,
                    "\nKGE DIVINE CRYSTAL\n" +
                    "Select which period to pay:\n" +
                    "────────────────────────",
                    buttons, LISTEN_CH);
                return;
            }

            if (duesStatus == "no_period") {
                llRegionSayTo(av, 0, "No active dues period at this time. Check back soon.");
                return;
            }

            string  sorName   = llJsonGetValue(body, ["frat_name"]);
            string  period    = llJsonGetValue(body, ["period"]);
            integer amtDue    = (integer)llJsonGetValue(body, ["amount_due"]);
            integer totPaid   = (integer)llJsonGetValue(body, ["total_paid"]);
            integer remaining = (integer)llJsonGetValue(body, ["remaining"]);
            integer daysLeft  = (integer)llJsonGetValue(body, ["days_until_due"]);
            string  sep       = "────────────────────────";

            // IMPROVEMENT 4: Build deadline warning
            string warn = deadlineStr(daysLeft);

            if (duesStatus == "paid") {
                llRegionSayTo(av, 0,
                    "KGE DIVINE CRYSTAL — " + period + "\n" + sep +
                    "\nSister:       " + sorName +
                    "\nAmount Due:   L$" + (string)amtDue +
                    "\nPaid So Far:  L$" + (string)totPaid +
                    "\nStatus: PAID IN FULL\n" + sep +
                    "\nShe is strong like whiskey, but soft like wine.");
                llSetPayPrice(PAY_HIDE, [PAY_HIDE, PAY_HIDE, PAY_HIDE, PAY_HIDE]);
                return;
            }

            // IMPROVEMENT 2: Set pay price immediately
            sesSet(av, ex, (string)av, remaining, period);
            llSetPayPrice(PAY_DEFAULT, [remaining, PAY_HIDE, PAY_HIDE, PAY_HIDE]);

            llRegionSayTo(av, 0,
                "KGE DIVINE CRYSTAL — " + period + "\n" + sep +
                "\nSister:    " + sorName +
                "\nDue:       L$" + (string)amtDue +
                "\nPaid:      L$" + (string)totPaid +
                "\nRemaining: L$" + (string)remaining +
                warn + "\n" + sep +
                "\nPay button set to L$" + (string)remaining + "." +
                "\nOverpaying credits forward to your next period.");

            // Show compact dialog reminder with option to re-check
            dlgSet(av, ex);
            llDialog(av,
                "\nKGE DIVINE CRYSTAL — " + period +
                "\nRemaining: L$" + (string)remaining + warn +
                "\n\nClick PAY on the terminal to pay L$" + (string)remaining + ".\nOr re-check after paying.",
                ["Re-check", "Close"], LISTEN_CH);
            return;
        }

        // ── Payment response ──────────────────────────────────
        if (t == "payment") {
            if (status != 200) {
                llRegionSayTo(av, 0, "Payment recorded but confirmation failed. Contact a Founder.");
                return;
            }
            string  sorName   = llJsonGetValue(body, ["frat_name"]);
            string  period    = llJsonGetValue(body, ["period"]);
            string  newStatus = llJsonGetValue(body, ["new_status"]);
            integer paid      = (integer)llJsonGetValue(body, ["amount_paid"]);
            integer credit    = (integer)llJsonGetValue(body, ["credit"]);
            string  sep       = "────────────────────────";

            string msg = "Payment Recorded — " + period + "\n" + sep +
                         "\nSister:  " + sorName +
                         "\nPaid:    L$" + (string)paid;

            if (newStatus == "paid" && credit > 0)
                msg += "\nStatus:  PAID IN FULL\nCredit:  L$" + (string)credit + " forward to next period";
            else if (newStatus == "paid")
                msg += "\nStatus:  PAID IN FULL";
            else
                msg += "\nStatus:  Partial — keep going, Sister!";

            msg += "\n" + sep + "\nShe is strong like whiskey, but soft like wine.";
            llRegionSayTo(av, 0, msg);

            // IMPROVEMENT 5: Re-show updated balance after partial payment
            string username   = sesUser(av);
            string paidPeriod = sesPeriod(av);

            sesClear(av);
            llSetPayPrice(PAY_DEFAULT, [PAY_DEFAULT, PAY_HIDE, PAY_HIDE, PAY_HIDE]);

            if (newStatus != "paid" && username != "") {
                llRegionSayTo(av, 0, "Updating your balance...");
                fetchBalance(av, username, paidPeriod);
            }
        }
    }

    money(key payer, integer amount) {
        string username = sesUser(payer);
        string period   = sesPeriod(payer);

        if (username == "") {
            llGiveMoney(payer, amount);
            llRegionSayTo(payer, 0, "Please touch the terminal first to load your balance before paying.");
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
            ]));
        reqAdd(rk, "payment", payer, period);
    }

    // ── Timer: bob + location sync ────────────────────────────
    timer() {
        gBobAngle += 0.05;
        if (gBobAngle > TWO_PI) gBobAngle -= TWO_PI;
        llSetPos(gBasePos + <0.0, 0.0, llSin(gBobAngle) * BOB_HEIGHT>);
        if ((llGetUnixTime() - gLastSync) >= (integer)SYNC_INTERVAL)
            syncLocation();
    }
}
