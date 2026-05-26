import os
import json
import logging
from dataclasses import dataclass, asdict
from typing import Optional
import re
import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


SERPAPI_KEY: Optional[str] = os.getenv("SERP_API_KEY")
SERPAPI_URL = "https://serpapi.com/search.json"
REQUEST_TIMEOUT = 15

SCORE_HOT  = 80
SCORE_WARM = 50

WEIGHT_WEBSITE_PRESENT = 30
WEIGHT_WEBSITE_ABSENT  = 10
WEIGHT_PHONE           = 20
WEIGHT_EMAIL           = 20
WEIGHT_RATING_HIGH     = 20   # rating >= 4.5
WEIGHT_RATING_MID      = 10   # rating >= 4.0
WEIGHT_REVIEWS_HIGH    = 15   # reviews > 100
WEIGHT_REVIEWS_MID     = 10   # reviews > 50
WEIGHT_BASE_BONUS      =  5
MAX_SCORE              = 100

# ──────────────────────────────────────────────────────────────
# Junk email filters
# ──────────────────────────────────────────────────────────────

# Domains that are never real contact addresses
JUNK_DOMAINS = {
    "sentry.io", "wixpress.com", "sentry.wixpress.com",
    "example.com", "test.com", "domain.com", "yoursite.com",
    "mailchimp.com", "sendgrid.net", "amazonses.com",
    "noreply.com", "no-reply.com", "bounce.com",
    "w3.org", "schema.org", "google.com", "googleapis.com",
    "cloudflare.com", "wordpress.com", "squarespace.com",
    "godaddy.com", "wix.com", "shopify.com",
}

# Substrings in the local part that indicate non-contact emails
JUNK_LOCAL_PARTS = {
    "noreply", "no-reply", "donotreply", "do-not-reply",
    "mailer", "bounce", "postmaster", "webmaster",
    "example", "test", "dummy", "placeholder",
    "unsubscribe", "notification", "alert",
    "wordpress", "woocommerce", "shopify",
}

# Regex patterns that look like system/hash addresses
JUNK_PATTERNS = [
    re.compile(r"^[a-f0-9]{16,}@"),   # long hex hashes (e.g. Sentry IDs)
    re.compile(r"^\d{6,}@"),           # purely numeric local parts
    re.compile(r"@.*\.(cdn|tracking|mail\d+)\.", re.I),
]


def _is_junk_email(email: str) -> bool:
    """Return True if the email looks like a system/tracker address."""
    email = email.lower().strip()
    local, _, domain = email.partition("@")

    if domain in JUNK_DOMAINS:
        return True

    # Catch subdomains of known junk domains
    if any(domain.endswith("." + jd) for jd in JUNK_DOMAINS):
        return True

    if any(junk in local for junk in JUNK_LOCAL_PARTS):
        return True

    if any(pattern.search(email) for pattern in JUNK_PATTERNS):
        return True

    return False


def _domain_of(url: str) -> str:
    """Extract bare domain from a URL, e.g. 'https://foo.com/bar' → 'foo.com'."""
    url = re.sub(r"^https?://", "", url, flags=re.I)
    return url.split("/")[0].lower().lstrip("www.")


@dataclass
class Lead:
    business_name: str
    category: str
    address: str
    rating: float
    reviews: int
    website: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    lead_score: int
    lead_type: str

    def to_dict(self) -> dict:
        return asdict(self)


# Email Scraping
EMAIL_REGEX = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
)


def extract_email_from_website(url: Optional[str]) -> Optional[str]:
    """
    Scrape a business website for a genuine contact email.

    Strategy:
      1. Fetch the page HTML.
      2. Extract all email-like strings via regex.
      3. Remove system/tracker/junk addresses.
      4. Prefer emails whose domain matches the website's own domain.
      5. Return the best candidate, or None.

    Args:
        url: The business website URL.

    Returns:
        A clean contact email string, or None if none found.
    """
    if not url:
        return None

    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        html = response.text
    except Exception:
        return None

    raw_emails = list(set(EMAIL_REGEX.findall(html)))
    clean_emails = [e for e in raw_emails if not _is_junk_email(e)]

    if not clean_emails:
        return None

    # Strongly prefer an email on the business's own domain
    site_domain = _domain_of(url)
    own_domain_emails = [
        e for e in clean_emails
        if e.lower().endswith("@" + site_domain)
    ]

    if own_domain_emails:
        return own_domain_emails[0]

    # Fall back to first remaining clean email
    return clean_emails[0]


# Lead Scoring
def calculate_lead_score(has_website: bool, has_phone: bool, has_email: bool, rating: float = 0.0, reviews: int = 0) -> int:
    """
    Score a lead out of 100 based on digital presence and social proof.

    Args:
        has_website: Whether the business has a website.
        has_phone:   Whether a phone number is available.
        has_email:   Whether a verified contact email is available.
        rating:      Average star rating (0–5).
        reviews:     Total number of reviews.

    Returns:
        Integer score capped at MAX_SCORE.
    """
    score = WEIGHT_BASE_BONUS
    score += WEIGHT_WEBSITE_PRESENT if has_website else WEIGHT_WEBSITE_ABSENT
    if has_phone:
        score += WEIGHT_PHONE
    if has_email:
        score += WEIGHT_EMAIL

    if rating >= 4.5:
        score += WEIGHT_RATING_HIGH
    elif rating >= 4.0:
        score += WEIGHT_RATING_MID

    if reviews > 100:
        score += WEIGHT_REVIEWS_HIGH
    elif reviews > 50:
        score += WEIGHT_REVIEWS_MID

    return min(score, MAX_SCORE)


def get_lead_type(score: int) -> str:
    """Classify a lead as HOT, WARM, or COLD based on its score."""
    if score >= SCORE_HOT:
        return "HOT"
    if score >= SCORE_WARM:
        return "WARM"
    return "COLD"


# API Interaction
def _build_lead(place: dict) -> Lead:
    """Convert a raw SerpAPI place dict into a scored Lead object."""
    rating  = float(place.get("rating") or 0)
    reviews = int(place.get("reviews") or 0)
    website = place.get("website")
    phone   = place.get("phone")

    email     = extract_email_from_website(website)
    has_email = bool(email)

    score = calculate_lead_score(
        has_website=bool(website),
        has_phone=bool(phone),
        has_email=has_email,
        rating=rating,
        reviews=reviews,
    )

    return Lead(
        business_name=place.get("title", "Unknown"),
        category=place.get("type", "N/A"),
        address=place.get("address", "N/A"),
        rating=rating,
        reviews=reviews,
        website=website,
        phone=phone,
        email=email,
        lead_score=score,
        lead_type=get_lead_type(score),
    )


def fetch_leads(max_results: int, industry: str, location: str) -> list[dict]:
    """
    Query SerpAPI's Google Maps engine and return scored lead dictionaries.

    Args:
        query:       Primary search term (e.g. "restaurants").
        max_results: Maximum number of leads to return.
        industry:    Industry or niche to narrow the search.
        location:    Target city or region.

    Returns:
        List of lead dicts.

    Raises:
        EnvironmentError: If SERP_API_KEY is not configured.
        requests.HTTPError: If the API returns a non-2xx response.
        ValueError: If max_results < 1.
    """
    if not SERPAPI_KEY:
        raise EnvironmentError(
            "SERP_API_KEY is not set. Export it as an environment variable before running."
        )

    if max_results < 1:
        raise ValueError("max_results must be a positive integer.")

    search_query = f"{industry} in {location}"
    logger.info("Searching: %r", search_query)

    params = {
        "engine":  "google_maps",
        "q":       search_query,
        "type":    "search",
        "api_key": SERPAPI_KEY,
    }

    response = requests.get(SERPAPI_URL, params=params, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()

    data   = response.json()
    places = data.get("local_results", [])

    if not places:
        logger.warning("No results returned for query: %r", search_query)
        return []

    leads = [_build_lead(place) for place in places[:max_results]]

    logger.info(
        "Fetched %d lead(s) — HOT: %d | WARM: %d | COLD: %d",
        len(leads),
        sum(1 for l in leads if l.lead_type == "HOT"),
        sum(1 for l in leads if l.lead_type == "WARM"),
        sum(1 for l in leads if l.lead_type == "COLD"),
    )

    return [lead.to_dict() for lead in leads]


# CLI Entry Point
def _get_positive_int(prompt: str) -> int:
    """Prompt until the user enters a valid positive integer."""
    while True:
        try:
            value = int(input(prompt).strip())
            if value > 0:
                return value
            print("  ✗ Please enter a number greater than 0.")
        except ValueError:
            print("  ✗ Invalid input — please enter a whole number.")


def main() -> None:
    print("║   LEAD GENERATION TOOL       ║")

    industry    = input("Industry       : ").strip()
    max_results = _get_positive_int("Max results    : ")
    location    = input("Location       : ").strip()

    print()

    try:
        results = fetch_leads(max_results, industry, location)
        print(json.dumps(results, indent=4))
    except EnvironmentError as e:
        logger.error("Configuration error: %s", e)
    except requests.HTTPError as e:
        logger.error("API request failed: %s", e)
    except requests.Timeout:
        logger.error("Request timed out after %ds. Try again later.", REQUEST_TIMEOUT)
    except Exception as e:
        logger.exception("Unexpected error: %s", e)


if __name__ == "__main__":
    main()