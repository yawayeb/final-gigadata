const MaintenancePage = () => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.iconWrapper}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            style={styles.icon}
            aria-hidden="true"
          >
            <circle cx="32" cy="32" r="30" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
            <path
              d="M44 20a4 4 0 0 0-5.66 0l-2.12 2.12-2.83-2.83 2.12-2.12A8 8 0 0 0 24.34 28.2L16 36.54A4 4 0 0 0 21.46 42l8.34-8.34A8 8 0 0 0 44 22.34z"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="20" cy="44" r="2" fill="#3B82F6" />
          </svg>
        </div>

        {/* Heading */}
        <h1 style={styles.heading}>Website Under Maintenance</h1>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Message */}
        <p style={styles.message}>
          We are currently upgrading our system to serve you better.
          <br />
          Please check back shortly.
        </p>

        {/* Urgent section */}
        <div style={styles.urgentBox}>
          <p style={styles.urgentHeading}>Need to place an order urgently?</p>
          <p style={styles.urgentSub}>
            Contact our admin directly on WhatsApp and we'll handle your order manually.
          </p>
          <a
            href="https://wa.me/233530463170"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.whatsappBtn}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#16a34a";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 6px 20px rgba(34,197,94,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#22c55e";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 4px 14px rgba(34,197,94,0.35)";
            }}
          >
            <WhatsAppIcon />
            Contact Admin on WhatsApp
          </a>
        </div>

        {/* Footer note */}
        <p style={styles.footer}>Thank you for your patience.</p>
      </div>
    </div>
  );
};

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    width="20"
    height="20"
    fill="white"
    style={{ flexShrink: 0 }}
    aria-hidden="true"
  >
    <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.666 4.797 1.822 6.793L2 30l7.418-1.797A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.55 11.55 0 0 1-5.895-1.613l-.423-.25-4.404 1.066 1.1-4.282-.277-.44A11.538 11.538 0 0 1 4.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6zm6.327-8.664c-.347-.173-2.054-1.013-2.373-1.13-.32-.116-.552-.173-.784.173-.231.347-.896 1.13-1.099 1.362-.202.232-.405.26-.751.087-.347-.173-1.463-.54-2.788-1.719-1.03-.918-1.726-2.052-1.928-2.399-.202-.347-.022-.534.152-.707.156-.155.347-.405.52-.607.174-.202.232-.347.347-.578.116-.231.058-.434-.029-.607-.087-.173-.784-1.89-1.073-2.588-.283-.68-.57-.587-.784-.598l-.667-.012c-.231 0-.607.087-.925.434-.318.347-1.216 1.188-1.216 2.897s1.245 3.36 1.418 3.592c.173.231 2.451 3.741 5.94 5.247.83.358 1.479.572 1.984.732.833.265 1.592.228 2.19.138.668-.1 2.054-.84 2.344-1.652.29-.812.29-1.508.203-1.652-.087-.144-.318-.231-.665-.404z" />
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
    padding: "48px 40px",
    maxWidth: "520px",
    width: "100%",
    textAlign: "center",
  },
  iconWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  },
  icon: {
    width: "80px",
    height: "80px",
  },
  heading: {
    fontSize: "clamp(22px, 5vw, 30px)",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 16px 0",
    letterSpacing: "-0.5px",
  },
  divider: {
    width: "60px",
    height: "4px",
    background: "linear-gradient(90deg, #3B82F6, #22c55e)",
    borderRadius: "2px",
    margin: "0 auto 24px auto",
  },
  message: {
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#475569",
    margin: "0 0 32px 0",
  },
  urgentBox: {
    background: "#F0FDF4",
    border: "1px solid #bbf7d0",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "28px",
  },
  urgentHeading: {
    fontSize: "17px",
    fontWeight: "600",
    color: "#166534",
    margin: "0 0 8px 0",
  },
  urgentSub: {
    fontSize: "14px",
    color: "#4b7a5c",
    margin: "0 0 20px 0",
    lineHeight: "1.6",
  },
  whatsappBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#22c55e",
    color: "#ffffff",
    textDecoration: "none",
    padding: "13px 28px",
    borderRadius: "50px",
    fontWeight: "600",
    fontSize: "15px",
    boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
    transition: "background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  },
  footer: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "0",
  },
};

export default MaintenancePage;
