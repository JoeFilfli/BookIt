import Link from "next/link";
import {
  UtensilsCrossed, Wine, Ticket, Landmark, Compass,
  Trophy, GraduationCap, Scissors, Sparkles, Leaf, Heart,
  Instagram, Facebook,
} from "lucide-react";

const CATEGORIES = [
  { slug: "food", name: "Food", icon: UtensilsCrossed },
  { slug: "nightlife", name: "Nightlife", icon: Wine },
  { slug: "events", name: "Events", icon: Ticket },
  { slug: "attractions-tourism", name: "Attractions & Tourism", icon: Landmark },
  { slug: "activities-experiences", name: "Activities & Experiences", icon: Compass },
  { slug: "courts-sports", name: "Courts & Sports", icon: Trophy },
  { slug: "studios-classes", name: "Studios & Classes", icon: GraduationCap },
  { slug: "men-care", name: "Men Care", icon: Scissors },
  { slug: "women-care", name: "Women Care", icon: Sparkles },
  { slug: "wellness", name: "Wellness", icon: Leaf },
  { slug: "health-care", name: "Health & Care", icon: Heart },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--color-primary)", color: "white" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1 — Brand */}
          <div>
            <div className="text-2xl font-extrabold mb-2">
              <span className="text-white">Book</span>
              <span style={{ color: "var(--color-accent)" }}>It</span>
            </div>
            <p style={{ color: "var(--color-text-on-dark-muted)" }} className="text-sm">
              Book it. Live it.
            </p>
            <p style={{ color: "var(--color-text-on-dark-muted)" }} className="text-sm mt-3 leading-relaxed">
              Lebanon&apos;s booking marketplace for sports, wellness, dining, and more.
            </p>
          </div>

          {/* Col 2 — Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-on-dark-muted)" }}>
              Categories
            </h4>
            <ul className="space-y-2">
              {CATEGORIES.map(({ slug, name }) => (
                <li key={slug}>
                  <Link
                    href={`/${slug}`}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "var(--color-text-on-dark-muted)" }}
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-on-dark-muted)" }}>
              Company
            </h4>
            <ul className="space-y-2">
              {["About", "Contact", "Terms", "Privacy"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "var(--color-text-on-dark-muted)" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — For Businesses */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-on-dark-muted)" }}>
              For Businesses
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/create"
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "var(--color-text-on-dark-muted)" }}
                >
                  List Your Business
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "var(--color-text-on-dark-muted)" }}
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-on-dark-muted)" }}>
            © {new Date().getFullYear()} BookIt. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: "var(--color-text-on-dark-muted)" }}
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: "var(--color-text-on-dark-muted)" }}
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            {/* WhatsApp */}
            <a
              href="#"
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: "var(--color-text-on-dark-muted)" }}
              aria-label="WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
