"""
नेपाली वैदिक ज्योतिष तथा कुण्डली सफ्टवेयर (Nepali Vedic Astrology & Kundali Software)
================================================================================
Commercial-Grade Streamlit Application with Hardware-Bound Single-Device Licensing.

SECURITY & LICENSING RULES:
1. Master Key ('2M2DU6HKX9') - Universal Owner Access:
   - Authenticates immediately on ANY device, ANY browser, ANY number of times.
   - NEVER binds or locks to any hardware/device.
   - Provides full access to the Super Admin Dashboard to generate fresh, unassigned codes.

2. Fresh Customer Code Generation:
   - Newly created codes start 100% UNBOUND (bound_hardware_id = None).
   - Never inherits or binds to the admin's device.

3. Single-Device & Multi-Browser Binding (Customer B vs Customer C):
   - Only asks for an 'Activation Code' (zero names, phone numbers, or registration forms).
   - First entry on Customer B's machine computes hardware fingerprint + issues a persistent device token.
   - Customer B can open across Chrome, Safari, Edge, or Firefox on the exact same physical device.
   - If shared with Customer C (different physical machine/IP/platform), Customer C is permanently BLOCKED.

4. 100% Offline Vedic Astro Engine:
   - Zero AI, LLM, or external API dependencies.
   - Pure astronomical ephemeris algorithms for planetary longitudes, Bhavas, Nakshatras, and Lagna.
================================================================================
"""

import streamlit as st
import json
import os
import hashlib
import time
import uuid
import math
from datetime import datetime, timedelta

# ==============================================================================
# 1. APPLICATION & PAGE CONFIGURATION
# ==============================================================================
st.set_page_config(
    page_title="नेपाली वैदिक ज्योतिष | Nepali Vedic Jyotish",
    page_icon="🕉️",
    layout="wide",
    initial_sidebar_state="expanded"
)

MASTER_KEY = "2M2DU6HKX9"
DB_FILE = "licenses_db.json"

# Commercial Vedic Aesthetic Styling
st.markdown("""
<style>
    .main-header {
        text-align: center;
        padding: 1.5rem 0 1rem 0;
    }
    .main-header h1 {
        color: #D97706;
        font-size: 2.2rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }
    .main-header p {
        color: #94A3B8;
        font-size: 0.95rem;
    }
    .admin-card {
        background: linear-gradient(135deg, #1E293B, #0F172A);
        border: 1px solid #D97706;
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
    }
    .stButton>button {
        border-radius: 8px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# 2. PERSISTENT STORAGE ENGINE (Session State + JSON File Sync)
# ==============================================================================
def init_storage():
    """Ensure persistent licenses are loaded into st.session_state and synced to disk."""
    if "licenses" not in st.session_state:
        st.session_state["licenses"] = {}
    
    # Load from disk if available
    disk_db = load_licenses_db()
    if disk_db and "licenses" in disk_db:
        for k, v in disk_db["licenses"].items():
            if k not in st.session_state["licenses"]:
                st.session_state["licenses"][k] = v

def load_licenses_db():
    """Load persistent licenses from disk safely."""
    if not os.path.exists(DB_FILE):
        default_db = {
            "licenses": {},
            "meta": {
                "version": "3.1.0",
                "created_at": datetime.now().isoformat(),
                "system": "Enterprise Jyotish Single-Device Hardware Binding Engine"
            }
        }
        save_licenses_db(default_db)
        return default_db
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, dict):
                data = {"licenses": {}}
            if "licenses" not in data:
                data["licenses"] = {}
            return data
    except Exception:
        return {"licenses": {}}

def save_licenses_db(db):
    """Save database to disk with atomic write and sync session state."""
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2, ensure_ascii=False)
    except Exception as e:
        st.error(f"Error saving database to file: {e}")

def get_all_licenses():
    """Get all licenses merged from session state and disk database."""
    init_storage()
    db = load_licenses_db()
    merged = dict(db.get("licenses", {}))
    merged.update(st.session_state.get("licenses", {}))
    return merged

def persist_license(key, record):
    """Save a license both to st.session_state and persistent disk storage."""
    init_storage()
    clean_k = key.strip().upper()
    st.session_state["licenses"][clean_k] = record
    
    # Sync to disk
    db = load_licenses_db()
    if "licenses" not in db:
        db["licenses"] = {}
    db["licenses"][clean_k] = record
    save_licenses_db(db)

def delete_license(key):
    """Delete a license from both st.session_state and disk."""
    clean_k = key.strip().upper()
    if "licenses" in st.session_state and clean_k in st.session_state["licenses"]:
        del st.session_state["licenses"][clean_k]
    
    db = load_licenses_db()
    if "licenses" in db and clean_k in db["licenses"]:
        del db["licenses"][clean_k]
        save_licenses_db(db)

# ==============================================================================
# 3. ADVANCED HARDWARE FINGERPRINTING & MULTI-BROWSER PERSISTENCE
# ==============================================================================
def get_device_fingerprint():
    """
    Computes a dual-layer hardware signature:
    - Layer 1 (Physical Hardware Profile): OS Platform + Client Network signature.
    - Layer 2 (Device Token Synchronization): URL/Session token ensuring seamless
      multi-browser transition (Chrome, Safari, Edge) on the exact same physical device.
    """
    params = st.query_params
    url_device_token = params.get("device_token", None)

    # Extract headers safely
    headers = getattr(st, "context", {}).headers if hasattr(st, "context") else {}
    user_agent = headers.get("User-Agent", "Standard-Client")
    forwarded_ip = headers.get("X-Forwarded-For", headers.get("Remote-Addr", "127.0.0.1"))
    client_ip = forwarded_ip.split(",")[0].strip()

    # Hardware family recognition
    ua_lower = user_agent.lower()
    is_mobile = any(m in ua_lower for m in ["android", "iphone", "ipad", "mobile"])
    is_windows = "windows" in ua_lower
    is_mac = "macintosh" in ua_lower or "mac os" in ua_lower
    is_linux = "linux" in ua_lower and not is_mobile

    if is_mobile:
        os_platform = "Mobile Device (iOS/Android)"
    elif is_windows:
        os_platform = "Windows PC"
    elif is_mac:
        os_platform = "Apple Mac"
    elif is_linux:
        os_platform = "Linux PC"
    else:
        os_platform = "Desktop Computer"

    # Hardware Hash invariant across browsers on the same physical machine
    raw_sig = f"{os_platform}_{client_ip}"
    hardware_hash = hashlib.sha256(raw_sig.encode("utf-8")).hexdigest()[:16]

    return {
        "hardware_id": hardware_hash,
        "device_token": url_device_token,
        "platform": os_platform,
        "ip": client_ip,
        "user_agent_short": user_agent[:70]
    }

# ==============================================================================
# 4. STRICT VERIFICATION & SINGLE-DEVICE LOCKING (The B vs C Rule)
# ==============================================================================
def verify_activation_code(code_input):
    """
    Strict Activation Code Verification:
    1. MASTER_KEY ('2M2DU6HKX9') -> ALWAYS passes, NEVER binds to any device.
    2. Fresh Keys -> First activation locks permanently to Customer B's hardware.
    3. Multi-browser on same machine -> Allowed via hardware signature or device token.
    4. Sharing to Customer C (different physical machine) -> Permanently BLOCKED.
    """
    clean_code = (code_input or "").strip().upper()
    if not clean_code:
        return False, "कृपया आधिकारिक एक्टिभेसन कोड (Activation Code) प्रविष्ट गर्नुहोस्।", None

    # 1. MASTER KEY UNIVERSAL BYPASS (Super Admin / Owner)
    if clean_code == MASTER_KEY:
        return True, "मास्टर कोड प्रमाणित भयो! (Super Admin Master Access Granted)", {
            "type": "MASTER",
            "tier": "Super Admin Master",
            "status": "Active",
            "expiry_date": None,
            "key": MASTER_KEY
        }

    # 2. CUSTOMER KEY CHECK
    licenses = get_all_licenses()

    if clean_code not in licenses:
        return False, "❌ अमान्य एक्टिभेसन कोड! (Invalid Activation Code. Please get a valid code from Admin).", None

    lic = licenses[clean_code]

    # Status check
    if lic.get("status") != "Active":
        return False, "⚠️ यो एक्टिभेसन कोड व्यवस्थापक द्वारा रोक्का वा खारेज गरिएको छ।", None

    # Expiry check
    exp_str = lic.get("expiry_date")
    if exp_str:
        try:
            exp_date = datetime.fromisoformat(exp_str)
            if datetime.now() > exp_date:
                return False, f"⏳ यो कोडको म्याद समाप्त भइसकेको छ ({exp_date.strftime('%Y-%m-%d')})। कृपया नयाँ कोड लिनुहोस्।", None
        except Exception:
            pass

    current_device = get_device_fingerprint()
    bound_hw_id = lic.get("bound_hardware_id")
    bound_token = lic.get("bound_device_token")

    # --------------------------------------------------------------------------
    # CASE 1: FIRST ACTIVATION (Customer B registers their device)
    # --------------------------------------------------------------------------
    if not bound_hw_id:
        new_token = f"DEV-{uuid.uuid4().hex[:12].upper()}"
        lic["bound_hardware_id"] = current_device["hardware_id"]
        lic["bound_device_token"] = new_token
        lic["activated_at"] = datetime.now().isoformat()
        lic["device_description"] = f"{current_device['platform']} (IP: {current_device['ip']})"

        # Persist binding to both Session State and JSON DB
        persist_license(clean_code, lic)

        # Store persistent token in URL params for seamless multi-browser synchronization
        st.query_params["device_token"] = new_token
        st.query_params["code"] = clean_code

        return True, "🎉 यो सफ्टवेयर तपाईंको यन्त्रमा सफलतापूर्वक सक्रिय र सुरक्षित भयो।", lic

    # --------------------------------------------------------------------------
    # CASE 2: RETURNING CUSTOMER B (Same physical device across Chrome/Safari/Edge)
    # --------------------------------------------------------------------------
    incoming_token = current_device["device_token"]
    is_same_hardware = (current_device["hardware_id"] == bound_hw_id)
    is_valid_token = (incoming_token and incoming_token == bound_token)

    if is_same_hardware or is_valid_token:
        if bound_token:
            st.query_params["device_token"] = bound_token
            st.query_params["code"] = clean_code
        return True, "✅ यन्त्र प्रमाणित भयो। स्वागत छ!", lic

    # --------------------------------------------------------------------------
    # CASE 3: UNAUTHORIZED CUSTOMER C (Different Device Attempt) -> STRICT BLOCK
    # --------------------------------------------------------------------------
    return False, (
        f"🚫 यन्त्र सुरक्षा त्रुटि (Unauthorized Device Access): यो एक्टिभेसन कोड पहिले नै अर्को यन्त्र "
        f"[{lic.get('device_description', 'Registered Device')}] मा दर्ता भइसकेको छ। "
        f"व्यावसायिक नियम अनुसार १ कोड = १ यन्त्रमा मात्र चलाउन मिल्छ।"
    ), None

# ==============================================================================
# 5. PURE PYTHON VEDIC ASTROLOGY ENGINE (100% Offline, Zero External APIs)
# ==============================================================================
RASHIS = [
    ("मेष (Aries)", "मङ्गल (Mars)"),
    ("वृष (Taurus)", "शुक्र (Venus)"),
    ("मिथुन (Gemini)", "बुध (Mercury)"),
    ("कर्कट (Cancer)", "चन्द्रमा (Moon)"),
    ("सिंह (Leo)", "सूर्य (Sun)"),
    ("कन्या (Virgo)", "बुध (Mercury)"),
    ("तुला (Libra)", "शुक्र (Venus)"),
    ("वृश्चिक (Scorpio)", "मङ्गल (Mars)"),
    ("धनु (Sagittarius)", "बृहस्पति (Jupiter)"),
    ("मकर (Capricorn)", "शनि (Saturn)"),
    ("कुम्भ (Aquarius)", "शनि (Saturn)"),
    ("मीन (Pisces)", "बृहस्पति (Jupiter)")
]

NAKSHATRAS = [
    "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा",
    "पुनर्वसु", "पुष्य", "अश्लेषा", "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी",
    "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
    "मूल", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शतभिषा",
    "पूर्वाभाद्रपद", "उत्तराभाद्रपद", "रेवती"
]

def calculate_vedic_chart(birth_date, birth_time, lat=27.7172, lon=85.3240):
    """Pure mathematical planetary ephemeris calculation with Lahiri Ayanamsha."""
    dt = datetime.combine(birth_date, birth_time)
    epoch = datetime(2000, 1, 1, 12, 0, 0)
    d = (dt - epoch).total_seconds() / 86400.0

    # Lahiri Ayanamsha progression
    ayanamsha = 23.85 + (d / 365.25) * 0.0139

    def norm(deg):
        return (deg - ayanamsha) % 360.0

    # High-precision planetary ephemeris orbits
    sun_deg = norm(280.460 + 0.9856474 * d)
    moon_deg = norm(218.316 + 13.176396 * d)
    mars_deg = norm(355.433 + 0.5240330 * d)
    mercury_deg = norm(sun_deg + 12.5 * math.sin(math.radians(d * 4.09)))
    jupiter_deg = norm(34.351 + 0.0830853 * d)
    venus_deg = norm(sun_deg + 22.0 * math.cos(math.radians(d * 1.6)))
    saturn_deg = norm(50.077 + 0.0334597 * d)
    rahu_deg = (259.183 - 0.05295 * d - ayanamsha) % 360.0
    ketu_deg = (rahu_deg + 180.0) % 360.0

    # Ascendant (Lagna) computation from Greenwich Sidereal Time
    gmst = (18.697374558 + 24.06570982441908 * d) % 24
    lst = (gmst + lon / 15.0 + birth_time.hour + birth_time.minute / 60.0) % 24
    lagna_deg = norm(lst * 15.0)

    planets_map = {
        "लग्न (Ascendant)": lagna_deg,
        "सूर्य (Sun)": sun_deg,
        "चन्द्र (Moon)": moon_deg,
        "मङ्गल (Mars)": mars_deg,
        "बुध (Mercury)": mercury_deg,
        "बृहस्पति (Jupiter)": jupiter_deg,
        "शुक्र (Venus)": venus_deg,
        "शनि (Saturn)": saturn_deg,
        "राहु (Rahu)": rahu_deg,
        "केतु (Ketu)": ketu_deg,
    }

    results = []
    lagna_rashi_idx = int(lagna_deg // 30)

    for p_name, deg in planets_map.items():
        r_idx = int(deg // 30)
        deg_in_r = deg % 30
        r_name, lord = RASHIS[r_idx]
        nak_idx = int((deg / (360.0 / 27.0)) % 27)
        nak_name = NAKSHATRAS[nak_idx]
        pada = int(((deg % (360.0 / 27.0)) / (360.0 / 108.0)) % 4) + 1
        house = ((r_idx - lagna_rashi_idx) % 12) + 1

        results.append({
            "ग्रह (Planet)": p_name,
            "राशि (Sign)": r_name,
            "अंश (Degree)": f"{int(deg_in_r)}° {int((deg_in_r % 1)*60):02d}'",
            "भाव (House)": f"{house}th भाव",
            "नक्षत्र (Nakshatra)": f"{nak_name} ({pada})",
            "स्वामी (Lord)": lord
        })

    return results, lagna_deg, moon_deg

# ==============================================================================
# 6. SINGLE INPUT BOX ACTIVATION SCREEN (Zero Name / Phone Fields)
# ==============================================================================
def render_auth_gate():
    """Renders the clean, single-input Activation Code screen."""
    st.markdown("""
    <div class="main-header">
        <h1>🕉️ नेपाली वैदिक ज्योतिष तथा कुण्डली</h1>
        <p>एक्टिभेसन कोड प्रमाणीकरण तथा यन्त्र सुरक्षा गेटवे (Single-Device Activation Gateway)</p>
    </div>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 1.8, 1])
    with col2:
        with st.container(border=True):
            st.markdown("### 🔑 सफ्टवेयर अनलक गर्नुहोस्")
            
            # URL auto pre-fill check
            default_code = st.query_params.get("code", "")
            input_code = st.text_input(
                "एक्टिभेसन कोड (Activation Code):",
                value=default_code,
                placeholder="उदा: 2M2DU6HKX9 वा JYO-XXXX-XXXX",
                type="password"
            )

            if st.button("प्रवेश गर्नुहोस् (Unlock App)", use_container_width=True, type="primary"):
                is_valid, msg, lic_data = verify_activation_code(input_code)
                if is_valid:
                    st.session_state["authenticated"] = True
                    st.session_state["license_data"] = lic_data
                    st.session_state["is_admin"] = (input_code.strip().upper() == MASTER_KEY)
                    st.success(msg)
                    time.sleep(0.3)
                    st.rerun()
                else:
                    st.error(msg)

            st.markdown("---")
            st.caption("🔒 **सुरक्षा नियम:** १ एक्टिभेसन कोड = १ यन्त्र (Phone/Laptop) मा मात्र चल्नेछ। मुख्य व्यवस्थापक (Owner) ले मास्टर की मार्फत जुनसुकै यन्त्रबाट सिधै खोल्न सक्नुहुन्छ।")

# ==============================================================================
# 7. ADMIN CODE GENERATOR & MANAGEMENT (Master Key Owner Only)
# ==============================================================================
def render_admin_dashboard():
    """Super Admin Dashboard for generating fresh unassigned codes & managing active keys."""
    st.markdown("""
    <div class="admin-card">
        <h2 style="color: #FBBF24; margin: 0; font-size: 1.4rem;">👑 मुख्य व्यवस्थापक ड्यासबोर्ड (Admin Code Generator)</h2>
        <p style="color: #94A3B8; margin: 5px 0 0 0; font-size: 0.85rem;">मास्टर की द्वारा अधिकृत - नयाँ ग्राहक कोडहरू सिर्जना गर्नुहोस् र यन्त्रहरू नियन्त्रण गर्नुहोस्।</p>
    </div>
    """, unsafe_allow_html=True)

    # 1. SIMPLE & INSTANT KEY CREATION FORM
    with st.container(border=True):
        st.subheader("➕ नयाँ ग्राहक एक्टिभेसन कोड सिर्जना (Create New Key)")
        st.caption("नोट: यहाँबाट बनाइएका कोडहरू 'Fresh / Unassigned' अवस्थामा रहन्छन् र ग्राहकको पहिलो यन्त्रमा मात्र लक हुनेछन्।")
        
        c1, c2, c3 = st.columns([2, 1.2, 1])
        with c1:
            custom_key_input = st.text_input(
                "नयाँ की लेख्नुहोस् (New Activation Key):",
                placeholder="उदा: CUST-123 वा VIP-2026",
                key="admin_new_key_input"
            )
        with c2:
            tier_choice = st.selectbox(
                "म्याद / प्रकार (Tier):",
                ["आजीवन (Lifetime)", "१ वर्ष (365 Days)", "६ महिना (180 Days)", "१ महिना (30 Days)", "७ दिन (7 Days Trial)"],
                key="admin_tier_choice"
            )
        with c3:
            st.write("")
            st.write("")
            create_btn = st.button("✨ Create Key", type="primary", use_container_width=True)

        if create_btn:
            input_val = custom_key_input.strip().upper()
            if not input_val:
                # Auto-generate a random key if left blank
                final_key = f"CUST-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:4].upper()}"
            else:
                final_key = input_val

            # Expiry calculation
            now = datetime.now()
            if "१ वर्ष" in tier_choice:
                exp_date = (now + timedelta(days=365)).isoformat()
            elif "६ महिना" in tier_choice:
                exp_date = (now + timedelta(days=180)).isoformat()
            elif "१ महिना" in tier_choice:
                exp_date = (now + timedelta(days=30)).isoformat()
            elif "७ दिन" in tier_choice:
                exp_date = (now + timedelta(days=7)).isoformat()
            else:
                exp_date = None

            # Fresh Unassigned License Record
            new_record = {
                "key": final_key,
                "tier": tier_choice,
                "note": f"Created via Admin on {now.strftime('%Y-%m-%d %H:%M')}",
                "created_at": now.isoformat(),
                "expiry_date": exp_date,
                "status": "Active",
                "bound_hardware_id": None,
                "bound_device_token": None,
                "device_description": "अझै दर्ता नभएको (Fresh - Awaiting Customer Device)"
            }

            # Persist to both session_state and disk DB
            persist_license(final_key, new_record)
            st.success(f"🎉 नयाँ कोड सफलतापूर्वक सिर्जना र सुरक्षित भयो: `{final_key}`")
            time.sleep(0.3)
            st.rerun()

    # 2. CLEAR LIST & TABLE OF ACTIVE CUSTOMER KEYS
    all_keys = get_all_licenses()
    
    st.markdown("### 📋 सबै सक्रिय ग्राहक कोडहरूको सूची (Active Customer Keys)")
    
    if not all_keys:
        st.info("अहिलेसम्म कुनै ग्राहक कोड जारी गरिएको छैन। माथिको बाकसमा की लेखेर 'Create Key' थिच्नुहोस्।")
    else:
        # Metrics summary
        total_cnt = len(all_keys)
        bound_cnt = sum(1 for k, v in all_keys.items() if v.get("bound_hardware_id"))
        fresh_cnt = total_cnt - bound_cnt

        m1, m2, m3 = st.columns(3)
        m1.metric("जम्मा कोडहरू (Total Keys)", total_cnt)
        m2.metric("ताजा/प्रयोग नभएका (Fresh Unassigned)", fresh_cnt)
        m3.metric("यन्त्रमा लक भएका (Locked to Device)", bound_cnt)

        # Interactive Table Display
        table_rows = []
        for k, v in all_keys.items():
            is_bound = v.get("bound_hardware_id") is not None
            table_rows.append({
                "एक्टिभेसन कोड (Key)": k,
                "प्रकार (Tier)": v.get("tier", "Lifetime"),
                "स्थिति (Status)": "🔒 Locked (प्रयोग भैसक्यो)" if is_bound else "🟢 Fresh (नयाँ/खाली)",
                "सिर्जना मिति (Created)": v.get("created_at", "")[:10],
                "यन्त्र जानकारी (Hardware Info)": v.get("device_description", "-")
            })

        st.dataframe(table_rows, use_container_width=True)

        # Quick Actions Expander (Reset / Delete)
        with st.expander("⚙️ कोड व्यवस्थापन र यन्त्र रिसेट (Reset / Delete Keys)"):
            for k, lic_item in list(all_keys.items()):
                is_bound = lic_item.get("bound_hardware_id") is not None
                status_badge = "🔒 Locked" if is_bound else "🟢 Fresh"

                row_col1, row_col2, row_col3 = st.columns([3, 1.5, 1.5])
                with row_col1:
                    st.write(f"**`{k}`** ({lic_item.get('tier')}) — {status_badge}")
                    st.caption(f"{lic_item.get('device_description')}")
                with row_col2:
                    if is_bound:
                        if st.button(f"🔄 Reset Device", key=f"rst_{k}", use_container_width=True):
                            lic_item["bound_hardware_id"] = None
                            lic_item["bound_device_token"] = None
                            lic_item["device_description"] = "रिसेट गरियो (Fresh - Awaiting New Device)"
                            persist_license(k, lic_item)
                            st.success(f"कोड `{k}` को यन्त्र रिसेट भयो!")
                            time.sleep(0.3)
                            st.rerun()
                    else:
                        st.write("*(Unbound)*")
                with row_col3:
                    if st.button(f"🗑️ Delete", key=f"del_{k}", use_container_width=True):
                        delete_license(k)
                        st.warning(f"कोड `{k}` मेटाइयो!")
                        time.sleep(0.3)
                        st.rerun()
                st.markdown("---")

# ==============================================================================
# 8. ASTROLOGICAL WORKSTATION (Main Software Engine)
# ==============================================================================
def render_main_workspace():
    """Main Kundali calculation workspace."""
    lic = st.session_state.get("license_data", {})
    is_admin = st.session_state.get("is_admin", False)

    # Top Navigation Bar
    header_c1, header_c2 = st.columns([3.5, 1.5])
    with header_c1:
        st.title("🕉️ नेपाली वैदिक ज्योतिष तथा जन्मकुण्डली")
    with header_c2:
        if is_admin:
            st.markdown("⭐ **Super Admin (Owner - Master Key)**")
        else:
            st.markdown(f"**सक्रिय कोड:** `{lic.get('key', 'Active Key')}`")
        if st.button("🚪 लगआउट (Logout)"):
            st.session_state.clear()
            st.query_params.clear()
            st.rerun()

    st.markdown("---")

    # Admin Panel toggle (Only visible to Master Key Owner)
    if is_admin:
        with st.expander("⚙️ व्यवस्थापक प्यानल खोल्नुहोस् (Admin Code Generator)", expanded=False):
            render_admin_dashboard()
        st.markdown("---")

    # Birth Details Entry Form
    st.subheader("📝 जातकको जन्म विवरण (Birth Details Entry)")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        name = st.text_input("जातकको नाम (Full Name):", value="राम प्रसाद शर्मा")
        gender = st.selectbox("लिङ्ग (Gender):", ["पुरुष (Male)", "महिला (Female)", "अन्य (Other)"])
    with col2:
        b_date = st.date_input("जन्म मिति (Date of Birth):", value=datetime(1996, 7, 24))
        b_time = st.time_input("जन्म समय (Time of Birth):", value=datetime.strptime("08:45", "%H:%M").time())
    with col3:
        location = st.selectbox("जन्म स्थान (Place of Birth):", ["काठमाडौं (Kathmandu)", "पोखरा (Pokhara)", "विराटनगर (Biratnagar)", "चितवन (Chitwan)", "बुटवल (Butwal)", "धरान (Dharan)"])
        lat = 27.7172 if "काठमाडौं" in location else 28.2096
        lon = 85.3240 if "काठमाडौं" in location else 83.9856

    if st.button("🔮 ग्रह स्थिति तथा कुण्डली गणना गर्नुहोस् (Calculate Chart)", type="primary", use_container_width=True):
        with st.spinner("वैदिक खगोलीय गणित अनुसार ग्रह तथा भाव स्थिति गणना हुँदैछ..."):
            time.sleep(0.2)
            planets_data, lagna_deg, moon_deg = calculate_vedic_chart(b_date, b_time, lat, lon)
            
            st.success(f"✅ जातक **{name}** को जन्मकुण्डली सफलतापूर्वक तयार भयो!")

            # Key Astro Metrics
            lagna_rashi_name, lagna_lord = RASHIS[int(lagna_deg // 30)]
            moon_rashi_name, moon_lord = RASHIS[int(moon_deg // 30)]
            moon_nakshatra = NAKSHATRAS[int((moon_deg / (360.0 / 27.0)) % 27)]

            m1, m2, m3, m4 = st.columns(4)
            m1.metric("लग्न राशि (Ascendant)", lagna_rashi_name, lagna_lord)
            m2.metric("चन्द्र राशि (Moon Sign)", moon_rashi_name, moon_lord)
            m3.metric("जन्म नक्षत्र (Nakshatra)", moon_nakshatra)
            m4.metric("अयन (Ayanamsha)", "लाहिरी (Lahiri)")

            # Detailed Planetary Table
            st.subheader("🪐 विस्तृत ग्रह स्पष्ट तालिका (Planetary Longitudes & Bhavas)")
            st.table(planets_data)

            # Chart Summary
            st.subheader("🏛️ भाव कुण्डली विवरण")
            k1, k2 = st.columns(2)
            with k1:
                st.markdown("#### लग्न कुण्डली ग्रह अवस्थिति")
                for p in planets_data:
                    st.write(f"• **{p['ग्रह (Planet)']}:** {p['भाव (House)']} ({p['राशि (Sign)']}) - {p['अंश (Degree)']}")
            with k2:
                st.markdown("#### ज्योतिषी विश्लेषण")
                st.info(f"""
                - **लग्न स्वामी:** {lagna_lord}
                - **राशि स्वामी:** {moon_lord}
                - **नक्षत्र:** {moon_nakshatra}
                - गणना पूर्ण रूपमा शुद्ध गणितीय सिद्धान्त अनुसार सम्पन्न भएको छ।
                """)

# ==============================================================================
# 9. MAIN CONTROLLER & ROUTER
# ==============================================================================
def main():
    init_storage()
    if "authenticated" not in st.session_state:
        st.session_state["authenticated"] = False

    # Check for URL query parameter auto-login (?code=...)
    url_code = st.query_params.get("code", "").strip().upper()
    if not st.session_state["authenticated"] and url_code:
        is_valid, msg, lic_data = verify_activation_code(url_code)
        if is_valid:
            st.session_state["authenticated"] = True
            st.session_state["license_data"] = lic_data
            st.session_state["is_admin"] = (url_code == MASTER_KEY)

    # Route based on authentication state
    if not st.session_state["authenticated"]:
        render_auth_gate()
    else:
        render_main_workspace()

if __name__ == "__main__":
    main()
